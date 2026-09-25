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

// Lo que escribe `scripts/informe-calidad` de la aplicación, uno por combinación.
const esquemaResultado = v.object({
  combinacion: v.pipe(v.string(), v.nonEmpty()),
  wer: v.pipe(v.number(), v.minValue(0)),
  terminos: v.object({ bien: v.number(), total: v.number() }),
  retrasoSegundos: v.pipe(v.number(), v.minValue(0)),
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
    };
  });
}
