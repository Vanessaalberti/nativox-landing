import { Link } from "react-router";
import type { Idioma } from "@nativox/compartido/contratos";

// Tal cual la maqueta: la guía paso a paso todavía no está definida, así que la página lo dice y
// no inventa pasos.
const TEXTOS: Record<
  Idioma,
  { etiqueta: string; titulo: [string, string]; texto: string; volver: string; comparacion: string }
> = {
  es: {
    etiqueta: "02 — Guía de instalación",
    titulo: ["¿Cómo", "funciona?"],
    texto:
      "Esta página todavía no está construida — acá va el paso a paso para dejar tu propia instancia funcionando: requisitos previos, crear tu evento (sin ninguna API key), evaluar las computadoras de cada sala, crear tu primera sala y compartirla con la audiencia.",
    volver: "Volver al inicio",
    comparacion: "Ver la comparación",
  },
  en: {
    etiqueta: "02 — Installation guide",
    titulo: ["How does", "it work?"],
    texto:
      "This page is not built yet — this is where the step-by-step guide to get your own instance running will go: prerequisites, creating your event (no API keys at all), evaluating the computers in each room, creating your first room and sharing it with the audience.",
    volver: "Back to home",
    comparacion: "See the comparison",
  },
  pt: {
    etiqueta: "02 — Guia de instalação",
    titulo: ["Como", "funciona?"],
    texto:
      "Esta página ainda não está pronta — aqui vai o passo a passo para deixar a sua própria instância funcionando: pré-requisitos, criar o seu evento (sem nenhuma API key), avaliar os computadores de cada sala, criar a sua primeira sala e compartilhá-la com o público.",
    volver: "Voltar ao início",
    comparacion: "Ver a comparação",
  },
};

export interface PropiedadesComoFunciona {
  idioma: Idioma;
  rutaInicio: string;
  rutaComparacion: string;
}

export function ComoFunciona({ idioma, rutaInicio, rutaComparacion }: PropiedadesComoFunciona) {
  const textos = TEXTOS[idioma];
  return (
    <main className="grilla-fondo relative flex flex-1 items-center">
      <span
        className="absolute top-[80px] left-[12%] font-mono text-sm font-bold text-naranja"
        aria-hidden
      >
        +
      </span>
      <span
        className="absolute right-[10%] bottom-[90px] font-mono text-sm font-bold text-ink/30"
        aria-hidden
      >
        +
      </span>
      <div className="mx-auto w-full max-w-[1080px] px-5 py-24 md:px-[72px]">
        <span className="font-mono text-[11px] tracking-widest text-naranja uppercase">
          {textos.etiqueta}
        </span>
        <h1 className="mt-3 mb-6 font-display text-6xl leading-[0.9] uppercase md:text-7xl">
          {textos.titulo[0]}
          <br />
          {textos.titulo[1]}
        </h1>
        <p className="max-w-[640px] text-lg leading-relaxed text-ink/90">{textos.texto}</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            to={rutaInicio}
            className="inline-flex items-center gap-2 border-[1.5px] border-ink px-5 py-3 font-mono text-xs font-bold tracking-widest uppercase hover:bg-ink hover:text-canvas"
          >
            <span>←</span> {textos.volver}
          </Link>
          <Link
            to={rutaComparacion}
            className="inline-flex items-center gap-2 bg-naranja px-5 py-3 font-mono text-xs font-bold tracking-widest uppercase hover:bg-ink hover:text-canvas"
          >
            {textos.comparacion} →
          </Link>
        </div>
      </div>
    </main>
  );
}
