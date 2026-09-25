import { IDIOMAS, type Idioma, type Linea } from "@nativox/compartido/contratos";
import { TEXTOS_INICIO } from "../textos";
import { Desplegable } from "./Desplegable";

const NOMBRES: Record<Idioma, string> = { es: "Español", en: "English", pt: "Português" };
const LINEAS_VISIBLES = 4;

export interface PropiedadesPanelEnVivo {
  idioma: Idioma;
  lineas: readonly Linea[];
  // Mientras se preparan los modelos o si algo falló, se muestra en lugar del texto.
  estado: React.ReactNode;
  enVivo: boolean;
  ocupado: boolean;
  idiomaHablado: Idioma;
  mostrarEn: Idioma;
  alCambiarIdiomaHablado: (idioma: Idioma) => void;
  alCambiarMostrarEn: (idioma: Idioma) => void;
}

// Columna derecha de la portada: en reposo muestra el texto de ejemplo de la maqueta; al iniciar,
// lo que la persona va diciendo (o su traducción).
export function PanelEnVivo(propiedades: PropiedadesPanelEnVivo) {
  const { idioma, lineas, estado, enVivo, ocupado, idiomaHablado, mostrarEn } = propiedades;
  const textos = TEXTOS_INICIO[idioma];
  const visibles = lineas.filter((linea) => linea.original.trim() !== "").slice(-LINEAS_VISIBLES);
  const opcionesMostrar = [
    { valor: idiomaHablado, nombre: `${textos.original} (${NOMBRES[idiomaHablado]})` },
    ...IDIOMAS.filter((opcion) => opcion !== idiomaHablado).map((opcion) => ({
      valor: opcion,
      nombre: NOMBRES[opcion],
    })),
  ];

  return (
    <section className="flex flex-col lg:col-span-4 lg:-mt-4 lg:pl-6">
      <div className="mb-5">
        <span className="inline-block rounded-sm bg-verde px-3 py-1 font-mono text-[11px] font-bold tracking-wider text-ink uppercase">
          {textos.enVivo}
        </span>
      </div>
      <div
        className="min-h-[140px] font-sans text-[17px] leading-[1.4] font-normal tracking-tight text-ink select-text xl:text-[19px]"
        aria-live="polite"
      >
        {estado ? (
          <p className="font-mono text-sm text-ink/70">{estado}</p>
        ) : visibles.length === 0 && !enVivo ? (
          <p>
            {textos.reposo.map((renglon, indice) => (
              <span key={renglon}>
                {renglon}
                {indice < textos.reposo.length - 1 ? <br /> : " "}
              </span>
            ))}
            <span className="font-medium text-naranja">{textos.ultimaPalabra}</span>
            <Cursor />
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {visibles.map((linea) => {
              const texto =
                mostrarEn === idiomaHablado
                  ? linea.original
                  : linea.provisoria
                    ? "…"
                    : (linea.traducciones[mostrarEn] ?? "…");
              return (
                <p key={linea.id} className={linea.provisoria ? "text-ink/45" : ""}>
                  {texto}
                </p>
              );
            })}
            <Cursor />
          </div>
        )}
      </div>
      <div className="mt-8 grid grid-cols-2 gap-4 pt-6">
        <Desplegable
          etiqueta={textos.idiomaHablado}
          valor={idiomaHablado}
          deshabilitado={ocupado}
          opciones={IDIOMAS.map((opcion) => ({ valor: opcion, nombre: NOMBRES[opcion] }))}
          alElegir={propiedades.alCambiarIdiomaHablado}
        />
        <Desplegable
          etiqueta={textos.mostrarEn}
          valor={mostrarEn}
          deshabilitado={ocupado}
          opciones={opcionesMostrar}
          alElegir={propiedades.alCambiarMostrarEn}
        />
      </div>
    </section>
  );
}

function Cursor() {
  return (
    <span
      className="ml-0.5 inline-block h-[18px] w-[2px] animate-titilar-cursor bg-ink align-middle"
      aria-hidden
    />
  );
}
