import type { Idioma } from "@nativox/compartido/contratos";
import { Isotipo } from "./Isotipo";
import { TEXTOS_MARCO } from "./textos";

export function Pie({ idioma }: { idioma: Idioma }) {
  const textos = TEXTOS_MARCO[idioma];
  return (
    <footer className="relative w-full bg-ink text-canvas">
      <div className="mx-auto grid max-w-[1680px] items-center gap-10 px-5 py-7 md:grid-cols-3 md:px-[72px]">
        <div className="flex items-center gap-3">
          <Isotipo />
          <span className="font-display text-xl tracking-wider">NATIVOX</span>
        </div>
        <div className="font-mono text-[11px] leading-relaxed text-canvas/70">
          <span className="tracking-widest text-naranja uppercase">{textos.creadoPor}</span>
          <br />
          <span className="text-sm text-canvas">Vanessa Arévalo</span>
          <br />
          {textos.proyecto}
        </div>
        <div className="flex flex-col gap-2 font-mono text-[11px] tracking-widest uppercase md:items-end">
          <a
            href="https://www.linkedin.com/in/vanessaarevaloabt/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-naranja"
          >
            LinkedIn ↗
          </a>
          <a
            href="mailto:vanessaalbertii01@gmail.com"
            className="transition-colors hover:text-naranja"
          >
            Email ↗
          </a>
        </div>
      </div>
    </footer>
  );
}
