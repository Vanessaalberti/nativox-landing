import { useCallback, useRef, useState } from "react";
import type { Linea } from "@nativox/compartido/contratos";
import type { Medicion } from "@nativox/navegador/modulos/flujo-subtitulos";
import type { VarianteWhisper } from "@nativox/navegador/modulos/modelos-compartidos";
import { armarPrueba, type ConfiguracionPrueba, type PruebaArmada } from "../motor/armar-prueba";
import { prepararModelos, type AvanceDescarga } from "../motor/preparar-modelos";

export type EstadoPrueba =
  | { fase: "inactiva" }
  | { fase: "preparando"; avance: AvanceDescarga }
  | { fase: "en-vivo" }
  | { fase: "terminando" }
  | { fase: "error"; motivo: string };

export function usePrueba() {
  const [estado, setEstado] = useState<EstadoPrueba>({ fase: "inactiva" });
  const [lineas, setLineas] = useState<Linea[]>([]);
  const [mediciones, setMediciones] = useState<Medicion[]>([]);
  const [avisos, setAvisos] = useState<string[]>([]);
  const [variante, setVariante] = useState<VarianteWhisper | null>(null);
  const prueba = useRef<PruebaArmada | null>(null);

  const avisar = useCallback((motivo: string) => {
    setAvisos((anteriores) => [...anteriores, motivo].slice(-5));
  }, []);

  const actualizarLinea = useCallback((linea: Linea) => {
    setLineas((anteriores) => {
      const indice = anteriores.findIndex((existente) => existente.id === linea.id);
      if (indice === -1) return [...anteriores, linea];
      return anteriores.map((existente, i) => (i === indice ? linea : existente));
    });
  }, []);

  const detener = useCallback(async () => {
    const actual = prueba.current;
    if (!actual) return;
    prueba.current = null;
    actual.captura.detener();
    setEstado({ fase: "terminando" });
    await actual.flujo.terminar();
    setEstado({ fase: "inactiva" });
  }, []);

  const iniciar = useCallback(
    async (configuracion: ConfiguracionPrueba) => {
      setLineas([]);
      setMediciones([]);
      setAvisos([]);
      const modelos = await prepararModelos(
        { de: configuracion.idiomaOriginal, a: configuracion.idiomasDestino },
        (avance) => setEstado({ fase: "preparando", avance }),
      );
      if (!modelos.ok) {
        setEstado({ fase: "error", motivo: modelos.motivo });
        return;
      }
      setVariante(modelos.valor.variante);
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

  return { estado, lineas, mediciones, avisos, variante, iniciar, detener };
}

export type Prueba = ReturnType<typeof usePrueba>;
