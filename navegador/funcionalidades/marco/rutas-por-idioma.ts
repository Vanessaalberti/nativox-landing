import type { Idioma } from "@nativox/compartido/contratos";

export type Pagina = "inicio" | "como-funciona" | "comparacion" | "probar";

// Español va en la raíz; inglés y portugués, con su prefijo: /, /en, /pt/comparacion…
const PREFIJOS: Record<Idioma, string> = { es: "", en: "/en", pt: "/pt" };

export function rutaDe(pagina: Pagina, idioma: Idioma): string {
  const camino = pagina === "inicio" ? "" : `/${pagina}`;
  return `${PREFIJOS[idioma]}${camino}` || "/";
}

export const REPOSITORIO_APP = "https://github.com/Vanessaalberti/nativox-app";
