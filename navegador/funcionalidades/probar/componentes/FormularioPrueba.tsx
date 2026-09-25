import { useState } from "react";
import { IDIOMAS, esquemaIdioma, validar, type Idioma } from "@nativox/compartido/contratos";
import type { ConfiguracionPrueba } from "../motor/armar-prueba";
import { NOMBRES_DE_IDIOMA, TEXTOS_PROBAR } from "../textos";

const etiqueta = "font-mono text-[10px] font-bold tracking-widest text-ink/60 uppercase";
const campo =
  "w-full rounded-sm border-[1.5px] border-ink/25 bg-canvas px-3 py-2 font-mono text-sm";

export interface PropiedadesFormulario {
  idioma: Idioma;
  ocupada: boolean;
  referencia: string;
  alCambiarReferencia: (texto: string) => void;
  alIniciar: (configuracion: ConfiguracionPrueba) => void;
}

export function FormularioPrueba({
  idioma,
  ocupada,
  referencia,
  alCambiarReferencia,
  alIniciar,
}: PropiedadesFormulario) {
  const textos = TEXTOS_PROBAR[idioma];
  const [conArchivo, setConArchivo] = useState(false);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [original, setOriginal] = useState<Idioma>(idioma);
  const [destino, setDestino] = useState<Idioma[]>(IDIOMAS.filter((i) => i !== idioma).slice(0, 1));
  const [glosario, setGlosario] = useState("");

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

  return (
    <form
      className="grid gap-4 md:grid-cols-2"
      onSubmit={(evento) => {
        evento.preventDefault();
        alIniciar({
          archivo: conArchivo ? archivo : null,
          idiomaOriginal: original,
          idiomasDestino: destino,
          glosario,
        });
      }}
    >
      <fieldset className="flex flex-col gap-1.5" disabled={ocupada}>
        <legend className={etiqueta}>{textos.fuente}</legend>
        <div className="flex gap-4 pt-2 font-mono text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={!conArchivo}
              onChange={() => setConArchivo(false)}
              className="accent-naranja"
            />
            {textos.microfono}
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={conArchivo}
              onChange={() => setConArchivo(true)}
              className="accent-naranja"
            />
            {textos.archivo}
          </label>
        </div>
        {conArchivo && (
          <input
            type="file"
            accept="audio/*"
            className={campo}
            onChange={(evento) => setArchivo(evento.target.files?.[0] ?? null)}
          />
        )}
      </fieldset>
      <label className="flex flex-col gap-1.5">
        <span className={etiqueta}>{textos.idiomaOriginal}</span>
        <select
          value={original}
          onChange={(evento) => cambiarOriginal(evento.target.value)}
          className={campo}
          disabled={ocupada}
        >
          {IDIOMAS.map((opcion) => (
            <option key={opcion} value={opcion}>
              {NOMBRES_DE_IDIOMA[opcion]}
            </option>
          ))}
        </select>
      </label>
      <fieldset className="flex flex-col gap-1.5" disabled={ocupada}>
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
      <label className="flex flex-col gap-1.5">
        <span className={etiqueta}>{textos.glosario}</span>
        <textarea
          value={glosario}
          onChange={(evento) => setGlosario(evento.target.value)}
          rows={3}
          className={campo}
          disabled={ocupada}
        />
      </label>
      <label className="flex flex-col gap-1.5 md:col-span-2">
        <span className={etiqueta}>{textos.referencia}</span>
        <textarea
          value={referencia}
          onChange={(evento) => alCambiarReferencia(evento.target.value)}
          rows={2}
          className={campo}
        />
        <span className="font-mono text-[11px] text-ink/50">{textos.referenciaAyuda}</span>
      </label>
      <button
        type="submit"
        disabled={ocupada || (conArchivo && !archivo)}
        className="rounded-sm bg-naranja px-5 py-3 font-mono text-xs font-bold tracking-widest text-ink uppercase shadow-sm hover:bg-ink hover:text-canvas disabled:cursor-not-allowed disabled:opacity-40 md:col-span-2 md:justify-self-start"
      >
        {textos.iniciar}
      </button>
    </form>
  );
}
