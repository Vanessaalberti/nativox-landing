// Centro de la portada: el radar con el badge cruzado del micrófono (dos rectángulos rotados en
// direcciones opuestas, con el ícono encima en z-10) y el botón con corchetes.
const BARRAS_IZQUIERDA = [
  "h-2.5 bg-verde/40",
  "h-5 bg-verde/60",
  "h-8 bg-verde/80",
  "h-12 bg-verde",
  "h-9 bg-verde",
  "h-14 bg-naranja/80",
  "h-6 bg-naranja",
];

export interface PropiedadesDial {
  etiquetaAudio: string;
  etiquetaEntrada: string;
  textoBoton: string;
  nota: string;
  enVivo: boolean;
  deshabilitado: boolean;
  alPulsar: () => void;
}

export function Dial({
  etiquetaAudio,
  etiquetaEntrada,
  textoBoton,
  nota,
  enVivo,
  deshabilitado,
  alPulsar,
}: PropiedadesDial) {
  return (
    <section className="relative flex flex-col items-center lg:col-span-3 lg:self-stretch">
      <div className="hidden flex-1 lg:block" />
      <div className="hidden flex-col items-center lg:-mt-[193px] lg:flex">
        <div className="size-2 rounded-full bg-ink" />
        <div className="h-24 w-px bg-ink/20" />
      </div>
      <div className="pointer-events-none mb-1 flex w-full justify-between px-1 font-mono text-[10px] tracking-widest text-ink/50 uppercase">
        <div className="flex flex-col items-start">
          <span>{etiquetaAudio}</span>
          <span className="font-bold text-ink/80">{etiquetaEntrada}</span>
        </div>
        <div className="flex flex-col items-end">
          <span>LIVE</span>
          <span className="font-bold text-ink/80">001</span>
        </div>
      </div>

      <div className="relative my-2 flex size-[220px] items-center justify-center">
        <div className="pointer-events-none absolute inset-2 animate-girar rounded-full border border-dashed border-ink/20" />
        <div className="pointer-events-none absolute inset-5 rounded-full border border-ink/10" />
        <div className="pointer-events-none absolute inset-6 rounded-full border-2 border-transparent border-t-ink/60 border-b-ink/60 border-l-ink/60 border-r-ink/60" />
        <Barras clases={BARRAS_IZQUIERDA} lado="-left-9" activas={enVivo} />
        <button
          type="button"
          onClick={alPulsar}
          disabled={deshabilitado}
          aria-label={textoBoton}
          className="relative grid h-24 w-20 cursor-pointer place-items-center transition-transform duration-200 hover:scale-105 disabled:cursor-wait"
        >
          <span className="col-start-1 row-start-1 z-0 h-24 w-[74px] rotate-45 bg-naranja shadow-md" />
          <span className="col-start-1 row-start-1 z-0 h-24 w-[74px] -rotate-45 bg-naranja shadow-md" />
          {/* Mientras escucha, el micrófono pasa a "detener grabación". */}
          <svg
            className="col-start-1 row-start-1 z-10 size-14 text-ink"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            {enVivo ? (
              <rect x="6.5" y="6.5" width="11" height="11" rx="1" />
            ) : (
              <>
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </>
            )}
          </svg>
        </button>
        <Barras clases={[...BARRAS_IZQUIERDA].reverse()} lado="-right-9" activas={enVivo} />
        <div className="absolute -bottom-2 size-2 rotate-45 bg-naranja" />
      </div>

      <div className="group relative mt-4">
        <span className="absolute -top-1.5 -left-2 font-mono text-xs leading-none text-naranja">
          ┌
        </span>
        <span className="absolute -top-1.5 -right-2 font-mono text-xs leading-none text-naranja">
          ┐
        </span>
        <span className="absolute -bottom-1.5 -left-2 font-mono text-xs leading-none text-naranja">
          └
        </span>
        <span className="absolute -right-2 -bottom-1.5 font-mono text-xs leading-none text-naranja">
          ┘
        </span>
        <button
          type="button"
          onClick={alPulsar}
          disabled={deshabilitado}
          className="px-5 py-1 font-mono text-xs font-bold tracking-widest text-ink uppercase transition-colors group-hover:text-naranja disabled:cursor-wait"
        >
          {textoBoton}
        </button>
      </div>
      <p
        className={`mt-3 max-w-[240px] text-center font-mono ${enVivo ? "text-xs font-bold text-naranja" : "text-[10px] text-ink/45"}`}
        aria-live="polite"
      >
        {nota}
      </p>
      <div className="hidden w-px bg-ink/20 lg:mt-4 lg:block lg:min-h-[56px] lg:flex-1" />
    </section>
  );
}

function Barras({
  clases,
  lado,
  activas,
}: {
  clases: readonly string[];
  lado: string;
  activas: boolean;
}) {
  return (
    <div className={`pointer-events-none absolute ${lado} flex h-16 items-center gap-1`}>
      {clases.map((clase, indice) => (
        <div
          key={`${String(indice)}-${clase}`}
          className={`w-1 rounded-full ${clase} ${activas ? "animate-latir" : ""}`}
        />
      ))}
    </div>
  );
}
