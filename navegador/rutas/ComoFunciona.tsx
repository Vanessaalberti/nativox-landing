import type { Idioma } from "@nativox/compartido/contratos";
import { ComoFunciona as Contenido } from "@navegador/funcionalidades/como-funciona";
import { Marco, rutaDe } from "@navegador/funcionalidades/marco";

// /como-funciona — la página de la maqueta, sin guía todavía.
export function ComoFunciona({ idioma }: { idioma: Idioma }) {
  return (
    <Marco idioma={idioma} pagina="como-funciona">
      <Contenido
        idioma={idioma}
        rutaInicio={rutaDe("inicio", idioma)}
        rutaComparacion={rutaDe("comparacion", idioma)}
      />
    </Marco>
  );
}
