import { createBrowserRouter } from "react-router";
import { IDIOMAS, type Idioma } from "@nativox/compartido/contratos";
import { Comparacion } from "@navegador/rutas/Comparacion";
import { ComoFunciona } from "@navegador/rutas/ComoFunciona";
import { Inicio } from "@navegador/rutas/Inicio";
import { Probar } from "@navegador/rutas/Probar";
import { DesplazarAlAncla } from "./desplazar-al-ancla";
import { IdiomaDelDocumento } from "./idioma-del-documento";

// Español en la raíz; inglés y portugués con su prefijo (/en, /pt).
const prefijo = (idioma: Idioma) => (idioma === "es" ? "" : `/${idioma}`);

const paginas = (idioma: Idioma) =>
  [
    { path: prefijo(idioma) || "/", pagina: <Inicio idioma={idioma} /> },
    { path: `${prefijo(idioma)}/como-funciona`, pagina: <ComoFunciona idioma={idioma} /> },
    { path: `${prefijo(idioma)}/comparacion`, pagina: <Comparacion idioma={idioma} /> },
    { path: `${prefijo(idioma)}/probar`, pagina: <Probar idioma={idioma} /> },
  ].map(({ path, pagina }) => ({
    path,
    element: <IdiomaDelDocumento idioma={idioma}>{pagina}</IdiomaDelDocumento>,
  }));

export const enrutador = createBrowserRouter([
  { element: <DesplazarAlAncla />, children: IDIOMAS.flatMap(paginas) },
]);
