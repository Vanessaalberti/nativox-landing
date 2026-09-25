import { useState } from "react";
import { IDIOMAS, esquemaIdioma, validar, type Idioma } from "@nativox/compartido/contratos";
import type { Nivel } from "@nativox/navegador/modulos/evaluar-equipo";
import type { ConfiguracionElegida } from "../motor/armar-prueba";
import { limpiarGlosarioDePrueba } from "../motor/glosario-de-prueba";
import type { ElegirTraductor } from "../motor/preparar-modelos";
import { NOMBRES_DE_IDIOMA, TEXTOS_PROBAR } from "../textos";
import { TEXTOS_EVALUACION } from "../textos-evaluacion";
import { BarraDeNivel } from "./BarraDeNivel";
import { SelectorDeTraductor } from "./SelectorDeTraductor";

const etiqueta = "font-mono text-[10px] font-bold tracking-widest text-ink/60 uppercase";
const campo =
  "w-full rounded-sm border-[1.5px] border-ink/25 bg-canvas px-3 py-2 font-mono text-sm";

export interface PropiedadesFormulario {
  idioma: Idioma;
  nivel: Nivel;
  recomendado: Nivel | null;
  alCambiarNivel: (nivel: Nivel) => void;
  // Pruebas con micrófono que le quedan hoy (null mientras no se sabe).
  intentosLocales: number | null;
  // Lo que dijo la evaluación sobre TranslateGemma (null si todavía no se evaluó).
  margenParaGemma: boolean | null;
  alIniciar: (configuracion: ConfiguracionElegida) => void;
}

// Lo que se elige antes de probar. La fuente es siempre el micrófono (una grabación de hasta
// 15 s): no hay archivos ni "lo que dijiste" acá, que se pregunta recién después de grabar.
export function FormularioPrueba({
  idioma,
  nivel,
  recomendado,
  alCambiarNivel,
  intentosLocales,
  margenParaGemma,
  alIniciar,
}: PropiedadesFormulario) {
  const textos = TEXTOS_PROBAR[idioma];
  const controles = TEXTOS_EVALUACION[idioma].controles;
  const [traductor, setTraductor] = useState<ElegirTraductor>("bergamot");
  const [original, setOriginal] = useState<Idioma>(idioma);
  // Se puede traducir a uno, a los dos o a ninguno.
  const [destino, setDestino] = useState<Idioma[]>(IDIOMAS.filter((i) => i !== idioma).slice(0, 1));
  const [glosario, setGlosario] = useState("");
  const [descartados, setDescartados] = useState(0);

  const cambiarOriginal = (valor: string) => {
    const leido = validar(esquemaIdioma, valor);
    if (!leido.ok) return;
    setOriginal(leido.valor);
    setDestino((actual) => actual.filter((i) => i !== leido.valor));
  };
  const alternar = (opcion: Idioma) =>
    setDestino((actual) =>
      actual.includes(opcion) ? actual.filter((i) => i !== opcion) : [...actual, opcion],
    );
  const sinIntentos = intentosLocales === 0;

  return (
    <form
      className="grid gap-4 md:grid-cols-2"
      onSubmit={(evento) => {
        evento.preventDefault();
        const limpio = limpiarGlosarioDePrueba(glosario);
        setDescartados(limpio.descartados);
        alIniciar({
          idiomaOriginal: original,
          idiomasDestino: destino,
          glosario: limpio.texto,
          nivel,
          traductor,
        });
      }}
    >
      <label className="flex flex-col gap-1.5">
        <span className={etiqueta}>{textos.idiomaOriginal}</span>
        <select
          value={original}
          onChange={(evento) => cambiarOriginal(evento.target.value)}
          className={campo}
        >
          {IDIOMAS.map((opcion) => (
            <option key={opcion} value={opcion}>
              {NOMBRES_DE_IDIOMA[opcion]}
            </option>
          ))}
        </select>
      </label>
      <fieldset className="flex flex-col gap-1.5">
        <legend className={etiqueta}>{textos.traducirA}</legend>
        <div className="flex gap-4 pt-2 font-mono text-sm">
          {IDIOMAS.filter((opcion) => opcion !== original).map((opcion) => (
            <label key={opcion} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={destino.includes(opcion)}
                onChange={() => alternar(opcion)}
                className="accent-naranja"
              />
              {NOMBRES_DE_IDIOMA[opcion]}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="flex flex-col gap-1.5 md:col-span-2">
        <span className={etiqueta}>{textos.glosario}</span>
        <textarea
          value={glosario}
          onChange={(evento) => setGlosario(evento.target.value)}
          rows={3}
          className={campo}
        />
        <span className="font-mono text-[11px] text-ink/50">{textos.glosarioAyuda}</span>
        {descartados > 0 && (
          <span className="font-mono text-[11px] text-naranja">
            {textos.glosarioDescartado(descartados)}
          </span>
        )}
      </label>
      <SelectorDeTraductor
        idioma={idioma}
        elegido={traductor}
        margenParaGemma={margenParaGemma}
        deshabilitado={false}
        alCambiar={setTraductor}
      />
      <BarraDeNivel
        idioma={idioma}
        nivel={nivel}
        recomendado={recomendado}
        deshabilitada={false}
        alCambiar={alCambiarNivel}
      />
      <div className="flex flex-col gap-2 md:col-span-2">
        <button
          type="submit"
          disabled={sinIntentos}
          className="self-start rounded-sm bg-naranja px-5 py-3 font-mono text-xs font-bold tracking-widest text-ink uppercase shadow-sm hover:bg-ink hover:text-canvas disabled:cursor-not-allowed disabled:opacity-40"
        >
          {textos.iniciar}
        </button>
        {intentosLocales !== null && (
          <p className={`font-mono text-[11px] ${sinIntentos ? "text-naranja" : "text-ink/55"}`}>
            {sinIntentos ? controles.sinIntentos : controles.intentos(intentosLocales)}
          </p>
        )}
      </div>
    </form>
  );
}
