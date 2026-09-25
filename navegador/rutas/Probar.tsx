import type { Idioma } from "@nativox/compartido/contratos";
import { Marco, rutaDe } from "@navegador/funcionalidades/marco";
import { PanelPrueba, usePrueba } from "@navegador/funcionalidades/probar";

// /probar — transcripción y traducción en la placa de quien visita, con las medidas de la tabla.
export function Probar({ idioma }: { idioma: Idioma }) {
  const prueba = usePrueba();
  return (
    <Marco idioma={idioma} pagina="probar">
      <main className="grilla-fondo flex-1">
        <PanelPrueba idioma={idioma} prueba={prueba} rutaNube={rutaDe("inicio", idioma)} />
      </main>
    </Marco>
  );
}
