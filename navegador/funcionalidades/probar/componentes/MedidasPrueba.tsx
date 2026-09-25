import type { Idioma } from "@nativox/compartido/contratos";
import type { ResumenPrueba } from "../resumen";
import { TEXTOS_PROBAR } from "../textos";

const porcentaje = (valor: number) => `${(valor * 100).toFixed(1)} %`;
const segundos = (valor: number) => `${valor.toFixed(1)} s`;
const milisegundos = (valor: number) => `${String(Math.round(valor))} ms`;

export function MedidasPrueba({ resumen, idioma }: { resumen: ResumenPrueba; idioma: Idioma }) {
  const textos = TEXTOS_PROBAR[idioma];
  const sinDato = "—";
  const filas: [string, string][] = [
    [textos.wer, resumen.wer === null ? textos.sinReferencia : porcentaje(resumen.wer)],
    [
      textos.terminos,
      resumen.terminos === null
        ? textos.sinReferencia
        : `${String(resumen.terminos.bien)}/${String(resumen.terminos.total)}`,
    ],
    [
      textos.retraso,
      resumen.retrasoSegundos === null ? sinDato : segundos(resumen.retrasoSegundos),
    ],
    [textos.pasada, resumen.pasadaMs === null ? sinDato : milisegundos(resumen.pasadaMs)],
    [
      textos.traduccion,
      resumen.traduccionMs === null ? sinDato : milisegundos(resumen.traduccionMs),
    ],
  ];

  return (
    <table className="w-full border-collapse font-mono text-xs">
      <thead>
        <tr className="text-left text-[10px] tracking-widest text-ink/50 uppercase">
          <th className="py-1 font-bold">{textos.medida}</th>
          <th className="py-1 text-right font-bold">{textos.valor}</th>
        </tr>
      </thead>
      <tbody>
        {filas.map(([nombre, valor]) => (
          <tr key={nombre} className="border-t border-linea">
            <td className="py-1.5">{nombre}</td>
            <td className="py-1.5 text-right">{valor}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
