import { useState } from "react";
import { Link } from "react-router";
import type { Idioma, Linea } from "@nativox/compartido/contratos";
import { TEXTOS_INICIO } from "../textos";
import { Dial } from "./Dial";
import { Franja } from "./Franja";
import { PanelEnVivo } from "./PanelEnVivo";

export interface PropiedadesPortada {
  idioma: Idioma;
  encabezado: React.ReactNode;
  lineas: readonly Linea[];
  // Lo que se muestra en lugar del texto mientras la nube trabaja o si algo no salió.
  aviso: AvisoPortada | null;
  pruebasRestantes: number | null;
  rutaProbar: string;
  enVivo: boolean;
  // Cuenta regresiva de la grabación (la portada deja hablar hasta 15 s); null si no hay.
  segundosRestantes: number | null;
  ocupado: boolean;
  // Arranca la transcripción con el micrófono: `idiomaHablado` es lo que se dice y `mostrarEn`,
  // lo que se muestra (el original o una traducción).
  alIniciar: (idiomaHablado: Idioma, mostrarEn: Idioma) => void;
  alDetener: () => void;
}

export type AvisoPortada =
  | { tipo: "transcribiendo" }
  | { tipo: "traduciendo" }
  | { tipo: "sin-cupo"; reintentarEnSegundos: number }
  | { tipo: "error"; detalle: string };

export function Portada({
  idioma,
  encabezado,
  lineas,
  aviso,
  pruebasRestantes,
  rutaProbar,
  enVivo,
  segundosRestantes,
  ocupado,
  alIniciar,
  alDetener,
}: PropiedadesPortada) {
  const textos = TEXTOS_INICIO[idioma];
  const [idiomaHablado, setIdiomaHablado] = useState<Idioma>(idioma);
  const [mostrarEn, setMostrarEn] = useState<Idioma>(idioma);
  const [titulo1, titulo2, titulo3, titulo4, titulo5] = textos.titulo;
  const estado = describirAviso(aviso, idioma, rutaProbar);
  const notaEnReposo = [
    textos.limite,
    pruebasRestantes === null ? null : textos.pruebas(pruebasRestantes),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className="grilla-fondo relative flex min-h-screen w-full flex-col justify-between overflow-hidden lg:h-screen">
      <Adornos />
      {encabezado}
      <main className="relative z-10 mx-auto grid w-full max-w-[1680px] flex-1 grid-cols-1 items-center gap-y-12 px-5 py-16 md:px-8 lg:grid-cols-12 lg:gap-y-0 lg:py-0 lg:pt-[70px]">
        <section className="flex flex-col justify-center lg:col-span-5 lg:-mt-6 lg:pr-6">
          <h1 className="mb-6 font-display text-[68px] leading-[0.9] font-extrabold tracking-tight uppercase select-text lg:text-[78px] xl:text-[88px]">
            {titulo1}
            <br />
            {titulo2}{" "}
            <span className="underline decoration-naranja decoration-[5px] underline-offset-[3px]">
              {titulo3}
            </span>
            ,<span className="block pt-4">{titulo4}</span>
            <span className="inline-flex items-baseline">
              {titulo5}
              <span className="ml-2 inline-block size-4 -translate-y-[2px] bg-verde" />
              <span className="ml-1 inline-block size-4 translate-y-[9px] bg-verde" />
            </span>
          </h1>
          <p className="mb-6 text-[17px] font-medium tracking-tight text-ink/90">
            {textos.bajada[0]}
            <br />
            {textos.bajada[1]}
          </p>
          <p className="text-[15px] font-bold">{textos.invitacion}</p>
        </section>
        <Dial
          etiquetaAudio={textos.audio}
          etiquetaEntrada={textos.entrada}
          textoBoton={enVivo ? textos.detener : textos.iniciar}
          nota={
            enVivo && segundosRestantes !== null
              ? `${textos.quedan} ${String(segundosRestantes)} s`
              : notaEnReposo
          }
          enVivo={enVivo}
          deshabilitado={ocupado && !enVivo}
          alPulsar={() => (enVivo ? alDetener() : alIniciar(idiomaHablado, mostrarEn))}
        />
        <PanelEnVivo
          idioma={idioma}
          lineas={lineas}
          estado={estado}
          enVivo={enVivo}
          ocupado={ocupado}
          idiomaHablado={idiomaHablado}
          mostrarEn={mostrarEn}
          alCambiarIdiomaHablado={(elegido) => {
            setIdiomaHablado(elegido);
            setMostrarEn(elegido);
          }}
          alCambiarMostrarEn={setMostrarEn}
        />
      </main>
      <BarraInferior />
      <Franja textos={textos.franja} />
    </section>
  );
}

function describirAviso(
  aviso: AvisoPortada | null,
  idioma: Idioma,
  rutaProbar: string,
): React.ReactNode {
  const textos = TEXTOS_INICIO[idioma];
  if (!aviso) return null;
  if (aviso.tipo === "transcribiendo" || aviso.tipo === "traduciendo") return textos[aviso.tipo];
  if (aviso.tipo === "error") return aviso.detalle;
  return (
    <>
      {textos.sinCupo(Math.max(1, Math.ceil(aviso.reintentarEnSegundos / 3600)))}{" "}
      <Link to={rutaProbar} className="font-bold text-ink underline decoration-naranja">
        {textos.probarLocal}
      </Link>
    </>
  );
}

function BarraInferior() {
  return (
    <footer className="relative z-20 flex h-14 w-full items-center justify-between px-5 font-mono text-xs md:px-8">
      <div className="flex items-center gap-3">
        <div className="flex flex-col gap-[2px]">
          <div className="size-3.5 bg-naranja" />
          <div className="size-3.5 bg-verde" />
        </div>
        <div className="font-mono text-[9px] leading-tight tracking-wider text-ink/70 uppercase">
          <div>Open source</div>
          <div>Live transcription</div>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="hidden items-center sm:flex">
          <div className="h-3 w-36 bg-naranja" />
          <div className="h-3 w-16 bg-verde" />
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-bold">
          <span className="text-sm text-naranja">◇</span>
          <span className="tracking-widest">LIVE</span>
        </div>
      </div>
    </footer>
  );
}

// Grilla técnica de la maqueta: líneas de coordenadas, cruces y números en los márgenes.
function Adornos() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 hidden lg:block" aria-hidden>
      <div className="absolute top-[60px] right-0 left-0 border-b border-linea-fuerte" />
      <div className="absolute top-[65%] right-0 left-0 border-b border-linea" />
      <div className="absolute top-0 bottom-0 left-[34%] border-r border-linea" />
      <div className="absolute top-0 bottom-0 left-[62%] border-r border-linea" />
      <span className="absolute top-[148px] left-[58px] font-mono text-sm leading-none font-bold text-naranja">
        +
      </span>
      <span className="absolute top-[242px] left-[34%] font-mono text-sm leading-none font-bold text-naranja">
        +
      </span>
      <span className="absolute top-[242px] left-[62%] font-mono text-sm leading-none font-bold text-naranja">
        +
      </span>
      <span className="absolute top-[172px] left-[24px] font-mono text-[11px] tracking-wider text-ink/40">
        001
      </span>
      <div className="absolute top-[172px] right-[24px] flex flex-col items-end font-mono text-[10px] leading-snug text-ink/35">
        <span>01</span>
        <span>02</span>
        <span>03</span>
      </div>
    </div>
  );
}
