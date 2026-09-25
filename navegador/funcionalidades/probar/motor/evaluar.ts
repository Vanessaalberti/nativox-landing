import type { Idioma, Resultado } from "@nativox/compartido/contratos";
import { FRECUENCIA } from "@nativox/navegador/modulos/captura-audio";
import {
  detectarEquipo,
  medirEquipo,
  recomendar,
  type Equipo,
  type Medidas,
  type PasoDeMedicion,
  type Recomendacion,
} from "@nativox/navegador/modulos/evaluar-equipo";
import { prepararModelos, type AvanceDescarga } from "./preparar-modelos";

export interface Evaluacion {
  equipo: Equipo;
  // null si el equipo no puede correr Whisper (no hubo nada que medir).
  medidas: Medidas | null;
  recomendacion: Recomendacion;
}

export type AvanceEvaluacion =
  | { etapa: "detectando" }
  | { etapa: "descargando"; avance: AvanceDescarga }
  | ({ etapa: "transcribiendo" | "traduciendo" } & Pick<PasoDeMedicion, "hecho" | "total">)
  // Idioma al que se está midiendo la traducción (para decirlo).
  | { etapa: "traduciendo-a"; idioma: Idioma };

// La muestra está dicha en español y se traduce a los otros dos idiomas: son los que usa la prueba.
const IDIOMA_DE_LA_MUESTRA: Idioma = "es";
const IDIOMAS_DESTINO: readonly Idioma[] = ["en", "pt"];
const FRASE_DE_LA_MUESTRA =
  "Hoy vamos a hablar de cómo desplegar una aplicación en Cloudflare. Abrimos un pull request en GitHub, y si algo falla, hacemos rollback.";
const ARCHIVO_DE_LA_MUESTRA = "/muestra-equipo.wav";

export async function evaluarEquipo(
  alAvanzar: (avance: AvanceEvaluacion) => void,
): Promise<Resultado<Evaluacion>> {
  alAvanzar({ etapa: "detectando" });
  const equipo = await detectarEquipo();
  if (!equipo.webgpu) {
    return { ok: true, valor: { equipo, medidas: null, recomendacion: recomendar(equipo, null) } };
  }

  // Los modelos quedan cargados: después de evaluar, probar arranca al instante.
  const listos = await prepararModelos({ de: IDIOMA_DE_LA_MUESTRA, a: IDIOMAS_DESTINO }, (avance) =>
    alAvanzar({ etapa: "descargando", avance }),
  );
  if (!listos.ok) return listos;
  const muestra = await cargarMuestra();
  if (!muestra.ok) return muestra;

  const { modelos, traductor } = listos.valor;
  const medidas = await medirEquipo(
    {
      transcribirMuestra: async () => {
        const resultado = await modelos.transcribir(muestra.valor.slice(), {
          prompt: "",
          idioma: IDIOMA_DE_LA_MUESTRA,
        });
        return resultado.ok ? { ok: true, valor: { ms: resultado.valor.ms } } : resultado;
      },
      traducirMuestra: async (destino) => {
        alAvanzar({ etapa: "traduciendo-a", idioma: destino });
        const inicio = performance.now();
        const resultado = await traductor.traducir(
          FRASE_DE_LA_MUESTRA,
          IDIOMA_DE_LA_MUESTRA,
          destino,
        );
        return resultado.ok ? { ok: true, valor: { ms: performance.now() - inicio } } : resultado;
      },
    },
    IDIOMAS_DESTINO,
    (paso) => alAvanzar(paso),
  );
  if (!medidas.ok) return medidas;
  return {
    ok: true,
    valor: {
      equipo,
      medidas: medidas.valor,
      recomendacion: recomendar(equipo, medidas.valor),
    },
  };
}

async function cargarMuestra(): Promise<Resultado<Float32Array>> {
  const contexto = new AudioContext({ sampleRate: FRECUENCIA });
  try {
    const respuesta = await fetch(ARCHIVO_DE_LA_MUESTRA);
    if (!respuesta.ok) {
      return {
        ok: false,
        motivo: `No se pudo bajar el audio de muestra (${String(respuesta.status)}).`,
      };
    }
    const audio = await contexto.decodeAudioData(await respuesta.arrayBuffer());
    return { ok: true, valor: audio.getChannelData(0).slice() };
  } catch (error) {
    return {
      ok: false,
      motivo: `No se pudo leer el audio de muestra (${error instanceof Error ? error.message : String(error)}).`,
    };
  } finally {
    await contexto.close();
  }
}
