import { useCallback, useEffect, useRef, useState } from "react";
import type { Linea } from "@nativox/compartido/contratos";
import { FRECUENCIA } from "@nativox/navegador/modulos/captura-audio";
import type { Medicion } from "@nativox/navegador/modulos/flujo-subtitulos";
import type { VarianteWhisper } from "@nativox/navegador/modulos/modelos-compartidos";
import { SEGUNDOS_POR_PRUEBA } from "../../../../contratos-landing/nube";
import { aWav } from "../../../../contratos-landing/wav";
import { armarPrueba, type ConfiguracionElegida, type PruebaArmada } from "../motor/armar-prueba";
import { cerrarPrueba } from "../motor/cerrar-prueba";
import { iniciarGrabacion, picoDe, type Grabacion } from "../motor/grabar-voz";
import { registrarIntentoLocal } from "../motor/intentos-locales";
import { conLinea } from "../motor/lineas";
import { comprobarMicrofono } from "../motor/microfono";
import {
  prepararModelos,
  type AvanceDescarga,
  type ModelosListos,
} from "../motor/preparar-modelos";
import { consultarCupos } from "../nube/cliente-nube";
import { useLimiteDeTiempo } from "./useLimiteDeTiempo";

// Por debajo de este pico (0 a 1) el micrófono casi no escuchó nada.
const PICO_DE_SILENCIO = 0.02;

// El recorrido de una prueba: se bajan los modelos, se graba la voz (hasta 15 s), se revisa lo
// grabado y se escribe lo que se dijo, y recién al enviar se transcribe y traduce.
export type EstadoPrueba =
  | { fase: "inactiva" }
  | { fase: "preparando"; avance: AvanceDescarga }
  // Los modelos están listos: falta que la persona apriete "Grabar".
  | { fase: "listo" }
  | { fase: "grabando" }
  // La grabación terminó: se puede escuchar, escribir lo que se dijo y enviar.
  | { fase: "revisando"; silencio: boolean }
  | { fase: "procesando" }
  // Se usaron las pruebas con micrófono de hoy.
  | { fase: "sin-intentos" }
  | { fase: "error"; motivo: string };

