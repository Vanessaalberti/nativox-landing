import type { Idioma } from "@nativox/compartido/contratos";
import type { ElegirTraductor } from "../motor/preparar-modelos";
import { TEXTOS_EVALUACION } from "../textos-evaluacion";

export interface PropiedadesSelectorDeTraductor {
  idioma: Idioma;
  elegido: ElegirTraductor;
  // Lo que dijo la evaluación sobre TranslateGemma: null si todavía no se evaluó.
  margenParaGemma: boolean | null;
  deshabilitado: boolean;
  alCambiar: (traductor: ElegirTraductor) => void;
}

const etiqueta = "font-mono text-[10px] font-bold tracking-widest text-ink/60 uppercase";

// Bergamot es liviano y traduce al instante; TranslateGemma traduce mejor pero pesa ~2 a 3 GB y
// pide una placa con margen. Se puede elegir igual aunque la evaluación no lo recomiende.
export function SelectorDeTraductor({
  idioma,
  elegido,
  margenParaGemma,
  deshabilitado,
  alCambiar,
}: PropiedadesSelectorDeTraductor) {
  const textos = TEXTOS_EVALUACION[idioma].controles;
  const opciones: [ElegirTraductor, string][] = [
    ["bergamot", textos.bergamot],
    ["translategemma", textos.gemma],
  ];
  return (
    <fieldset className="flex flex-col gap-1.5" disabled={deshabilitado}>
      <legend className={etiqueta}>{textos.traductor}</legend>
      <div className="flex flex-col gap-1.5 pt-2 font-mono text-sm">
        {opciones.map(([valor, nombre]) => (
          <label key={valor} className="flex items-center gap-2">
            <input
              type="radio"
              checked={elegido === valor}
              onChange={() => alCambiar(valor)}
              className="accent-naranja"
            />
            {nombre}
          </label>
        ))}
      </div>
      {elegido === "translategemma" && (
        <p className="font-mono text-[11px] text-ink/60">{textos.gemmaAyuda}</p>
      )}
      {elegido === "translategemma" && margenParaGemma === false && (
        <p className="font-mono text-[11px] text-naranja">{textos.gemmaSinMargen}</p>
      )}
    </fieldset>
  );
}
