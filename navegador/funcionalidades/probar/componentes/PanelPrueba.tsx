import { useState } from "react";
import type { Idioma } from "@nativox/compartido/contratos";
import type { Nivel } from "@nativox/navegador/modulos/evaluar-equipo";
import { useEvaluacion } from "../hooks/useEvaluacion";
import type { Prueba } from "../hooks/usePrueba";
import { resumirPrueba } from "../resumen";
import { describirAvance, NOMBRES_DE_IDIOMA, TEXTOS_PROBAR } from "../textos";
import { BorrarModelos } from "./BorrarModelos";
import { EvaluarEquipo } from "./EvaluarEquipo";
import { FormularioPrueba } from "./FormularioPrueba";
import { MedidasPrueba } from "./MedidasPrueba";

// /probar: lo mismo que la sesión en vivo de la aplicación, pero en la placa de quien visita y con
// las medidas de la tabla de comparación.
export function PanelPrueba({
  idioma,
  prueba,
  rutaNube,
}: {
  idioma: Idioma;
  prueba: Prueba;
  // La transcripción en la nube (la portada), para quien su computadora no alcanza.
  rutaNube: string;
}) {
  const textos = TEXTOS_PROBAR[idioma];
  const [referencia, setReferencia] = useState("");
  const [glosarioUsado, setGlosarioUsado] = useState("");
  // Sin evaluar empieza en el medio; la evaluación deja elegido el recomendado (se puede cambiar).
  const [nivel, setNivel] = useState<Nivel>(2);
  const [recomendado, setRecomendado] = useState<Nivel | null>(null);
  const evaluacion = useEvaluacion((sugerido) => {
    setNivel(sugerido);
    setRecomendado(sugerido);
  });
  const { estado } = prueba;
  const evaluando = evaluacion.estado.fase === "evaluando";
  const ocupada =
    estado.fase === "preparando" ||
    estado.fase === "en-vivo" ||
    estado.fase === "terminando" ||
    evaluando;
  const resumen = resumirPrueba(prueba.lineas, prueba.mediciones, {
    referencia,
    glosario: glosarioUsado,
  });
  const conTexto = prueba.lineas.filter((linea) => linea.original.trim() !== "");

  return (
    <div className="mx-auto flex max-w-[1080px] flex-col gap-6 px-5 py-14 md:px-[72px]">
      <span className="font-mono text-[11px] tracking-widest text-naranja uppercase">
        {textos.etiqueta}
      </span>
      <h1 className="font-display text-6xl leading-[0.9] tracking-tight uppercase md:text-7xl">
        {textos.titulo}
      </h1>
      <p className="max-w-[760px] text-lg">{textos.intro}</p>
      <p className="max-w-[760px] font-mono text-xs text-ink/60">{textos.primeraVez}</p>
      <BorrarModelos idioma={idioma} deshabilitado={ocupada} />

      <EvaluarEquipo
        idioma={idioma}
        estado={evaluacion.estado}
        deshabilitado={ocupada}
        rutaNube={rutaNube}
        alEvaluar={() => void evaluacion.evaluar()}
      />

      <div className="border-[1.5px] border-ink/15 bg-canvas p-5">
        <FormularioPrueba
          idioma={idioma}
          ocupada={ocupada}
          referencia={referencia}
          alCambiarReferencia={setReferencia}
          nivel={nivel}
          recomendado={recomendado}
          alCambiarNivel={setNivel}
          alIniciar={(configuracion) => {
            setGlosarioUsado(configuracion.glosario);
            void prueba.iniciar(configuracion);
          }}
        />
        <div className="mt-4 flex flex-wrap items-center gap-4 font-mono text-xs" role="status">
          {estado.fase === "preparando" && <span>{describirAvance(estado.avance, idioma)}</span>}
          {estado.fase === "en-vivo" && (
            <button
              type="button"
              onClick={() => void prueba.detener()}
              className="rounded-sm border-[1.5px] border-ink px-4 py-2 font-bold tracking-widest uppercase hover:bg-ink hover:text-canvas"
            >
              {textos.detener}
            </button>
          )}
          {estado.fase === "error" && <span className="text-red-700">{estado.motivo}</span>}
          {prueba.avisos.map((aviso, indice) => (
            <span key={`${String(indice)}-${aviso}`} className="text-ink/60">
              {aviso}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="border-[1.5px] border-ink/15 bg-canvas p-5">
          <h2 className="mb-3 font-mono text-[10px] font-bold tracking-widest text-ink/55 uppercase">
            {textos.transcripcion}
          </h2>
          {conTexto.length === 0 ? (
            <p className="font-mono text-sm text-ink/50">{textos.vacio}</p>
          ) : (
            <ol className="flex max-h-[45vh] flex-col gap-3 overflow-y-auto">
              {conTexto.map((linea) => (
                <li key={linea.id} className="border-b border-linea pb-3">
                  <p className={linea.provisoria ? "text-ink/40 italic" : ""}>{linea.original}</p>
                  {Object.entries(linea.traducciones).map(([destino, traduccion]) => (
                    <p key={destino} className="text-sm text-ink/70">
                      <span className="mr-2 font-mono text-[10px] font-bold text-naranja uppercase">
                        {destino}
                      </span>
                      {traduccion}
                    </p>
                  ))}
                </li>
              ))}
            </ol>
          )}
        </section>
        <section className="border-[1.5px] border-ink/15 bg-canvas p-5">
          <h2 className="mb-3 font-mono text-[10px] font-bold tracking-widest text-ink/55 uppercase">
            {textos.medidas}
          </h2>
          <MedidasPrueba resumen={resumen} idioma={idioma} />
          {prueba.variante && (
            <p className="mt-3 font-mono text-[10px] tracking-widest text-ink/45 uppercase">
              Whisper large-v3 turbo ({prueba.variante}) · Bergamot · {NOMBRES_DE_IDIOMA[idioma]}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
