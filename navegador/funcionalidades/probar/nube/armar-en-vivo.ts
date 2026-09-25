import type { Idioma, Linea, Resultado } from "@nativox/compartido/contratos";
import { abrirEntrada } from "@nativox/navegador/modulos/captura-audio";
import { crearCortador } from "@nativox/navegador/modulos/cortador-audio";
import { crearFlujoSubtitulos } from "@nativox/navegador/modulos/flujo-subtitulos";
import {
  borrarSuperposicion,
  crearAcuerdoLocal,
  transcribirSinAlucinaciones,
} from "@nativox/navegador/modulos/transcripcion";
import {
  crearCola,
  traducirConContexto,
  ultimoTramoSinCerrar,
  type Traductor,
} from "@nativox/navegador/modulos/traduccion";
import type { PruebaArmada } from "../motor/armar-prueba";
import { crearTranscriptorNube, type EventosTranscriptorNube } from "./transcriptor-nube";

// El laboratorio dejó la nube en cortes de 4 a 8 s para cuidar el límite de pedidos de una sala en
// vivo. La portada es una demo de 15 s por visitante: prioriza la respuesta rápida, con cortes de
// ~1,5 a 2 s (el mínimo sube solo si la nube tarda más) y dos pasadas, como el modo local:
// una provisoria cada 1,5 s, casi invisible, y la confirmada al cortar la frase.
const MINIMO_SEGUNDOS = 1.5;
const PASADA_PROVISORIA_MS = 1500;

export interface ConfiguracionEnVivo {
  idiomaHablado: Idioma;
  // Solo si se pide otro idioma: el traductor ya cargado.
  traduccion: { idioma: Idioma; traductor: Traductor } | null;
}

export interface EventosEnVivo extends EventosTranscriptorNube {
  alCambiarLinea: (linea: Linea) => void;
  alFallar: (motivo: string) => void;
  alTerminarCaptura: (motivo: string) => void;
}

// La portada arma el mismo flujo que la sesión en vivo de la aplicación (captura → cortador en
// pausas → transcripción con texto provisorio → traducción); solo cambia el motor: Whisper turbo en
// Workers AI, con el mismo contexto de texto y de audio y el mismo filtro de alucinaciones.
export async function armarEnVivo(
  configuracion: ConfiguracionEnVivo,
  eventos: EventosEnVivo,
): Promise<Resultado<PruebaArmada>> {
  const transcriptor = crearTranscriptorNube(eventos);
  const cola = crearCola();
  const { traduccion } = configuracion;

  const flujo = crearFlujoSubtitulos({
    idSesion: "nube",
    idiomaOriginal: configuracion.idiomaHablado,
    idiomasDestino: traduccion ? [traduccion.idioma] : [],
    glosario: [],
    pasadaProvisoriaCadaMs: PASADA_PROVISORIA_MS,
    cortador: crearCortador({ minimoSegundos: MINIMO_SEGUNDOS }),
    transcribir: (audio, opciones) => transcribirSinAlucinaciones(transcriptor, audio, opciones),
    quitarRepetido: borrarSuperposicion,
    crearAcuerdo: crearAcuerdoLocal,
    traducir: ({ texto, anterior, de, a }) =>
      traduccion
        ? cola(() =>
            traducirConContexto(traduccion.traductor, {
              texto,
              contexto: ultimoTramoSinCerrar(anterior),
              glosario: [],
              de,
              a,
            }),
          )
        : Promise.resolve({ ok: false, motivo: "No se pidió traducción" }),
    ahoraMs: () => performance.now(),
    alCambiarLinea: eventos.alCambiarLinea,
    alMedir: () => undefined,
    alFallar: eventos.alFallar,
  });

  const captura = await abrirEntrada(null, {
    alRecibir: (bloque) => flujo.agregarAudio(bloque),
    alTerminar: eventos.alTerminarCaptura,
  });
  if (!captura.ok) return captura;
  return { ok: true, valor: { captura: captura.valor, flujo } };
}
