import type { Idioma } from "@nativox/compartido/contratos";
import { TablaComparacion } from "@navegador/funcionalidades/comparacion";
import { Marco, rutaDe } from "@navegador/funcionalidades/marco";

// /comparacion — resultados medidos con charlas reales.
export function Comparacion({ idioma }: { idioma: Idioma }) {
  return (
    <Marco idioma={idioma} pagina="comparacion">
      <TablaComparacion idioma={idioma} rutaProbar={rutaDe("probar", idioma)} />
    </Marco>
  );
}
