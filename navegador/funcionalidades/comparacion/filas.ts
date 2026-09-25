import * as v from "valibot";
import type { Idioma } from "@nativox/compartido/contratos";

const textoPorIdioma = v.object({ es: v.string(), en: v.string(), pt: v.string() });

const esquemaCombinacion = v.object({
  id: v.pipe(v.string(), v.nonEmpty()),
  nombre: textoPorIdioma,
  glosario: v.boolean(),
  costoPorHora: v.pipe(v.number(), v.minValue(0)),
  costoAproximado: v.boolean(),
  sinInternet: v.boolean(),
  nota: v.optional(textoPorIdioma),
});

// Lo medido de una combinación, uno por archivo. Cada medida es opcional: lo que falta la página
// lo muestra como "a medir". Hasta que exista `scripts/informe-calidad` (paso 12), se cargan a
// partir de las mediciones del laboratorio y `fuente` dice de dónde sale cada número.
const esquemaResultado = v.object({
  combinacion: v.pipe(v.string(), v.nonEmpty()),
  wer: v.optional(v.pipe(v.number(), v.minValue(0), v.maxValue(1))),
  terminos: v.optional(v.object({ bien: v.number(), total: v.number() })),
  retrasoSegundos: v.optional(v.pipe(v.number(), v.minValue(0))),
  fuente: v.optional(textoPorIdioma),
});

export const esquemaCombinaciones = v.array(esquemaCombinacion);
export { esquemaResultado };

export type Combinacion = v.InferOutput<typeof esquemaCombinacion>;
export type ResultadoMedido = v.InferOutput<typeof esquemaResultado>;

export interface Fila {
  id: string;
  nombre: string;
  glosario: boolean;
  // null = todavía no se midió: la página dice "a medir", nunca un número escrito a mano.
  wer: number | null;
  terminos: { bien: number; total: number } | null;
  retrasoSegundos: number | null;
  costoPorHora: number;
  costoAproximado: boolean;
  sinInternet: boolean;
  nota: string | null;
  // De dónde salen los números de la fila (null si no hay ninguno medido).
  fuente: string | null;
}

export function armarFilas(
  combinaciones: readonly Combinacion[],
  resultados: readonly ResultadoMedido[],
  idioma: Idioma,
): Fila[] {
  const porCombinacion = new Map(resultados.map((resultado) => [resultado.combinacion, resultado]));
  return combinaciones.map((combinacion) => {
    const medido = porCombinacion.get(combinacion.id);
    return {
      id: combinacion.id,
      nombre: combinacion.nombre[idioma],
      glosario: combinacion.glosario,
      wer: medido?.wer ?? null,
      terminos: medido?.terminos ?? null,
      retrasoSegundos: medido?.retrasoSegundos ?? null,
      costoPorHora: combinacion.costoPorHora,
      costoAproximado: combinacion.costoAproximado,
      sinInternet: combinacion.sinInternet,
      nota: combinacion.nota?.[idioma] ?? null,
      fuente: medido?.fuente?.[idioma] ?? null,
    };
  });
}
