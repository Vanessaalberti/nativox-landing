// Un término de glosario es una palabra o una sigla ("pull request", "CI/CD"), no una frase. Si en
// "Probar" se pega ahí lo que se dice, Whisper lo tomaría como guía y lo repetiría casi igual: se
// queda solo con los renglones cortos.
const PALABRAS_MAXIMAS_POR_TERMINO = 4;

export interface GlosarioDePrueba {
  texto: string;
  // Cuántos renglones se dejaron afuera por parecer frases.
  descartados: number;
}

export function limpiarGlosarioDePrueba(glosario: string): GlosarioDePrueba {
  let descartados = 0;
  const conservados = glosario.split(/\r?\n/).filter((renglon) => {
    const termino = (renglon.split("=>")[0] ?? "").split("~")[0] ?? "";
    const palabras = termino.trim().split(/\s+/).filter(Boolean).length;
    if (palabras <= PALABRAS_MAXIMAS_POR_TERMINO) return true;
    descartados += 1;
    return false;
  });
  return { texto: conservados.join("\n"), descartados };
}
