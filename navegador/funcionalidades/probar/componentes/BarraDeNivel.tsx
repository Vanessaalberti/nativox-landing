import type { Idioma } from "@nativox/compartido/contratos";
import { NIVELES, type Nivel } from "@nativox/navegador/modulos/evaluar-equipo";
import { TEXTOS_EVALUACION } from "../textos-evaluacion";

export interface PropiedadesBarraDeNivel {
  idioma: Idioma;
  nivel: Nivel;
  // El nivel que recomendó la evaluación; null si todavía no se evaluó.
  recomendado: Nivel | null;
  deshabilitada: boolean;
  alCambiar: (nivel: Nivel) => void;
}

const etiqueta = "font-mono text-[10px] font-bold tracking-widest text-ink/60 uppercase";

// La barra de velocidad: cuatro escalones. La evaluación deja elegido el recomendado y se puede
// cambiar a mano.
export function BarraDeNivel({
  idioma,
  nivel,
  recomendado,
  deshabilitada,
  alCambiar,
}: PropiedadesBarraDeNivel) {
  const textos = TEXTOS_EVALUACION[idioma].barra;
  return (
    <fieldset className="flex flex-col gap-2 md:col-span-2" disabled={deshabilitada}>
      <legend className={etiqueta}>{textos.titulo}</legend>
      <p className="font-mono text-[11px] text-ink/55">{textos.ayuda}</p>
      <div
        className="grid grid-cols-2 gap-2 md:grid-cols-4"
        role="radiogroup"
        aria-label={textos.titulo}
      >
        {NIVELES.map(({ nivel: opcion }) => {
          const elegido = opcion === nivel;
          return (
            <button
              key={opcion}
              type="button"
              role="radio"
              aria-checked={elegido}
              onClick={() => alCambiar(opcion)}
              className={`flex flex-col items-start gap-1 rounded-sm border-[1.5px] px-3 py-2 text-left font-mono transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                elegido
                  ? "border-ink bg-ink text-canvas"
                  : "border-ink/25 bg-canvas hover:border-ink/60"
              }`}
            >
              <span className="flex w-full items-center justify-between gap-2 text-[11px] font-bold tracking-widest uppercase">
                <span>
                  {String(opcion)} · {textos.nombres[opcion]}
                </span>
                {recomendado === opcion && (
                  <span
                    className={`rounded-sm px-1.5 py-0.5 text-[9px] ${elegido ? "bg-naranja text-ink" : "bg-verde text-ink"}`}
                  >
                    {textos.recomendado}
                  </span>
                )}
              </span>
              <span className="flex gap-0.5" aria-hidden>
                {NIVELES.map(({ nivel: escalon }) => (
                  <span
                    key={escalon}
                    className={`h-1.5 w-5 ${escalon <= opcion ? (elegido ? "bg-naranja" : "bg-ink/60") : elegido ? "bg-canvas/25" : "bg-ink/15"}`}
                  />
                ))}
              </span>
            </button>
          );
        })}
      </div>
      <p className="font-mono text-xs text-ink/75">{textos.descripciones[nivel]}</p>
      {recomendado === null && (
        <p className="font-mono text-[11px] text-ink/50">{textos.sinEvaluar}</p>
      )}
      {recomendado !== null && nivel > recomendado && (
        <p className="font-mono text-[11px] text-naranja">{textos.masExigente}</p>
      )}
    </fieldset>
  );
}
