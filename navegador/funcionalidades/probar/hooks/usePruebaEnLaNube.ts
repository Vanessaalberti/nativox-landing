import { useCallback, useEffect, useRef, useState } from "react";
import type { Idioma, Linea } from "@nativox/compartido/contratos";
import { crearBergamot, type Traductor } from "@nativox/navegador/modulos/traduccion";
import { consultarCupos, transcribirEnLaNube } from "../nube/cliente-nube";
import { FRECUENCIA, grabarMicrofono, type Grabacion } from "../nube/grabadora";
import { aWav } from "../../../../contratos-landing/wav";
import { useLimiteDeTiempo } from "./useLimiteDeTiempo";

// La portada deja hablar hasta 15 s (el Worker rechaza más): alcanza para ver cómo funciona y
// gasta poco.
const SEGUNDOS_POR_PRUEBA = 15;

export type EstadoNube =
  | { fase: "inactiva" }
  | { fase: "escuchando" }
  | { fase: "transcribiendo" }
  | { fase: "traduciendo" }
  | { fase: "sin-cupo"; reintentarEnSegundos: number }
  | { fase: "error"; motivo: string };

// Bergamot (~22 MB por par, guardado en el navegador) solo se baja si se pide ver una traducción.
let traductor: Promise<Traductor> | null = null;
function obtenerTraductor(): Promise<Traductor> {
  traductor ??= crearBergamot("/bergamot/translator.js").then((resultado) => {
    if (!resultado.ok) throw new Error(resultado.motivo);
    return resultado.valor;
  });
  return traductor;
}

// Portada: graba hasta 15 s, manda el audio a Whisper en Workers AI (sin descargar el modelo) y
// muestra el texto o su traducción. El cupo por dispositivo lo lleva el servidor.
export function usePruebaEnLaNube() {
  const [estado, setEstado] = useState<EstadoNube>({ fase: "inactiva" });
  const [linea, setLinea] = useState<Linea | null>(null);
  const [pruebasRestantes, setPruebasRestantes] = useState<number | null>(null);
  const grabacion = useRef<Grabacion | null>(null);
  const idiomas = useRef<{ hablado: Idioma; mostrarEn: Idioma }>({
    hablado: "es",
    mostrarEn: "es",
  });

  useEffect(() => {
    void consultarCupos().then((cupos) => {
      if (!cupos.ok) return;
      setPruebasRestantes(cupos.valor.restantes);
      if (cupos.valor.restantes === 0) {
        setEstado({ fase: "sin-cupo", reintentarEnSegundos: cupos.valor.reintentarEnSegundos });
      }
    });
  }, []);

  const terminar = useCallback(async () => {
    const actual = grabacion.current;
    if (!actual) return;
    grabacion.current = null;
    setEstado({ fase: "transcribiendo" });
    const { hablado, mostrarEn } = idiomas.current;
    const respuesta = await transcribirEnLaNube(aWav(actual.terminar(), FRECUENCIA), hablado);
    if (!respuesta.ok) {
      setEstado(
        respuesta.codigo === "sin-cupo"
          ? { fase: "sin-cupo", reintentarEnSegundos: respuesta.reintentarEnSegundos }
          : { fase: "error", motivo: respuesta.mensaje },
      );
      if (respuesta.codigo === "sin-cupo") setPruebasRestantes(0);
      return;
    }
    setPruebasRestantes(respuesta.restantes);
    const nueva: Linea = {
      tipo: "linea",
      id: String(Date.now()),
      original: respuesta.texto,
      traducciones: {},
      provisoria: false,
      inicio: 0,
      fin: 0,
    };
    setLinea(nueva);
    if (mostrarEn !== hablado && respuesta.texto !== "") {
      setEstado({ fase: "traduciendo" });
      const traducido = await (
        await obtenerTraductor()
      ).traducir(respuesta.texto, hablado, mostrarEn);
      if (traducido.ok) setLinea({ ...nueva, traducciones: { [mostrarEn]: traducido.valor } });
    }
    setEstado({ fase: "inactiva" });
  }, []);

  const iniciar = useCallback(
    async (hablado: Idioma, mostrarEn: Idioma) => {
      idiomas.current = { hablado, mostrarEn };
      setLinea(null);
      const nueva = await grabarMicrofono(() => void terminar());
      if (!nueva.ok) {
        setEstado({ fase: "error", motivo: nueva.motivo });
        return;
      }
      grabacion.current = nueva.valor;
      setEstado({ fase: "escuchando" });
    },
    [terminar],
  );

  const segundosRestantes = useLimiteDeTiempo(
    estado.fase === "escuchando",
    SEGUNDOS_POR_PRUEBA,
    () => {
      void terminar();
    },
  );

  return { estado, linea, pruebasRestantes, segundosRestantes, iniciar, terminar };
}
