import type { Resultado } from "@nativox/compartido/contratos";

// Comprueba que el navegador deja usar el micrófono, sin grabar nada. Se hace antes de anotar una
// de las pruebas del día, para que un permiso negado no gaste una.
export async function comprobarMicrofono(): Promise<Resultado<undefined>> {
  try {
    const flujo = await navigator.mediaDevices.getUserMedia({ audio: true });
    for (const pista of flujo.getTracks()) pista.stop();
    return { ok: true, valor: undefined };
  } catch (error) {
    const nombre = error instanceof DOMException ? error.name : "";
    if (nombre === "NotAllowedError") {
      return {
        ok: false,
        motivo:
          "El navegador no dio permiso para usar el micrófono. Permitilo desde el candado de la barra de direcciones.",
      };
    }
    if (nombre === "NotFoundError") {
      return {
        ok: false,
        motivo: "No se encontró ningún micrófono. Conectá uno y volvé a probar.",
      };
    }
    return {
      ok: false,
      motivo: `No se pudo abrir el micrófono (${error instanceof Error ? error.message : String(error)}).`,
    };
  }
}
