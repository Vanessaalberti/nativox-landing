import { useCallback, useEffect, useRef, useState } from "react";
import type { Linea } from "@nativox/compartido/contratos";
import type { Medicion } from "@nativox/navegador/modulos/flujo-subtitulos";
import type { VarianteWhisper } from "@nativox/navegador/modulos/modelos-compartidos";
import { SEGUNDOS_POR_PRUEBA } from "../../../../contratos-landing/nube";
import { consultarCupos } from "../nube/cliente-nube";
import { armarPrueba, type ConfiguracionPrueba, type PruebaArmada } from "../motor/armar-prueba";
import { cerrarPrueba } from "../motor/cerrar-prueba";
import { registrarIntentoLocal } from "../motor/intentos-locales";
import { conLinea } from "../motor/lineas";
import { comprobarMicrofono } from "../motor/microfono";
import { prepararModelos, type AvanceDescarga } from "../motor/preparar-modelos";
import { useLimiteDeTiempo } from "./useLimiteDeTiempo";

export type EstadoPrueba =
  | { fase: "inactiva" }
  | { fase: "preparando"; avance: AvanceDescarga }
  | { fase: "en-vivo" }
  | { fase: "terminando" }
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
  const [conMicrofono, setConMicrofono] = useState(false);
  const prueba = useRef<PruebaArmada | null>(null);

  const refrescarIntentos = useCallback(async () => {
    const cupos = await consultarCupos("/api/cupos-local");
    if (cupos.ok) setIntentosLocales(cupos.valor.pruebas);
  }, []);

  useEffect(() => {
    void refrescarIntentos();
  }, [refrescarIntentos]);

  const avisar = useCallback((motivo: string) => {
    setAvisos((anteriores) => [...anteriores, motivo].slice(-5));
  }, []);

  const actualizarLinea = useCallback((linea: Linea) => {
    setLineas((anteriores) => conLinea(anteriores, linea));
  }, []);

  const detener = useCallback(async () => {
    if (await cerrarPrueba(prueba, () => setEstado({ fase: "terminando" }))) {
      setEstado({ fase: "inactiva" });
    }
  }, []);

  const iniciar = useCallback(
    async (configuracion: ConfiguracionPrueba) => {
      setLineas([]);
      setMediciones([]);
      setAvisos([]);
      const modelos = await prepararModelos(
        {
          de: configuracion.idiomaOriginal,
          a: configuracion.idiomasDestino,
          traductor: configuracion.traductor,
        },
        (avance) => setEstado({ fase: "preparando", avance }),
      );
      if (!modelos.ok) {
        setEstado({ fase: "error", motivo: modelos.motivo });
        return;
      }
      setVariante(modelos.valor.variante);

      // El audio de un archivo no tiene tope; el del micrófono cuenta como una de las 4 pruebas del
      // día, y se anota recién ahora que ya se bajó todo (una descarga fallida no gasta una).
      const microfono = configuracion.archivo === null;
      setConMicrofono(microfono);
      if (microfono) {
        const permiso = await comprobarMicrofono();
        if (!permiso.ok) {
          setEstado({ fase: "error", motivo: permiso.motivo });
          return;
        }
        const intento = await registrarIntentoLocal(crypto.randomUUID());
        if (!intento.ok) {
          setEstado(
            intento.codigo === "sin-cupo"
              ? { fase: "sin-intentos" }
              : { fase: "error", motivo: intento.mensaje },
          );
          if (intento.codigo === "sin-cupo") setIntentosLocales(0);
          return;
        }
        setIntentosLocales(intento.pruebas);
      }

      const armada = await armarPrueba(modelos.valor, configuracion, {
        alCambiarLinea: actualizarLinea,
        alMedir: (medicion) => setMediciones((anteriores) => [...anteriores, medicion]),
        alFallar: avisar,
        alTerminarCaptura: () => void detener(),
      });
      if (!armada.ok) {
        setEstado({ fase: "error", motivo: armada.motivo });
        return;
      }
      prueba.current = armada.valor;
      setEstado({ fase: "en-vivo" });
    },
    [actualizarLinea, avisar, detener],
  );

  // Con el micrófono, cada prueba dura hasta 15 s y se corta sola.
  const segundosRestantes = useLimiteDeTiempo(
    estado.fase === "en-vivo" && conMicrofono,
    SEGUNDOS_POR_PRUEBA,
    () => void detener(),
  );

  return {
    estado,
    lineas,
    mediciones,
    avisos,
    variante,
    intentosLocales,
    segundosRestantes,
    iniciar,
    detener,
  };
}

export type Prueba = ReturnType<typeof usePrueba>;
