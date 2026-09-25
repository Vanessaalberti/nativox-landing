import * as v from "valibot";
import type { Idioma, Resultado } from "@nativox/compartido/contratos";
import {
  esquemaCupos,
  esquemaRespuestaTranscripcion,
  type Cupos,
  type RespuestaTranscripcion,
} from "../../../../contratos-landing/nube";

export async function consultarCupos(): Promise<Resultado<Cupos>> {
  try {
    const respuesta = await fetch("/api/cupos", { credentials: "same-origin" });
    const leido = v.safeParse(esquemaCupos, await respuesta.json());
    return leido.success
      ? { ok: true, valor: leido.output }
      : { ok: false, motivo: "Respuesta inesperada del servidor" };
  } catch (error) {
    return {
      ok: false,
      motivo: `Sin conexión con el servidor (${error instanceof Error ? error.message : String(error)})`,
    };
  }
}

export async function transcribirEnLaNube(
  wav: Uint8Array<ArrayBuffer>,
  idioma: Idioma,
): Promise<RespuestaTranscripcion> {
  try {
    const respuesta = await fetch(`/api/transcribir?idioma=${idioma}`, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "audio/wav" },
      body: new Blob([wav], { type: "audio/wav" }),
    });
    const leido = v.safeParse(esquemaRespuestaTranscripcion, await respuesta.json());
    if (leido.success) return leido.output;
    return {
      ok: false,
      codigo: "fallo-del-modelo",
      mensaje: "El servidor respondió algo inesperado.",
      reintentarEnSegundos: 0,
    };
  } catch (error) {
    return {
      ok: false,
      codigo: "fallo-del-modelo",
      mensaje: `No se pudo llegar al servidor (${error instanceof Error ? error.message : String(error)}).`,
      reintentarEnSegundos: 0,
    };
  }
}
