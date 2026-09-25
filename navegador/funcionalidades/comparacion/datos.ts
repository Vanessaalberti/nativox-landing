import * as v from "valibot";
import combinacionesCrudas from "../../../comparacion/combinaciones.json";
import {
  esquemaCombinaciones,
  esquemaResultado,
  type Combinacion,
  type ResultadoMedido,
} from "./filas";

// Los resultados se calculan una vez con la aplicación y se suben a comparacion/resultados/: la
// página los lee en el build y no gasta nada al mostrarlos.
const resultadosCrudos = import.meta.glob<unknown>("../../../comparacion/resultados/*.json", {
  eager: true,
  import: "default",
});

// Un archivo roto hace fallar el build: mejor eso que publicar una tabla equivocada.
export function leerDatosComparacion(): {
  combinaciones: Combinacion[];
  resultados: ResultadoMedido[];
} {
  return {
    combinaciones: v.parse(esquemaCombinaciones, combinacionesCrudas),
    resultados: Object.values(resultadosCrudos).map((resultado) =>
      v.parse(esquemaResultado, resultado),
    ),
  };
}
