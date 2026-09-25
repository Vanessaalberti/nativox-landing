import { IDIOMAS, type Idioma } from "@nativox/compartido/contratos";
import { FRECUENCIA } from "@nativox/navegador/modulos/captura-audio";
import type { Transcriptor } from "@nativox/navegador/modulos/transcripcion";
import type { RespuestaTranscripcion } from "../../../../contratos-landing/nube";
import { aWav } from "../../../../contratos-landing/wav";
import { transcribirEnLaNube, type AudioEnviado } from "./cliente-nube";
import { codificarEnOgg, opusDisponible } from "./codificador-opus";

export interface EventosTranscriptorNube {
  // Después de cada pedido: los segundos de audio que le quedan de cupo a este dispositivo.
  alQuedarCupo: (segundos: number) => void;
  alAgotarseElCupo: (reintentarEnSegundos: number) => void;
}

// Whisper large-v3 turbo en Workers AI con la misma interfaz que el motor local: el corte en
// pausas, el contexto, el filtro de alucinaciones y la traducción son los del resto de la app.
export function crearTranscriptorNube(eventos: EventosTranscriptorNube): Transcriptor {
  return {
    info: { nombre: "Whisper turbo (Workers AI)", local: false, vadPropio: true },
    async transcribir(audio, { prompt, idioma, segundosDeContexto = 0 }) {
      if (!esIdioma(idioma)) return { ok: false, motivo: `Idioma no soportado: ${idioma}` };
      const inicio = performance.now();
      const respuesta = await transcribirEnLaNube(await empaquetar(audio), idioma, prompt);
      if (!respuesta.ok) {
        if (respuesta.codigo === "sin-cupo")
          eventos.alAgotarseElCupo(respuesta.reintentarEnSegundos);
        return { ok: false, motivo: respuesta.mensaje };
      }
      eventos.alQuedarCupo(respuesta.restantes);
      return {
        ok: true,
        valor: {
          texto: sinElContexto(respuesta, segundosDeContexto),
          ms: performance.now() - inicio,
        },
      };
    },
  };
}

async function empaquetar(audio: Float32Array): Promise<AudioEnviado> {
  if (await opusDisponible()) {
    try {
      return { datos: await codificarEnOgg(audio), tipo: "audio/ogg" };
    } catch {
      // Si el codificador falla con este fragmento, va en WAV.
    }
  }
  return { datos: aWav(audio, FRECUENCIA), tipo: "audio/wav" };
}

// Al fragmento se le pegan adelante los últimos 1,5 s del anterior para que Whisper entienda de
// dónde viene; esas palabras ya se mostraron. Workers AI devuelve el horario de cada una, así que
// se sacan las que quedan dentro del tramo de contexto (sin comparar texto, que es más frágil).
export function sinElContexto(
  respuesta: Extract<RespuestaTranscripcion, { ok: true }>,
  segundosDeContexto: number,
): string {
  if (segundosDeContexto <= 0 || respuesta.palabras.length === 0) return respuesta.texto;
  return respuesta.palabras
    .filter((palabra) => (palabra.inicio + palabra.fin) / 2 >= segundosDeContexto)
    .map((palabra) => palabra.palabra)
    .join("")
    .trim();
}

function esIdioma(valor: string): valor is Idioma {
  return (IDIOMAS as readonly string[]).includes(valor);
}
