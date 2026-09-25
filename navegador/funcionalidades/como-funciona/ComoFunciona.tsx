import type { ReactNode } from "react";
import { Link } from "react-router";
import type { Idioma } from "@nativox/compartido/contratos";
import { TEXTOS_COMO_FUNCIONA } from "./textos";

export interface PropiedadesComoFunciona {
  idioma: Idioma;
  rutaInicio: string;
  rutaComparacion: string;
  // El botón "Deploy to Cloudflare" de la portada, para el primer paso.
  despliegue: ReactNode;
}

// La guía de instalación: primero qué es y por qué alcanza con un clic, y después los pasos en una
// línea de tiempo en zigzag (uno a la izquierda, el siguiente a la derecha) sobre una línea central.
export function ComoFunciona({
  idioma,
  rutaInicio,
  rutaComparacion,
  despliegue,
}: PropiedadesComoFunciona) {
  const textos = TEXTOS_COMO_FUNCIONA[idioma];

  return (
    <main className="grilla-fondo flex-1">
      <div className="mx-auto w-full max-w-[1680px] px-5 py-14 md:px-8">
        <span className="font-mono text-[11px] tracking-widest text-naranja uppercase">
          {textos.etiqueta}
        </span>
        <h1 className="mt-3 mb-10 font-display text-6xl leading-[0.9] uppercase md:text-7xl">
          {textos.titulo[0]}
          <br />
          {textos.titulo[1]}
        </h1>

        <section className="mb-20 grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div>
            <h2 className="mb-5 font-display text-4xl leading-none uppercase md:text-5xl">
              {textos.intro.titulo}
            </h2>
            {textos.intro.parrafos.map((parrafo) => (
              <p key={parrafo} className="mb-4 max-w-[860px] text-lg leading-relaxed text-ink/90">
                {parrafo}
              </p>
            ))}
          </div>
          <ul className="flex flex-col gap-4">
            {textos.intro.puntos.map((punto) => (
              <li key={punto.titulo} className="border-[1.5px] border-ink/20 bg-canvas p-5">
                <h3 className="font-display text-2xl leading-none uppercase">
                  <span className="mr-2 text-naranja">◆</span>
                  {punto.titulo}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/80">{punto.texto}</p>
              </li>
            ))}
          </ul>
        </section>

        <h2 className="mb-10 font-display text-4xl leading-none uppercase md:text-5xl">
          {textos.pasosTitulo}
        </h2>
        <ol className="relative flex flex-col gap-12 pl-12 md:gap-16 md:pl-0">
          <span
            className="absolute top-0 bottom-0 left-[19px] w-0.5 bg-ink/25 md:left-1/2 md:-translate-x-1/2"
            aria-hidden
          />
          {textos.pasos.map((paso, indice) => (
            <li key={paso.titulo} className="relative md:grid md:grid-cols-2 md:gap-x-20">
              <span
                className="absolute top-5 -left-12 flex size-10 items-center justify-center border-[3px] border-[#b8241f] bg-naranja font-display text-2xl md:top-6 md:left-1/2 md:-translate-x-1/2"
                aria-hidden
              >
                {indice + 1}
              </span>
              <div
                className={`border-[1.5px] border-ink/20 bg-canvas p-6 ${indice % 2 === 0 ? "md:col-start-1" : "md:col-start-2"}`}
              >
                <span className="font-mono text-[11px] tracking-widest text-naranja uppercase">
                  {String(indice + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-1 mb-3 font-display text-4xl leading-none uppercase">
                  {paso.titulo}
                </h3>
                <p className="text-base leading-relaxed text-ink/85">{paso.texto}</p>
                {indice === 0 && despliegue}
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-16 flex flex-wrap gap-4">
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
