import type { Idioma } from "@nativox/compartido/contratos";
import { BotonDespliegue } from "@navegador/funcionalidades/boton-despliegue";
import { ComoFunciona as Contenido } from "@navegador/funcionalidades/como-funciona";
import { Marco, rutaDe } from "@navegador/funcionalidades/marco";

// /como-funciona — qué es, por qué alcanza con un clic y el paso a paso en zigzag.
export function ComoFunciona({ idioma }: { idioma: Idioma }) {
  return (
    <Marco idioma={idioma} pagina="como-funciona">
      <Contenido
        idioma={idioma}
        rutaInicio={rutaDe("inicio", idioma)}
        rutaComparacion={rutaDe("comparacion", idioma)}
        despliegue={<BotonDespliegue idioma={idioma} />}
      />
    </Marco>
  );
}
