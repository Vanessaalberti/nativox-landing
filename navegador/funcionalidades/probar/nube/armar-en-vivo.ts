import type { Idioma, Linea, Resultado } from "@nativox/compartido/contratos";
import { abrirEntrada } from "@nativox/navegador/modulos/captura-audio";
import { crearCortador } from "@nativox/navegador/modulos/cortador-audio";
import { crearFlujoSubtitulos } from "@nativox/navegador/modulos/flujo-subtitulos";
import {
  crearAcuerdoLocal,
  transcribirSinAlucinaciones,
} from "@nativox/navegador/modulos/transcripcion";
import {
  crearCola,
  traducirConContexto,
  ultimoTramoSinCerrar,
  type Traductor,
} from "@nativox/navegador/modulos/traduccion";
import { GLOSARIO_TECNICO } from "./glosario-tecnico";
import type { PruebaArmada } from "../motor/armar-prueba";
import { conFlujo } from "../motor/cerrar-prueba";
import { crearTranscriptorNube, type EventosTranscriptorNube } from "./transcriptor-nube";

// La sesión en vivo deja la nube en cortes de 4 a 8 s para cuidar el límite de pedidos de una sala en
// vivo. La portada es una demo de 15 s por visitante: prioriza la respuesta rápida, con cortes de
// ~1 s en la primera pausa y dos pasadas, como el modo local: una provisoria cada 1 s, casi
// invisible, y la confirmada al cortar la frase.
const MINIMO_SEGUNDOS = 1;
const PASADA_PROVISORIA_MS = 1000;

export interface ConfiguracionEnVivo {
  // Identifica esta prueba ante el servidor: todos sus pedidos cuentan como uno.
  idPrueba: string;
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
  const transcriptor = crearTranscriptorNube(configuracion.idPrueba, eventos);
  const cola = crearCola();
  const cortador = crearCortador({ minimoSegundos: MINIMO_SEGUNDOS });
  const { traduccion } = configuracion;

  const flujo = crearFlujoSubtitulos({
    idSesion: "nube",
    idiomaOriginal: configuracion.idiomaHablado,
    idiomasDestino: traduccion ? [traduccion.idioma] : [],
    glosario: GLOSARIO_TECNICO,
    pasadaProvisoriaCadaMs: PASADA_PROVISORIA_MS,
    // El mínimo es fijo: el ajuste por velocidad (1,5 a 4 s) es para el motor local.
    cortador: { ...cortador, cambiarMinimo: () => undefined },
    transcribir: (audio, opciones) => transcribirSinAlucinaciones(transcriptor, audio, opciones),
    // El transcriptor de la nube ya saca el audio de contexto por el horario de cada palabra.
    quitarRepetido: (_anterior, nuevo) => nuevo,
    crearAcuerdo: crearAcuerdoLocal,
    traducir: ({ texto, anterior, de, a }) =>
      traduccion
        ? cola(() =>
            traducirConContexto(traduccion.traductor, {
              texto,
              contexto: ultimoTramoSinCerrar(anterior),
              glosario: GLOSARIO_TECNICO,
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

  return conFlujo(
    await abrirEntrada(null, {
      // Micrófono de notebook o auricular: con los filtros de eco, ruido y volumen del navegador.
      conFiltrosDeVoz: true,
      alRecibir: (bloque) => flujo.agregarAudio(bloque),
      alTerminar: eventos.alTerminarCaptura,
    }),
    flujo,
  );
}
