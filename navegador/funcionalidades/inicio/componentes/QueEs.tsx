import { Link } from "react-router";
import type { Idioma } from "@nativox/compartido/contratos";
import { TEXTOS_INICIO } from "../textos";

// Píxeles de 12 px en cascada, a juego con el isotipo (0 = vacío, 1 = naranja, 2 = tinta).
const PIXELES = [1, 1, 0, 0, 1, 1, 0, 0, 2, 0, 1, 1, 2, 2, 1, 1];
const COLOR_PIXEL = ["bg-transparent", "bg-naranja", "bg-ink"];

export interface PropiedadesQueEs {
  idioma: Idioma;
  rutaComoFunciona: string;
  // El bloque de "Desplegá tu instancia" (funcionalidad boton-despliegue), debajo del texto.
  despliegue: React.ReactNode;
}

export function QueEs({ idioma, rutaComoFunciona, despliegue }: PropiedadesQueEs) {
  const textos = TEXTOS_INICIO[idioma];
  return (
    <section
      id="seccion-que-es"
      className="grilla-fondo relative flex min-h-[720px] w-full items-center bg-canvas"
    >
      <span
        className="absolute top-[64px] left-[38%] font-mono text-sm leading-none font-bold text-naranja"
        aria-hidden
      >
        +
      </span>
      <span
        className="absolute top-[90px] right-[36%] font-mono text-[10px] tracking-widest text-ink/35"
        aria-hidden
      >
        02
      </span>
      <div className="relative z-10 mx-auto flex w-full max-w-[1680px] flex-col items-stretch gap-10 px-5 py-16 md:px-8 lg:grid lg:grid-cols-2 lg:gap-16 lg:px-[72px]">
        <div className="relative order-2 min-h-[260px] border border-[#443d30] shadow-md lg:order-none lg:min-h-[380px]">
          <img
            src="/conferencia.jpg"
            alt={textos.imagen}
            className="h-full w-full object-cover contrast-[1.05] grayscale-[15%]"
          />
          <div className="absolute -bottom-4 -left-4 z-10 grid grid-cols-4 gap-[2px]" aria-hidden>
            {PIXELES.map((color, indice) => (
              <div key={indice} className={`size-3 ${COLOR_PIXEL[color] ?? ""}`} />
            ))}
          </div>
          <span
            className="absolute -top-8 -right-8 z-10 font-mono text-[64px] leading-none font-bold text-naranja"
            aria-hidden
          >
            +
          </span>
        </div>
        <div className="order-1 flex flex-col items-center text-center lg:order-none lg:items-start lg:text-left">
          <span className="font-mono text-[11px] tracking-widest text-naranja uppercase">
            {textos.sobre}
          </span>
          <h2 className="mt-3 mb-6 font-display text-5xl leading-[0.95] uppercase">
            {textos.queEs[0]}
            <br />
            {textos.queEs[1]}
          </h2>
          {textos.parrafos.map((parrafo) => (
            <p
              key={parrafo.slice(0, 24)}
              className="mb-5 font-sans text-lg leading-relaxed text-ink/90"
            >
              {parrafo}
            </p>
          ))}
          <Link
            to={rutaComoFunciona}
            className="mt-3 inline-flex items-center gap-3 border-[3px] border-[#b8241f] bg-naranja px-6 py-3 font-mono text-sm font-bold tracking-widest text-ink uppercase transition-colors hover:bg-[#e67b00]"
          >
            {textos.verComoFunciona} <span>→</span>
          </Link>
          {despliegue}
        </div>
      </div>
    </section>
  );
}
