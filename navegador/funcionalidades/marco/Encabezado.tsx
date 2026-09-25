import { Link } from "react-router";
import { IDIOMAS, type Idioma } from "@nativox/compartido/contratos";
import { Isotipo } from "./Isotipo";
import { REPOSITORIO_APP, rutaDe, type Pagina } from "./rutas-por-idioma";
import { TEXTOS_MARCO } from "./textos";

export interface PropiedadesEncabezado {
  idioma: Idioma;
  pagina: Pagina;
}

const enlace = "transition-colors hover:text-ink";

export function Encabezado({ idioma, pagina }: PropiedadesEncabezado) {
  const textos = TEXTOS_MARCO[idioma];
  return (
    <header className="relative z-20 grid h-[60px] w-full grid-cols-2 items-center px-5 md:grid-cols-3 md:px-8">
      <Link to={rutaDe("inicio", idioma)} className="flex items-center gap-2.5 justify-self-start">
        <Isotipo />
        <span className="font-display text-2xl leading-none font-bold tracking-wider">NATIVOX</span>
      </Link>

      <nav className="hidden items-center gap-3 justify-self-center font-mono text-[11px] tracking-widest text-ink/60 uppercase md:flex">
        <span className="text-ink/30">•</span>
        <Link to={`${rutaDe("inicio", idioma)}#seccion-que-es`} className={enlace}>
          {textos.queEs}
        </Link>
        <span className="text-ink/30">/</span>
        <Link
          to={rutaDe("como-funciona", idioma)}
          className={pagina === "como-funciona" ? "text-ink" : enlace}
        >
          {textos.comoFunciona}
        </Link>
        <span className="text-ink/30">/</span>
        <Link
          to={rutaDe("comparacion", idioma)}
          className={pagina === "comparacion" ? "text-ink" : enlace}
        >
          {textos.comparacion}
        </Link>
        <span className="text-ink/30">/</span>
        <Link to={`${rutaDe("inicio", idioma)}#seccion-despliegue`} className={enlace}>
          {textos.desplegar}
        </Link>
      </nav>

      <div className="flex items-center gap-6 justify-self-end font-mono text-xs md:gap-8">
        <nav
          aria-label={textos.idiomas}
          className="flex items-center gap-1 text-[11px] font-semibold tracking-widest"
        >
          {IDIOMAS.map((opcion, indice) => (
            <span key={opcion} className="flex items-center gap-1">
              {indice > 0 && <span className="px-1 text-ink/40">/</span>}
              <Link
                to={rutaDe(pagina, opcion)}
                aria-current={opcion === idioma ? "page" : undefined}
                className={`border-b-2 pb-0.5 uppercase ${opcion === idioma ? "border-naranja text-ink" : "border-transparent text-ink/50 hover:text-ink"}`}
              >
                {opcion}
              </Link>
            </span>
          ))}
        </nav>
        <a
          href={REPOSITORIO_APP}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[11px] font-bold tracking-wider transition-colors hover:text-naranja"
        >
          GITHUB <span className="text-xs">↗</span>
        </a>
      </div>
    </header>
  );
}
