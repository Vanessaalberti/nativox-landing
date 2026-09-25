import * as v from "valibot";
import {
  esquemaRespuestaPruebaLocal,
  type RespuestaPruebaLocal,
} from "../../../../contratos-landing/nube";

// Las pruebas con micrófono en "Probar" se cuentan en el servidor (por dispositivo y por IP), así
// que recargar la página no las reinicia. El audio no viaja: solo se anota que hubo una prueba.

export async function registrarIntentoLocal(idPrueba: string): Promise<RespuestaPruebaLocal> {
  try {
    const respuesta = await fetch("/api/prueba-local", {
      method: "POST",
      credentials: "same-origin",
      headers: { "X-Nativox-Prueba": idPrueba },
    });
    const leido = v.safeParse(esquemaRespuestaPruebaLocal, await respuesta.json());
    if (leido.success) return leido.output;
    return falla("El servidor respondió algo inesperado.");
  } catch (error) {
    return falla(
      `No se pudo llegar al servidor (${error instanceof Error ? error.message : String(error)}).`,
    );
  }
}

const falla = (mensaje: string): RespuestaPruebaLocal => ({
  ok: false,
  codigo: "pedido-invalido",
  mensaje,
  reintentarEnSegundos: 0,
});
