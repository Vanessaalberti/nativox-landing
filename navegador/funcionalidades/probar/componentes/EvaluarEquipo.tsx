import { Link } from "react-router";
import type { Idioma } from "@nativox/compartido/contratos";
import type { EstadoEvaluacion } from "../hooks/useEvaluacion";
import type { AvanceEvaluacion } from "../motor/evaluar";
import { formatearSegundos, TEXTOS_EVALUACION } from "../textos-evaluacion";

export interface PropiedadesEvaluarEquipo {
  idioma: Idioma;
  estado: EstadoEvaluacion;
  // Una prueba en curso usa la placa: no se puede medir al mismo tiempo.
  deshabilitado: boolean;
  // A dónde ir si el equipo no llega en vivo (la transcripción en la nube de la portada).
  rutaNube: string;
  alEvaluar: () => void;
}

// Qué paso de la lista (0 a 2) corresponde a cada etapa: el último (recomendar) es instantáneo.
function pasoDe(etapa: AvanceEvaluacion["etapa"]): number {
  return etapa === "detectando" ? 0 : 1;
}

export function EvaluarEquipo({
  idioma,
  estado,
  deshabilitado,
  rutaNube,
  alEvaluar,
}: PropiedadesEvaluarEquipo) {
  const textos = TEXTOS_EVALUACION[idioma];
  const evaluando = estado.fase === "evaluando";
  const actual = evaluando ? pasoDe(estado.avance.etapa) : -1;

  return (
    <section className="flex flex-col gap-4 border-[1.5px] border-ink/15 bg-canvas p-5">
      <div>
        <span className="font-mono text-[10px] font-bold tracking-widest text-naranja uppercase">
          {textos.etiqueta}
        </span>
        <h2 className="mt-1 font-display text-4xl leading-none uppercase">{textos.titulo}</h2>
        <p className="mt-2 max-w-[760px] text-sm text-ink/80">{textos.intro}</p>
      </div>

      <ol className="grid gap-1.5 font-mono text-xs">
        {textos.pasos.map((paso, indice) => {
          const hecho = estado.fase === "lista" || indice < actual;
          return (
            <li
              key={paso}
              className={`flex items-center gap-2 ${indice === actual ? "font-bold text-ink" : "text-ink/60"}`}
            >
              <span
                className={`flex size-5 shrink-0 items-center justify-center rounded-sm text-[10px] ${hecho ? "bg-verde text-ink" : indice === actual ? "bg-naranja text-ink" : "border border-ink/25"}`}
              >
                {hecho ? "✓" : String(indice + 1).padStart(2, "0")}
              </span>
              {paso}
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={alEvaluar}
          disabled={deshabilitado || evaluando}
          className="rounded-sm bg-ink px-5 py-3 font-mono text-xs font-bold tracking-widest text-canvas uppercase hover:bg-naranja hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          {estado.fase === "lista" ? textos.reevaluar : textos.evaluar}
        </button>
        <p className="font-mono text-xs" role="status">
          {evaluando &&
            (estado.avance.etapa === "detectando" ? textos.detectando : textos.midiendo)}
          {estado.fase === "error" && (
            <span className="text-red-700">
              {textos.fallo(textos.pasos[pasoDe(estado.etapa)] ?? "")}: {estado.motivo}
            </span>
          )}
        </p>
      </div>

      {estado.fase === "lista" && <Resultado idioma={idioma} estado={estado} rutaNube={rutaNube} />}
    </section>
  );
}

function Resultado({
  idioma,
  estado,
  rutaNube,
}: {
  idioma: Idioma;
  estado: Extract<EstadoEvaluacion, { fase: "lista" }>;
  rutaNube: string;
}) {
  const textos = TEXTOS_EVALUACION[idioma];
  const { equipo, medidas, recomendacion } = estado.evaluacion;
  const filas: [string, string][] = [
    [textos.placa, equipo.placa ?? textos.placaSinNombre],
    [textos.webgpu, equipo.webgpu ? textos.si : textos.no],
    [textos.f16, equipo.f16 ? textos.si : textos.no],
    [textos.ram, equipo.memoriaGb === null ? textos.sinDato : textos.ramValor(equipo.memoriaGb)],
    [textos.nucleos, equipo.nucleos === null ? textos.sinDato : String(equipo.nucleos)],
    [
      textos.buffer,
      equipo.bufferMaximoMb === null ? textos.sinDato : textos.bufferValor(equipo.bufferMaximoMb),
    ],
  ];
  if (medidas) {
    filas.push([textos.potencia, `${String(Math.round(medidas.gflops))} GFLOPS`]);
    filas.push([textos.pasada, `~${formatearSegundos(medidas.pasadaEstimadaMs, idioma)}`]);
  }
  if (recomendacion.version) filas.push([textos.version, textos.versiones[recomendacion.version]]);

  return (
    <div className="grid gap-4 border-t border-linea pt-4 md:grid-cols-2">
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 self-start font-mono text-xs">
        {filas.map(([nombre, valor]) => (
          <div key={nombre} className="contents">
            <dt className="text-ink/55">{nombre}</dt>
            <dd className="font-bold">{valor}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-col gap-2">
        <p className="font-mono text-[10px] font-bold tracking-widest text-ink/55 uppercase">
          {textos.recomendado}
        </p>
        <p className="font-display text-3xl leading-none uppercase">
          {`${String(recomendacion.nivel)} · ${textos.barra.nombres[recomendacion.nivel]}`}
        </p>
        <p className="mt-1 font-mono text-[10px] font-bold tracking-widest text-ink/55 uppercase">
          {textos.porQue}
        </p>
        <ul className="flex flex-col gap-1 font-mono text-xs text-ink/80">
          {recomendacion.motivos.map((motivo) => (
            <li key={motivo.codigo} className="flex gap-2">
              <span className="text-naranja">◆</span>
              {textos.motivos(motivo)}
            </li>
          ))}
        </ul>
        {recomendacion.usarNube && (
          <p className="font-mono text-xs">
            {textos.nube}{" "}
            <Link to={rutaNube} className="font-bold underline decoration-naranja">
              {textos.irALaNube}
            </Link>
          </p>
        )}
        {recomendacion.margenParaGemma && (
          <p className="font-mono text-[11px] text-ink/60">{textos.gemma}</p>
        )}
      </div>
    </div>
  );
}
