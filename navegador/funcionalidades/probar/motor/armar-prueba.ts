import type { Idioma, Linea, Resultado } from "@nativox/compartido/contratos";
import { leerGlosario } from "@nativox/compartido/glosario";
import { abrirArchivo, type Captura } from "@nativox/navegador/modulos/captura-audio";
import { crearCortador } from "@nativox/navegador/modulos/cortador-audio";
import { pasadaProvisoriaDelNivel, type Nivel } from "@nativox/navegador/modulos/evaluar-equipo";
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
import { conFlujo } from "./cerrar-prueba";
import type { ElegirTraductor, ModelosListos } from "./preparar-modelos";

export interface ConfiguracionPrueba {
  // La grabación de quien prueba, como archivo: se procesa como si se dijera en vivo (a la
  // velocidad real, sin sonar), así se ve cómo se comporta el nivel elegido.
  archivo: File;
  idiomaOriginal: Idioma;
  idiomasDestino: readonly Idioma[];
  glosario: string;
  // La barra de velocidad: cada cuánto se muestra lo que se viene diciendo (0 = solo frases enteras).
  nivel: Nivel;
  // Bergamot (liviano, al instante) o TranslateGemma (más calidad, ~2 a 3 GB).
  traductor: ElegirTraductor;
}

// Lo que se elige en el formulario, antes de grabar: el archivo (la grabación) se suma después.
export type ConfiguracionElegida = Omit<ConfiguracionPrueba, "archivo">;

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
    pasadaProvisoriaCadaMs: pasadaProvisoriaDelNivel(configuracion.nivel),
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

  return conFlujo(
    await abrirArchivo(configuracion.archivo, {
      alRecibir: (bloque) => flujo.agregarAudio(bloque),
      alTerminar: eventos.alTerminarCaptura,
    }),
    flujo,
  );
}
