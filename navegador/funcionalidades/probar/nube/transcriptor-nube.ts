import { IDIOMAS, type Idioma } from "@nativox/compartido/contratos";
import { FRECUENCIA } from "@nativox/navegador/modulos/captura-audio";
import type { Transcriptor } from "@nativox/navegador/modulos/transcripcion";
import { aWav } from "../../../../contratos-landing/wav";
import { transcribirEnLaNube } from "./cliente-nube";

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
    async transcribir(audio, { prompt, idioma }) {
      if (!esIdioma(idioma)) return { ok: false, motivo: `Idioma no soportado: ${idioma}` };
      const inicio = performance.now();
      const respuesta = await transcribirEnLaNube(aWav(audio, FRECUENCIA), idioma, prompt);
      if (!respuesta.ok) {
        if (respuesta.codigo === "sin-cupo")
          eventos.alAgotarseElCupo(respuesta.reintentarEnSegundos);
        return { ok: false, motivo: respuesta.mensaje };
      }
      eventos.alQuedarCupo(respuesta.restantes);
      return { ok: true, valor: { texto: respuesta.texto, ms: performance.now() - inicio } };
    },
  };
}

function esIdioma(valor: string): valor is Idioma {
  return (IDIOMAS as readonly string[]).includes(valor);
}
