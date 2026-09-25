import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";

// El enrutador no baja solo hasta un ancla (#seccion-que-es): se hace acá, y al cambiar de
// página se vuelve arriba.
export function DesplazarAlAncla() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    const destino = hash ? document.getElementById(hash.slice(1)) : null;
    if (destino) destino.scrollIntoView({ behavior: "smooth" });
    else window.scrollTo(0, 0);
  }, [pathname, hash]);
  return <Outlet />;
}
