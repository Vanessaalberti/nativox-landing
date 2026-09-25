import { Link } from "react-router";
import type { Idioma } from "@nativox/compartido/contratos";
import { leerDatosComparacion } from "./datos";
import { armarFilas, type Fila } from "./filas";
import { TEXTOS_COMPARACION } from "./textos";

const LOCALES: Record<Idioma, string> = { es: "es-AR", en: "en-US", pt: "pt-BR" };

export interface PropiedadesComparacion {
  idioma: Idioma;
  rutaProbar: string;
}

export function TablaComparacion({ idioma, rutaProbar }: PropiedadesComparacion) {
  const textos = TEXTOS_COMPARACION[idioma];
  const { combinaciones, resultados } = leerDatosComparacion();
  const filas = armarFilas(combinaciones, resultados, idioma);
  const celda = (fila: Fila) => formatearCelda(fila, idioma);

  return (
    <main className="grilla-fondo flex-1">
      <div className="mx-auto max-w-[1080px] px-5 py-14 md:px-[72px]">
        <span className="font-mono text-[11px] tracking-widest text-naranja uppercase">
          {textos.etiqueta}
        </span>
        <h1 className="mt-3 mb-6 font-display text-6xl leading-[0.9] uppercase md:text-7xl">
          {textos.titulo}
        </h1>
        <p className="mb-4 max-w-[760px] text-lg leading-relaxed text-ink/90">{textos.intro}</p>
        <p className="mb-8 max-w-[760px] font-mono text-xs leading-relaxed text-ink/60">
          {textos.metodo}
        </p>
        <div className="overflow-x-auto border-[1.5px] border-ink/15 bg-canvas">
          <table className="w-full min-w-[820px] border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-ink text-left text-[10px] tracking-widest text-canvas uppercase">
                {textos.columnas.map((columna) => (
                  <th key={columna} className="px-3 py-2.5 font-bold">
                    {columna}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.map((fila) => (
                <tr key={fila.id} className="border-t border-linea">
                  <td className="px-3 py-2.5 font-sans text-sm">{fila.nombre}</td>
                  <td className="px-3 py-2.5">{fila.glosario ? textos.si : textos.no}</td>
                  <td className="px-3 py-2.5">{celda(fila).wer}</td>
                  <td className="px-3 py-2.5">{celda(fila).terminos}</td>
                  <td className="px-3 py-2.5">{celda(fila).retraso}</td>
                  <td className="px-3 py-2.5">{celda(fila).costo}</td>
                  <td className="px-3 py-2.5">
                    {fila.sinInternet ? "✓" : "—"}
                    {fila.nota && <span className="text-ink/55"> · {fila.nota}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 max-w-[760px] font-mono text-xs text-ink/60">{textos.pie}</p>
        {filas.some((fila) => fila.fuente !== null) && (
          <section className="mt-6 max-w-[900px]">
            <h2 className="mb-2 font-mono text-[10px] font-bold tracking-widest text-ink/55 uppercase">
              {textos.fuentes}
            </h2>
            <ul className="flex flex-col gap-2 font-mono text-xs leading-relaxed text-ink/70">
              {filas.map(
                (fila) =>
                  fila.fuente !== null && (
                    <li key={fila.id}>
                      <span className="font-bold text-ink">{fila.nombre}:</span> {fila.fuente}
                    </li>
                  ),
              )}
            </ul>
          </section>
        )}
        <div className="mt-12 border-l-4 border-naranja bg-canvas p-6">
          <span className="font-mono text-[11px] tracking-widest text-naranja uppercase">
            {textos.probaloVos}
          </span>
          <h2 className="mt-2 mb-3 font-display text-4xl leading-none uppercase">
            {textos.enTuNavegador}
          </h2>
          <p className="mb-5 max-w-[640px]">{textos.probarTexto}</p>
          <Link
            to={rutaProbar}
            className="inline-flex items-center gap-2 bg-naranja px-5 py-3 font-mono text-xs font-bold tracking-widest uppercase hover:bg-ink hover:text-canvas"
          >
            {textos.probarBoton}
          </Link>
        </div>
      </div>
    </main>
  );
}

function formatearCelda(fila: Fila, idioma: Idioma) {
  const aMedir = TEXTOS_COMPARACION[idioma].aMedir;
  const numero = (valor: number, decimales: number) =>
    valor.toLocaleString(LOCALES[idioma], {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales,
    });
  return {
    wer: fila.wer === null ? aMedir : `${numero(fila.wer * 100, 1)} %`,
    terminos:
      fila.terminos === null
        ? aMedir
        : `${String(fila.terminos.bien)}/${String(fila.terminos.total)}`,
    retraso: fila.retrasoSegundos === null ? aMedir : `${numero(fila.retrasoSegundos, 1)} s`,
    costo: `${fila.costoAproximado ? "~" : ""}$${numero(fila.costoPorHora, fila.costoPorHora === 0 ? 0 : 3)}`,
  };
}
