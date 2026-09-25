import * as v from "valibot";
import type { Idioma, Resultado } from "@nativox/compartido/contratos";
import {
  esquemaCupos,
  esquemaRespuestaTranscripcion,
  type Cupos,
  type RespuestaTranscripcion,
} from "../../../../contratos-landing/nube";

// Un corte de red (502/503/504) se reintenta una vez a los 2 s; el servidor no cobra los pedidos
// que fallan, así que reintentar no gasta cupo.
const ESPERA_REINTENTO_MS = 2000;

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

async function enviar(
  wav: Uint8Array<ArrayBuffer>,
  idioma: Idioma,
  prompt: string,
): Promise<RespuestaTranscripcion> {
  try {
    const respuesta = await fetch(`/api/transcribir?idioma=${idioma}`, {
      method: "POST",
      credentials: "same-origin",
      // En un encabezado y no en la URL: es lo que se viene diciendo, no tiene que quedar en los
      // registros.
      headers: { "Content-Type": "audio/wav", "X-Nativox-Prompt": encodeURIComponent(prompt) },
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

export async function transcribirEnLaNube(
  wav: Uint8Array<ArrayBuffer>,
  idioma: Idioma,
  prompt: string,
): Promise<RespuestaTranscripcion> {
  const primera = await enviar(wav, idioma, prompt);
  if (primera.ok || primera.codigo !== "fallo-del-modelo") return primera;
  await new Promise((seguir) => setTimeout(seguir, ESPERA_REINTENTO_MS));
  return enviar(wav, idioma, prompt);
}
