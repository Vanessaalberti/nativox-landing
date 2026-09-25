import type { Idioma } from "@nativox/compartido/contratos";
import { BotonDespliegue } from "@navegador/funcionalidades/boton-despliegue";
import { Portada, QueEs, type AvisoPortada } from "@navegador/funcionalidades/inicio";
import { Encabezado, Pie, rutaDe } from "@navegador/funcionalidades/marco";
import { usePruebaEnLaNube, type EstadoNube } from "@navegador/funcionalidades/probar";

// / — el botón de la portada muestra subtítulos en tiempo real con Whisper en Workers AI: no se
// descarga ningún modelo de transcripción.
export function Inicio({ idioma }: { idioma: Idioma }) {
  const nube = usePruebaEnLaNube();
  const { fase } = nube.estado;
  // Al terminar o agotarse el cupo a mitad de la prueba, los subtítulos que ya salieron quedan a
  // la vista; los avisos solo reemplazan el texto si no hay nada que mostrar.
  const hayTexto = nube.lineas.some((linea) => linea.original !== "");
  const ocultarAviso = hayTexto && (fase === "sin-cupo" || fase === "transcribiendo");

  return (
    <>
      <Portada
        idioma={idioma}
        encabezado={<Encabezado idioma={idioma} pagina="inicio" />}
        lineas={nube.lineas}
        aviso={ocultarAviso ? null : avisoDe(nube.estado)}
        pruebasRestantes={nube.pruebasRestantes}
        rutaProbar={rutaDe("probar", idioma)}
        enVivo={fase === "escuchando"}
        segundosRestantes={nube.segundosRestantes}
        ocupado={
          fase === "escuchando" ||
          fase === "preparando" ||
          fase === "transcribiendo" ||
          fase === "sin-cupo"
        }
        alIniciar={(idiomaHablado, mostrarEn) => void nube.iniciar(idiomaHablado, mostrarEn)}
        alDetener={() => void nube.detener()}
      />
      <QueEs
        idioma={idioma}
        rutaComoFunciona={rutaDe("como-funciona", idioma)}
        despliegue={<BotonDespliegue idioma={idioma} />}
      />
      <Pie idioma={idioma} />
    </>
  );
}

function avisoDe(estado: EstadoNube): AvisoPortada | null {
  if (estado.fase === "transcribiendo" || estado.fase === "preparando")
    return { tipo: estado.fase };
  if (estado.fase === "sin-cupo")
    return { tipo: "sin-cupo", reintentarEnSegundos: estado.reintentarEnSegundos };
  if (estado.fase === "error") return { tipo: "error", detalle: estado.motivo };
  return null;
}
