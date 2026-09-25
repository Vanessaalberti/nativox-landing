import { useCallback, useEffect, useRef, useState } from "react";
import type { Idioma, Linea } from "@nativox/compartido/contratos";
import { crearBergamot, type Traductor } from "@nativox/navegador/modulos/traduccion";
import type { PruebaArmada } from "../motor/armar-prueba";
import { cerrarPrueba } from "../motor/cerrar-prueba";
import { conLinea } from "../motor/lineas";
import { armarEnVivo } from "../nube/armar-en-vivo";
import { consultarCupos } from "../nube/cliente-nube";
import { CUPO_POR_PRUEBA, SEGUNDOS_POR_PRUEBA } from "../../../../contratos-landing/nube";
import { useLimiteDeTiempo } from "./useLimiteDeTiempo";

// Con menos cupo que esto (en segundos de audio) no vale la pena empezar: el servidor usa el mismo.
const CUPO_MINIMO = 2;
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
// cupo (segundos de audio por dispositivo) lo lleva el servidor.
export function usePruebaEnLaNube() {
  const [estado, setEstado] = useState<EstadoNube>({ fase: "inactiva" });
  const [lineas, setLineas] = useState<Linea[]>([]);
  const [cupoRestante, setCupoRestante] = useState<number | null>(null);
  const prueba = useRef<PruebaArmada | null>(null);
  const fallosSeguidos = useRef(0);

  useEffect(() => {
    void consultarCupos().then((cupos) => {
      if (!cupos.ok) return;
      setCupoRestante(cupos.valor.restantes);
      if (cupos.valor.restantes < CUPO_MINIMO) {
        setEstado({ fase: "sin-cupo", reintentarEnSegundos: cupos.valor.reintentarEnSegundos });
      }
    });
  }, []);

  const actualizarLinea = useCallback((linea: Linea) => {
    if (linea.original !== "" && !linea.provisoria) fallosSeguidos.current = 0;
    setLineas((anteriores) => conLinea(anteriores, linea));
  }, []);

  // Corta la captura, termina de transcribir y traducir lo que quedó y vuelve al reposo (salvo
  // que mientras tanto se haya agotado el cupo o fallado algo).
  const detener = useCallback(async () => {
    if (await cerrarPrueba(prueba, () => setEstado({ fase: "transcribiendo" }))) {
      setEstado((previo) => (previo.fase === "transcribiendo" ? { fase: "inactiva" } : previo));
    }
  }, []);

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
        { idiomaHablado: hablado, traduccion },
        {
          alCambiarLinea: actualizarLinea,
          alQuedarCupo: setCupoRestante,
          alAgotarseElCupo: (reintentarEnSegundos) => {
            setCupoRestante(0);
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
  // El servidor cuenta segundos de audio facturado; a la persona se le muestran pruebas.
  const pruebasRestantes =
    cupoRestante === null
      ? null
      : cupoRestante < CUPO_MINIMO
        ? 0
        : Math.ceil(cupoRestante / CUPO_POR_PRUEBA);

  return { estado, lineas, pruebasRestantes, segundosRestantes, iniciar, detener };
}