export function usePrueba() {
  const [estado, setEstado] = useState<EstadoPrueba>({ fase: "inactiva" });
  const [lineas, setLineas] = useState<Linea[]>([]);
  const [mediciones, setMediciones] = useState<Medicion[]>([]);
  const [avisos, setAvisos] = useState<string[]>([]);
  const [variante, setVariante] = useState<VarianteWhisper | null>(null);
  // Pruebas con micrófono que le quedan hoy (null mientras no se sabe).
  const [intentosLocales, setIntentosLocales] = useState<number | null>(null);
  const [nivelDeVoz, setNivelDeVoz] = useState(0);
  const [urlDeAudio, setUrlDeAudio] = useState<string | null>(null);
  const configuracion = useRef<ConfiguracionElegida | null>(null);
  const modelos = useRef<ModelosListos | null>(null);
  const grabacion = useRef<Grabacion | null>(null);
  const audio = useRef<Float32Array | null>(null);
  const prueba = useRef<PruebaArmada | null>(null);

  const refrescarIntentos = useCallback(async () => {
    const cupos = await consultarCupos("/api/cupos-local");
    if (cupos.ok) setIntentosLocales(cupos.valor.pruebas);
  }, []);

  useEffect(() => {
    void refrescarIntentos();
  }, [refrescarIntentos]);

  const soltarAudio = useCallback(() => {
    audio.current = null;
    setUrlDeAudio((anterior) => {
      if (anterior) URL.revokeObjectURL(anterior);
      return null;
    });
  }, []);

  const avisar = useCallback((motivo: string) => {
    setAvisos((anteriores) => [...anteriores, motivo].slice(-5));
  }, []);

  const actualizarLinea = useCallback((linea: Linea) => {
    setLineas((anteriores) => conLinea(anteriores, linea));
  }, []);

  // Paso 1: bajar los modelos (solo la primera vez) y dejar todo listo para grabar.
  const preparar = useCallback(async (nueva: ConfiguracionElegida) => {
    configuracion.current = nueva;
    setLineas([]);
    setMediciones([]);
    setAvisos([]);
    const listos = await prepararModelos(
      { de: nueva.idiomaOriginal, a: nueva.idiomasDestino, traductor: nueva.traductor },
      (avance) => setEstado({ fase: "preparando", avance }),
    );
    if (!listos.ok) {
      setEstado({ fase: "error", motivo: listos.motivo });
      return;
    }
    modelos.current = listos.valor;
    setVariante(listos.valor.variante);
    setEstado({ fase: "listo" });
  }, []);

  // Paso 3: cortar la grabación (a mano o al llegar a 15 s) y pasar a revisarla.
  const terminarGrabacion = useCallback(() => {
    const actual = grabacion.current;
    if (!actual) return;
    grabacion.current = null;
    const grabado = actual.terminar();
    audio.current = grabado;
    setUrlDeAudio(
      URL.createObjectURL(new Blob([aWav(grabado, FRECUENCIA)], { type: "audio/wav" })),
    );
    setNivelDeVoz(0);
    setEstado({ fase: "revisando", silencio: picoDe(grabado) < PICO_DE_SILENCIO });
  }, []);

  // Paso 2: grabar. Cada grabación cuenta como una de las 4 pruebas del día, y se anota recién
  // ahora (con los modelos ya bajados y el permiso concedido): una descarga o un permiso fallidos
  // no gastan una.
  const grabar = useCallback(async () => {
    soltarAudio();
    const permiso = await comprobarMicrofono();
    if (!permiso.ok) {
      setEstado({ fase: "error", motivo: permiso.motivo });
      return;
    }
    const intento = await registrarIntentoLocal(crypto.randomUUID());
    if (!intento.ok) {
      if (intento.codigo === "sin-cupo") {
        setIntentosLocales(0);
        setEstado({ fase: "sin-intentos" });
      } else {
        setEstado({ fase: "error", motivo: intento.mensaje });
      }
      return;
    }
    setIntentosLocales(intento.pruebas);

    const nueva = await iniciarGrabacion({
      alNivel: setNivelDeVoz,
      alCortarse: () => terminarGrabacion(),
    });
    if (!nueva.ok) {
      setEstado({ fase: "error", motivo: nueva.motivo });
      return;
    }
    grabacion.current = nueva.valor;
    setEstado({ fase: "grabando" });
  }, [soltarAudio, terminarGrabacion]);

  const detener = useCallback(async () => {
    if (await cerrarPrueba(prueba, () => setEstado({ fase: "procesando" }))) {
      setEstado({ fase: "inactiva" });
    }
  }, []);

  // Paso 4: transcribir y traducir lo grabado, a la velocidad real y sin sonar, como si se
  // estuviera diciendo en vivo.
  const enviar = useCallback(async () => {
    const grabado = audio.current;
    const listos = modelos.current;
    const elegida = configuracion.current;
    if (!grabado || !listos || !elegida) return;
    setLineas([]);
    setMediciones([]);
    setAvisos([]);
    setEstado({ fase: "procesando" });
    const archivo = new File([aWav(grabado, FRECUENCIA)], "grabacion.wav", { type: "audio/wav" });
    const armada = await armarPrueba(
      listos,
      { ...elegida, archivo },
      {
        alCambiarLinea: actualizarLinea,
        alMedir: (medicion) => setMediciones((anteriores) => [...anteriores, medicion]),
        alFallar: avisar,
        alTerminarCaptura: () => void detener(),
      },
    );
    if (!armada.ok) {
      setEstado({ fase: "error", motivo: armada.motivo });
      return;
    }
    prueba.current = armada.valor;
  }, [actualizarLinea, avisar, detener]);

  // Volver al principio (para cambiar la configuración o grabar de nuevo desde cero).
  const descartar = useCallback(() => {
    grabacion.current?.terminar();
    grabacion.current = null;
    soltarAudio();
    setNivelDeVoz(0);
    setEstado({ fase: "inactiva" });
  }, [soltarAudio]);

  // La grabación se corta sola a los 15 s.
  const segundosRestantes = useLimiteDeTiempo(
    estado.fase === "grabando",
    SEGUNDOS_POR_PRUEBA,
    terminarGrabacion,
  );

  return {
    estado,
    lineas,
    mediciones,
    avisos,
    variante,
    intentosLocales,
    nivelDeVoz,
    urlDeAudio,
    segundosRestantes,
    preparar,
    grabar,
    terminarGrabacion,
    enviar,
    descartar,
  };
}

export type Prueba = ReturnType<typeof usePrueba>;
