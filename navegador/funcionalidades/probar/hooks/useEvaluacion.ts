import { useCallback, useState } from "react";
import type { Idioma } from "@nativox/compartido/contratos";
import type { Nivel } from "@nativox/navegador/modulos/evaluar-equipo";
import { evaluarEquipo, type AvanceEvaluacion, type Evaluacion } from "../motor/evaluar";

export type EstadoEvaluacion =
  | { fase: "inactiva" }
  | { fase: "evaluando"; avance: AvanceEvaluacion }
  | { fase: "lista"; evaluacion: Evaluacion }
  // En qué paso falló (para decirlo) y por qué.
  | { fase: "error"; etapa: AvanceEvaluacion["etapa"]; motivo: string };

// "Evaluar mi computadora": al terminar avisa qué nivel recomienda para que la barra quede elegida.
export function useEvaluacion(alRecomendar: (nivel: Nivel) => void) {
  const [estado, setEstado] = useState<EstadoEvaluacion>({ fase: "inactiva" });

  const evaluar = useCallback(
    async (hablado: Idioma) => {
      let etapa: AvanceEvaluacion["etapa"] = "detectando";
      setEstado({ fase: "evaluando", avance: { etapa } });
      const resultado = await evaluarEquipo(hablado, (avance) => {
        etapa = avance.etapa;
        setEstado({ fase: "evaluando", avance });
      });
      if (!resultado.ok) {
        setEstado({ fase: "error", etapa, motivo: resultado.motivo });
        return;
      }
      setEstado({ fase: "lista", evaluacion: resultado.valor });
      alRecomendar(resultado.valor.recomendacion.nivel);
    },
    [alRecomendar],
  );

  return { estado, evaluar };
}
