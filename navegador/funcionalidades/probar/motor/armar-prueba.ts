import type { Idioma, Linea, Resultado } from "@nativox/compartido/contratos";
import { leerGlosario } from "@nativox/compartido/glosario";
import { abrirArchivo, abrirEntrada, type Captura } from "@nativox/navegador/modulos/captura-audio";
import { crearCortador } from "@nativox/navegador/modulos/cortador-audio";
import {
  crearFlujoSubtitulos,
  type FlujoSubtitulos,
  type Medicion,
} from "@nativox/navegador/modulos/flujo-subtitulos";
import {
  borrarSuperposicion,
  crearAcuerdoLocal,
  crearWhisperLocal,
  transcribirSinAlucinaciones,
} from "@nativox/navegador/modulos/transcripcion";
import {
  crearCola,
  traducirConContexto,
  ultimoTramoSinCerrar,
} from "@nativox/navegador/modulos/traduccion";
import type { ModelosListos } from "./preparar-modelos";

export interface ConfiguracionPrueba {
  // Sin archivo, el micrófono del equipo.
  archivo: File | null;
  idiomaOriginal: Idioma;
  idiomasDestino: readonly Idioma[];
  glosario: string;
}

export interface EventosPrueba {
  alCambiarLinea: (linea: Linea) => void;
  alMedir: (medicion: Medicion) => void;
  alFallar: (motivo: string) => void;
  alTerminarCaptura: (motivo: string) => void;
}

export interface PruebaArmada {
  captura: Captura;
  flujo: FlujoSubtitulos;
}

// Igual que la sesión en vivo de la aplicación: texto provisorio cada ~1 s mientras se habla.
const PASADA_PROVISORIA_MS = 1000;

export async function armarPrueba(
  { modelos, traductor }: ModelosListos,
  configuracion: ConfiguracionPrueba,
  eventos: EventosPrueba,
): Promise<Resultado<PruebaArmada>> {
  const glosario = leerGlosario(configuracion.glosario);
  const transcriptor = crearWhisperLocal(modelos);
  const cola = crearCola();

  const flujo = crearFlujoSubtitulos({
    idSesion: "prueba",
    idiomaOriginal: configuracion.idiomaOriginal,
    idiomasDestino: configuracion.idiomasDestino,
    glosario,
    pasadaProvisoriaCadaMs: PASADA_PROVISORIA_MS,
    cortador: crearCortador({ minimoSegundos: 1.5 }),
    transcribir: (audio, opciones) => transcribirSinAlucinaciones(transcriptor, audio, opciones),
    quitarRepetido: borrarSuperposicion,
    crearAcuerdo: crearAcuerdoLocal,
    traducir: ({ texto, anterior, de, a }) =>
      cola(() =>
        traducirConContexto(traductor, {
          texto,
          contexto: ultimoTramoSinCerrar(anterior),
          glosario,
          de,
          a,
        }),
      ),
    ahoraMs: () => performance.now(),
    alCambiarLinea: eventos.alCambiarLinea,
    alMedir: eventos.alMedir,
    alFallar: eventos.alFallar,
  });

  const opcionesCaptura = {
    alRecibir: (bloque: Float32Array) => flujo.agregarAudio(bloque),
    alTerminar: eventos.alTerminarCaptura,
  };
  const captura = configuracion.archivo
    ? await abrirArchivo(configuracion.archivo, opcionesCaptura)
    : await abrirEntrada(null, opcionesCaptura);
  if (!captura.ok) return captura;
  return { ok: true, valor: { captura: captura.valor, flujo } };
}
