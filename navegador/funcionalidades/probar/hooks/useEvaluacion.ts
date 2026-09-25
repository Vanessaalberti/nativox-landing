import { useCallback, useState } from "react";
import type { Nivel } from "@nativox/navegador/modulos/evaluar-equipo";
import { evaluarEquipo, type AvanceEvaluacion, type Evaluacion } from "../motor/evaluar";

export type EstadoEvaluacion =
  | { fase: "inactiva" }
  | { fase: "evaluando"; avance: AvanceEvaluacion }
  | { fase: "lista"; evaluacion: Evaluacion }
  | { fase: "error"; motivo: string };

// "Evaluar mi computadora": al terminar avisa qué nivel recomienda para que la barra quede elegida.
export function useEvaluacion(alRecomendar: (nivel: Nivel) => void) {
  const [estado, setEstado] = useState<EstadoEvaluacion>({ fase: "inactiva" });

  const evaluar = useCallback(async () => {
    setEstado({ fase: "evaluando", avance: { etapa: "detectando" } });
    const resultado = await evaluarEquipo((avance) => setEstado({ fase: "evaluando", avance }));
    if (!resultado.ok) {
      setEstado({ fase: "error", motivo: resultado.motivo });
      return;
    }
    setEstado({ fase: "lista", evaluacion: resultado.valor });
    alRecomendar(resultado.valor.recomendacion.nivel);
  }, [alRecomendar]);

  return { estado, evaluar };
}
