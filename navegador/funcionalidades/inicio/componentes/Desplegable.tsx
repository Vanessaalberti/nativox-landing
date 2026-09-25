import { useEffect, useId, useRef, useState } from "react";

interface OpcionDesplegable<T extends string> {
  valor: T;
  nombre: string;
}

export interface PropiedadesDesplegable<T extends string> {
  etiqueta: string;
  valor: T;
  opciones: readonly OpcionDesplegable<T>[];
  deshabilitado?: boolean;
  alElegir: (valor: T) => void;
}

// Selector oscuro de la maqueta (fondo `menu`, la opción elegida en naranja con su tilde).
export function Desplegable<T extends string>({
  etiqueta,
  valor,
  opciones,
  deshabilitado = false,
  alElegir,
}: PropiedadesDesplegable<T>) {
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);
  const idEtiqueta = useId();
  const elegida = opciones.find((opcion) => opcion.valor === valor);

  useEffect(() => {
    const cerrarAfuera = (evento: MouseEvent) => {
      if (evento.target instanceof Node && !contenedor.current?.contains(evento.target))
        setAbierto(false);
    };
    document.addEventListener("click", cerrarAfuera);
    return () => document.removeEventListener("click", cerrarAfuera);
  }, []);

  return (
    <div ref={contenedor} className="relative z-30">
      <span
        id={idEtiqueta}
        className="mb-2 block font-mono text-[10px] font-bold tracking-widest text-ink/70 uppercase"
      >
        {etiqueta}
      </span>
      <button
        type="button"
        aria-labelledby={idEtiqueta}
        aria-haspopup="listbox"
        aria-expanded={abierto}
        disabled={deshabilitado}
        onClick={() => setAbierto((actual) => !actual)}
        className="flex w-full items-center justify-between rounded-sm bg-menu px-3.5 py-2.5 font-mono text-xs font-bold text-[#E8ECE9] uppercase shadow-sm transition-colors hover:bg-[#1f3830] disabled:opacity-50"
      >
        <span>{elegida?.nombre ?? valor}</span>
        <svg
          className={`size-3.5 text-naranja transition-transform duration-150 ${abierto ? "rotate-180" : ""}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden
        >
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </button>
      {abierto && (
        <ul
          role="listbox"
          aria-labelledby={idEtiqueta}
          className="absolute top-full right-0 left-0 mt-1 flex flex-col overflow-hidden rounded-sm bg-menu font-mono text-xs shadow-lg"
        >
          {opciones.map((opcion) => {
            const activa = opcion.valor === valor;
            return (
              <li key={opcion.valor} role="option" aria-selected={activa}>
                <button
                  type="button"
                  onClick={() => {
                    alElegir(opcion.valor);
                    setAbierto(false);
                  }}
                  className={`flex w-full items-center justify-between px-3.5 py-1.5 text-left uppercase transition-colors ${activa ? "bg-naranja font-bold text-ink" : "text-gray-300 hover:bg-white/5 hover:text-white"}`}
                >
                  <span>{opcion.nombre}</span>
                  <svg
                    className={`size-3.5 stroke-ink stroke-2 ${activa ? "" : "opacity-0"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
