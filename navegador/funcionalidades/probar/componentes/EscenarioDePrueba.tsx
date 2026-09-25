import { useState } from "react";
import type { Idioma } from "@nativox/compartido/contratos";
import type { Prueba } from "../hooks/usePrueba";
import { describirAvance } from "../textos";
import { TEXTOS_ESCENARIO } from "../textos-escenario";

export interface PropiedadesEscenario {
  idioma: Idioma;
  prueba: Prueba;
  // Al enviar, con lo que la persona escribió que dijo (puede ir vacío).
  alEnviar: (referencia: string) => void;
}

const boton =
  "rounded-sm px-5 py-3 font-mono text-xs font-bold tracking-widest uppercase disabled:cursor-not-allowed disabled:opacity-40";
const botonPrincipal = `${boton} bg-naranja text-ink shadow-sm hover:bg-ink hover:text-canvas`;
const botonSecundario = `${boton} border-[1.5px] border-ink hover:bg-ink hover:text-canvas`;

// El recuadro del centro: dice qué está pasando en cada paso de la prueba (descarga con su barra,
// listo para grabar, grabando con cuenta regresiva, revisar lo grabado y procesar).
export function EscenarioDePrueba({ idioma, prueba, alEnviar }: PropiedadesEscenario) {
  const textos = TEXTOS_ESCENARIO[idioma];
  const { estado } = prueba;

  return (
    <div
      className="flex min-h-[320px] flex-col items-center justify-center gap-5 px-2 py-6 text-center"
      role="status"
      aria-live="polite"
    >
      {estado.fase === "preparando" && (
        <>
          <Titulo>{textos.descargando.titulo}</Titulo>
          <Barra proporcion={estado.avance.proporcion} />
          <p className="font-mono text-sm font-bold">{describirAvance(estado.avance, idioma)}</p>
          <Ayuda>{textos.descargando.ayuda}</Ayuda>
        </>
      )}

      {estado.fase === "listo" && (
        <>
          <Titulo>{textos.listo.titulo}</Titulo>
          <Ayuda>{textos.listo.ayuda}</Ayuda>
          <div className="flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => void prueba.grabar()} className={botonPrincipal}>
              {textos.listo.grabar}
            </button>
            <button type="button" onClick={prueba.descartar} className={botonSecundario}>
              {textos.listo.cancelar}
            </button>
          </div>
          <p className="font-mono text-[11px] text-ink/55">{textos.listo.cuenta}</p>
        </>
      )}

      {estado.fase === "grabando" && (
        <>
          <span className="flex items-center gap-3 text-red-700">
            <span className="size-4 animate-pulse rounded-full bg-red-600" aria-hidden />
            <Titulo>{textos.grabando.titulo}</Titulo>
          </span>
          <p className="font-display text-7xl leading-none">
            {prueba.segundosRestantes === null ? "" : String(prueba.segundosRestantes)}
          </p>
          <p className="font-mono text-xs text-ink/70">
            {prueba.segundosRestantes === null
              ? ""
              : textos.grabando.quedan(prueba.segundosRestantes)}
          </p>
          <Barra proporcion={prueba.nivelDeVoz} color="bg-verde" />
          <Ayuda>{textos.grabando.ayuda}</Ayuda>
          <button type="button" onClick={prueba.terminarGrabacion} className={botonPrincipal}>
            {textos.grabando.terminar}
          </button>
        </>
      )}

      {estado.fase === "revisando" && (
        <Revisando idioma={idioma} prueba={prueba} silencio={estado.silencio} alEnviar={alEnviar} />
      )}

      {estado.fase === "procesando" && (
        <>
          <Titulo>{textos.procesando.titulo}</Titulo>
          <Barra proporcion={null} />
          <Ayuda>{textos.procesando.ayuda}</Ayuda>
        </>
      )}
    </div>
  );
}

function Revisando({
  idioma,
  prueba,
  silencio,
  alEnviar,
}: {
  idioma: Idioma;
  prueba: Prueba;
  silencio: boolean;
  alEnviar: (referencia: string) => void;
}) {
  const textos = TEXTOS_ESCENARIO[idioma].revisando;
  const [referencia, setReferencia] = useState("");
  return (
    <form
      className="flex w-full max-w-[640px] flex-col items-center gap-4 text-left"
      onSubmit={(evento) => {
        evento.preventDefault();
        alEnviar(referencia.trim());
      }}
    >
      <Titulo>{textos.titulo}</Titulo>
      {prueba.urlDeAudio && (
        <audio controls src={prueba.urlDeAudio} aria-label={textos.escuchar} className="w-full" />
      )}
      {silencio && <p className="font-mono text-xs text-naranja">{textos.silencio}</p>}
      <label className="flex w-full flex-col gap-1.5">
        <span className="font-mono text-[10px] font-bold tracking-widest text-ink/60 uppercase">
          {textos.referencia}
        </span>
        <textarea
          value={referencia}
          onChange={(evento) => setReferencia(evento.target.value)}
          rows={3}
          placeholder={textos.placeholder}
          className="w-full rounded-sm border-[1.5px] border-ink/25 bg-canvas px-3 py-2 font-mono text-sm"
        />
        <span className="font-mono text-[11px] text-ink/50">{textos.referenciaAyuda}</span>
      </label>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="submit" className={botonPrincipal}>
          {textos.enviar}
        </button>
        <button type="button" onClick={() => void prueba.grabar()} className={botonSecundario}>
          {textos.grabarDeNuevo}
        </button>
      </div>
    </form>
  );
}

function Titulo({ children }: { children: React.ReactNode }) {
  return <h3 className="font-display text-4xl leading-none uppercase">{children}</h3>;
}

function Ayuda({ children }: { children: React.ReactNode }) {
  return <p className="max-w-[560px] font-mono text-xs text-ink/70">{children}</p>;
}

// Barra de progreso; sin número (null) es una barra que se mueve sola, para "está trabajando".
function Barra({
  proporcion,
  color = "bg-naranja",
}: {
  proporcion: number | null;
  color?: string;
}) {
  return (
    <div className="h-2.5 w-full max-w-[560px] overflow-hidden bg-ink/10" aria-hidden>
      <div
        className={`h-full ${color} ${proporcion === null ? "w-1/3 animate-pulse" : "transition-[width]"}`}
        style={
          proporcion === null ? undefined : { width: `${String(Math.round(proporcion * 100))}%` }
        }
      />
    </div>
  );
}
