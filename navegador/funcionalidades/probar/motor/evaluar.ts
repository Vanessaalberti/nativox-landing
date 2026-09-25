import type { Idioma, Resultado } from "@nativox/compartido/contratos";
import { abrirEntrada, FRECUENCIA } from "@nativox/navegador/modulos/captura-audio";
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
  // Segundos que faltan de la grabación de la voz de quien evalúa.
  | { etapa: "grabando"; quedan: number }
  | { etapa: "descargando"; avance: AvanceDescarga }
  | ({ etapa: "transcribiendo" | "traduciendo" } & Pick<PasoDeMedicion, "hecho" | "total">)
  // Idioma al que se está midiendo la traducción (para decirlo).
  | { etapa: "traduciendo-a"; idioma: Idioma };

// La medición usa la voz de quien evalúa (nada de audios nuestros): una pasada de Whisper tarda
// distinto con voz real que con silencio, porque el decodificador genera texto.
const SEGUNDOS_DE_VOZ = 6;
// Sobre qué se mide la traducción: una frase corta en el idioma de la persona, hacia los otros dos.
const FRASES: Record<Idioma, string> = {
  es: "Hoy vamos a hablar de cómo desplegar una aplicación en Cloudflare y de qué hacer si algo falla.",
  en: "Today we are going to talk about how to deploy an application on Cloudflare and what to do if something fails.",
  pt: "Hoje vamos falar sobre como implantar uma aplicação na Cloudflare e o que fazer se algo falhar.",
};

export async function evaluarEquipo(
  hablado: Idioma,
  alAvanzar: (avance: AvanceEvaluacion) => void,
): Promise<Resultado<Evaluacion>> {
  alAvanzar({ etapa: "detectando" });
  const equipo = await detectarEquipo();
  if (!equipo.webgpu) {
    return { ok: true, valor: { equipo, medidas: null, recomendacion: recomendar(equipo, null) } };
  }

  // Primero la voz (la persona está frente a la pantalla y espera este paso); la descarga de los
  // modelos, que puede tardar minutos, va después.
  // Se avisa el paso antes de pedir el micrófono: si el permiso falla, el error dice dónde.
  alAvanzar({ etapa: "grabando", quedan: SEGUNDOS_DE_VOZ });
  const voz = await grabarVoz(SEGUNDOS_DE_VOZ, (quedan) =>
    alAvanzar({ etapa: "grabando", quedan }),
  );
  if (!voz.ok) return voz;

  const destinos = (["es", "en", "pt"] as const).filter((idioma) => idioma !== hablado);
  // Los modelos quedan cargados: después de evaluar, probar arranca al instante.
  const listos = await prepararModelos(
    { de: hablado, a: destinos, traductor: "bergamot" },
    (avance) => alAvanzar({ etapa: "descargando", avance }),
  );
  if (!listos.ok) return listos;

  const { modelos, traductor } = listos.valor;
  const medidas = await medirEquipo(
    {
      transcribirMuestra: async () => {
        const resultado = await modelos.transcribir(voz.valor.slice(), {
          prompt: "",
          idioma: hablado,
        });
        return resultado.ok ? { ok: true, valor: { ms: resultado.valor.ms } } : resultado;
      },
      traducirMuestra: async (destino) => {
        alAvanzar({ etapa: "traduciendo-a", idioma: destino });
        const inicio = performance.now();
        const resultado = await traductor.traducir(FRASES[hablado], hablado, destino);
        return resultado.ok ? { ok: true, valor: { ms: performance.now() - inicio } } : resultado;
      },
    },
    destinos,
    (paso) => alAvanzar(paso),
  );
  if (!medidas.ok) return medidas;
  return {
    ok: true,
    valor: { equipo, medidas: medidas.valor, recomendacion: recomendar(equipo, medidas.valor) },
  };
}

// Graba `segundos` de la voz de quien evalúa. Termina sola.
async function grabarVoz(
  segundos: number,
  alContar: (quedan: number) => void,
): Promise<Resultado<Float32Array>> {
  const bloques: Float32Array[] = [];
  const captura = await abrirEntrada(null, {
    conFiltrosDeVoz: true,
    alRecibir: (bloque) => bloques.push(bloque),
    alTerminar: () => undefined,
  });
  if (!captura.ok) return captura;

  const total = segundos * FRECUENCIA;
  await new Promise<void>((seguir) => {
    const inicio = performance.now();
    const reloj = setInterval(() => {
      const transcurridos = (performance.now() - inicio) / 1000;
      alContar(Math.max(0, Math.ceil(segundos - transcurridos)));
      if (transcurridos >= segundos) {
        clearInterval(reloj);
        seguir();
      }
    }, 200);
    alContar(segundos);
  });
  captura.valor.detener();

  const voz = new Float32Array(
    Math.min(
      total,
      bloques.reduce((s, b) => s + b.length, 0),
    ),
  );
  let posicion = 0;
  for (const bloque of bloques) {
    if (posicion >= voz.length) break;
    voz.set(bloque.subarray(0, voz.length - posicion), posicion);
    posicion += bloque.length;
  }
  return { ok: true, valor: voz };
}
