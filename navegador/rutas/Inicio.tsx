import type { Idioma } from "@nativox/compartido/contratos";
import { BotonDespliegue } from "@navegador/funcionalidades/boton-despliegue";
import { Portada, QueEs, type AvisoPortada } from "@navegador/funcionalidades/inicio";
import { Encabezado, Pie, rutaDe } from "@navegador/funcionalidades/marco";
import { usePruebaEnLaNube, type EstadoNube } from "@navegador/funcionalidades/probar";

// / — el botón de la portada transcribe con Whisper en Workers AI: no se descarga ningún modelo.
export function Inicio({ idioma }: { idioma: Idioma }) {
  const nube = usePruebaEnLaNube();
  const { fase } = nube.estado;

  return (
    <>
      <Portada
        idioma={idioma}
        encabezado={<Encabezado idioma={idioma} pagina="inicio" />}
        lineas={nube.linea ? [nube.linea] : []}
        aviso={avisoDe(nube.estado)}
        pruebasRestantes={nube.pruebasRestantes}
        rutaProbar={rutaDe("probar", idioma)}
        enVivo={fase === "escuchando"}
        segundosRestantes={nube.segundosRestantes}
        ocupado={
          fase === "escuchando" ||
          fase === "transcribiendo" ||
          fase === "traduciendo" ||
          fase === "sin-cupo"
        }
        alIniciar={(idiomaHablado, mostrarEn) => void nube.iniciar(idiomaHablado, mostrarEn)}
        alDetener={() => void nube.terminar()}
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
  if (estado.fase === "transcribiendo" || estado.fase === "traduciendo")
    return { tipo: estado.fase };
  if (estado.fase === "sin-cupo")
    return { tipo: "sin-cupo", reintentarEnSegundos: estado.reintentarEnSegundos };
  if (estado.fase === "error") return { tipo: "error", detalle: estado.motivo };
  return null;
}
