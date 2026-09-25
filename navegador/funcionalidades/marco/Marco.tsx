import type { Idioma } from "@nativox/compartido/contratos";
import { Encabezado } from "./Encabezado";
import { Pie } from "./Pie";
import type { Pagina } from "./rutas-por-idioma";

// Páginas interiores: encabezado arriba, contenido y pie abajo (la portada arma el suyo).
export function Marco({
  idioma,
  pagina,
  children,
}: {
  idioma: Idioma;
  pagina: Pagina;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Encabezado idioma={idioma} pagina={pagina} />
      {children}
      <Pie idioma={idioma} />
    </div>
  );
}
