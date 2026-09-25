import { useCallback, useEffect, useRef, useState } from "react";
import type { Idioma, Linea } from "@nativox/compartido/contratos";
import { crearBergamot, type Traductor } from "@nativox/navegador/modulos/traduccion";
import type { PruebaArmada } from "../motor/armar-prueba";
import { cerrarPrueba } from "../motor/cerrar-prueba";
import { conLinea } from "../motor/lineas";
import { armarEnVivo } from "../nube/armar-en-vivo";
import { consultarCupos } from "../nube/cliente-nube";
import { SEGUNDOS_POR_PRUEBA } from "../../../../contratos-landing/nube";
import { useLimiteDeTiempo } from "./useLimiteDeTiempo";

// Dos frases seguidas que la nube no pudo transcribir: se corta y se avisa.
const FALLOS_PARA_CORTAR = 2;

export type EstadoNube =
  | { fase: "inactiva" }
  | { fase: "preparando" }
  | { fase: "escuchando" }
  | { fase: "transcribiendo" }
  | { fase: "sin-cupo"; reintentarEnSegundos: number }
  | { fase: "error"; motivo: string };

// Bergamot (~22 MB por par, guardado en el navegador) solo se baja si se pide ver una traducción.
let traductor: Promise<Traductor> | null = null;
function obtenerTraductor(): Promise<Traductor> {
  traductor ??= crearBergamot("/bergamot/translator.js").then((resultado) => {
    if (!resultado.ok) throw new Error(resultado.motivo);
    return resultado.valor;
  });
  return traductor;
}

// Portada: subtítulos en tiempo real con Whisper en Workers AI (sin descargar el modelo). Corta en
// pausas, manda cada frase a la nube y muestra el texto o su traducción a medida que llega. El
// cupo (3 pruebas por dispositivo) lo cuenta el servidor, así que recargar la página no lo reinicia.
export function usePruebaEnLaNube() {
  const [estado, setEstado] = useState<EstadoNube>({ fase: "inactiva" });
  const [lineas, setLineas] = useState<Linea[]>([]);
  const [pruebasRestantes, setPruebasRestantes] = useState<number | null>(null);
  const prueba = useRef<PruebaArmada | null>(null);
  const fallosSeguidos = useRef(0);

  // Le pregunta al servidor cuántas pruebas le quedan a este dispositivo (al abrir la página y al
  // terminar cada prueba).
  const refrescarCupo = useCallback(async () => {
    const cupos = await consultarCupos();
    if (!cupos.ok) return;
    setPruebasRestantes(cupos.valor.pruebas);
    if (cupos.valor.pruebas === 0) {
      setEstado({ fase: "sin-cupo", reintentarEnSegundos: cupos.valor.reintentarEnSegundos });
    }
  }, []);

  useEffect(() => {
    void refrescarCupo();
  }, [refrescarCupo]);

  const actualizarLinea = useCallback((linea: Linea) => {
    if (linea.original !== "" && !linea.provisoria) fallosSeguidos.current = 0;
    setLineas((anteriores) => conLinea(anteriores, linea));
  }, []);

  // Corta la captura, termina de transcribir y traducir lo que quedó y vuelve al reposo (salvo
  // que mientras tanto se haya agotado el cupo o fallado algo).
  const detener = useCallback(async () => {
    if (await cerrarPrueba(prueba, () => setEstado({ fase: "transcribiendo" }))) {
      setEstado((previo) => (previo.fase === "transcribiendo" ? { fase: "inactiva" } : previo));
      await refrescarCupo();
    }
  }, [refrescarCupo]);

  const iniciar = useCallback(
    async (hablado: Idioma, mostrarEn: Idioma) => {
      if (prueba.current) return;
      setLineas([]);
      fallosSeguidos.current = 0;

      let traduccion: { idioma: Idioma; traductor: Traductor } | null = null;
      if (mostrarEn !== hablado) {
        setEstado({ fase: "preparando" });
        try {
          traduccion = { idioma: mostrarEn, traductor: await obtenerTraductor() };
        } catch (error) {
          traductor = null;
          setEstado({
            fase: "error",
            motivo: `No se pudo preparar la traducción (${error instanceof Error ? error.message : String(error)}).`,
          });
          return;
        }
      }

      const armada = await armarEnVivo(
        { idPrueba: crypto.randomUUID(), idiomaHablado: hablado, traduccion },
        {
          alCambiarLinea: actualizarLinea,
          alQuedarCupo: setPruebasRestantes,
          alAgotarseElCupo: (reintentarEnSegundos) => {
            setPruebasRestantes(0);
            void detener().then(() => setEstado({ fase: "sin-cupo", reintentarEnSegundos }));
          },
          alFallar: (motivo) => {
            fallosSeguidos.current++;
            if (fallosSeguidos.current < FALLOS_PARA_CORTAR) return;
            void detener().then(() => setEstado({ fase: "error", motivo }));
          },
          alTerminarCaptura: () => void detener(),
        },
      );
      if (!armada.ok) {
        setEstado({ fase: "error", motivo: armada.motivo });
        return;
      }
      prueba.current = armada.valor;
      setEstado({ fase: "escuchando" });
    },
    [actualizarLinea, detener],
  );

  const segundosRestantes = useLimiteDeTiempo(
    estado.fase === "escuchando",
    SEGUNDOS_POR_PRUEBA,
    () => void detener(),
  );
  return { estado, lineas, pruebasRestantes, segundosRestantes, iniciar, detener };
}
