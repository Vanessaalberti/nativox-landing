import type { Linea } from "@nativox/compartido/contratos";
import { leerGlosario } from "@nativox/compartido/glosario";
import { calcularWer, contarTerminos } from "@nativox/compartido/metricas";
import type { Medicion } from "@nativox/navegador/modulos/flujo-subtitulos";

export interface ResumenPrueba {
  // Necesitan "lo que dijiste": sin referencia no hay contra qué comparar.
  wer: number | null;
  terminos: { bien: number; total: number } | null;
  retrasoSegundos: number | null;
  pasadaMs: number | null;
  traduccionMs: number | null;
}

const promedio = (valores: readonly number[]) =>
  valores.length === 0 ? null : valores.reduce((a, b) => a + b, 0) / valores.length;

// Las mismas medidas que la tabla de comparación, sobre lo que se probó en esta computadora.
export function resumirPrueba(
  lineas: readonly Linea[],
  mediciones: readonly Medicion[],
  { referencia, glosario }: { referencia: string; glosario: string },
): ResumenPrueba {
  const transcripto = lineas
    .filter((linea) => !linea.provisoria)
    .map((linea) => linea.original)
    .join(" ");
  const terminos = leerGlosario(glosario).map((entrada) => entrada.termino);
  const conReferencia = referencia.trim() !== "" && transcripto.trim() !== "";

  return {
    wer: conReferencia ? calcularWer(referencia, transcripto) : null,
    terminos:
      conReferencia && terminos.length > 0
        ? contarTerminos(referencia, transcripto, terminos)
        : null,
    retrasoSegundos: promedio(mediciones.map((m) => m.retrasoConfirmacionSegundos)),
    pasadaMs: promedio(mediciones.map((m) => m.transcripcionMs)),
    traduccionMs: promedio(mediciones.map((m) => m.traduccionMs)),
  };
}
