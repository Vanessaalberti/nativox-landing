import type { Linea } from "@nativox/compartido/contratos";

// El flujo de subtítulos publica la misma línea varias veces (provisoria, confirmada, con cada
// traducción): la que ya existe se reemplaza en su lugar y la nueva va al final.
export function conLinea(anteriores: readonly Linea[], linea: Linea): Linea[] {
  const indice = anteriores.findIndex((existente) => existente.id === linea.id);
  if (indice === -1) return [...anteriores, linea];
  return anteriores.map((existente, i) => (i === indice ? linea : existente));
}
