import type { RespuestaPruebaLocal } from "../contratos-landing/nube";
import { cuposDe, juntarCupos } from "./cupos";
import { LIMITES_LOCALES } from "./limites";

export const FORMATO_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

type Tipo = keyof typeof LIMITES_LOCALES;
type Claves = Record<Tipo, string>;
const TIPOS = Object.keys(LIMITES_LOCALES) as Tipo[];

// Se cuentan aparte de las de la portada: mismas cuentas (dispositivo e IP) pero otro objeto.
const claveLocal = (claves: Claves, tipo: Tipo) => `local:${claves[tipo]}`;

const responder = (cuerpo: RespuestaPruebaLocal, estado = 200) =>
  Response.json(cuerpo, { status: estado });

// GET /api/cupos-local: cuántas pruebas con micrófono le quedan a este dispositivo hoy.
export async function consultarCuposLocales(env: Env, claves: Claves): Promise<Response> {
  const decisiones = await Promise.all(
    TIPOS.map((tipo) => cuposDe(env, claveLocal(claves, tipo)).consultar(LIMITES_LOCALES[tipo])),
  );
  return Response.json(juntarCupos(decisiones));
}

// POST /api/prueba-local: anota una prueba con micrófono. No recibe audio (la prueba corre en la
// placa de quien visita); el servidor solo lleva la cuenta para que recargar no la reinicie.
export async function registrarPruebaLocal(
  pedido: Request,
  env: Env,
  claves: Claves,
): Promise<Response> {
  const id = pedido.headers.get("X-Nativox-Prueba") ?? "";
  if (!FORMATO_UUID.test(id)) {
    return responder(
      {
        ok: false,
        codigo: "pedido-invalido",
        mensaje: "Falta el id de la prueba.",
        reintentarEnSegundos: 0,
      },
      400,
    );
  }

  const abiertas: { clave: string; inicio: number }[] = [];
  let pruebas = Number.POSITIVE_INFINITY;
  for (const tipo of TIPOS) {
    const clave = claveLocal(claves, tipo);
    const registro = await cuposDe(env, clave).registrarPrueba(LIMITES_LOCALES[tipo], id);
    if (!registro.permitido) {
      await Promise.all(
        abiertas.map((abierta) => cuposDe(env, abierta.clave).devolverPrueba(id, abierta.inicio)),
      );
      return responder(
        {
          ok: false,
          codigo: "sin-cupo",
          mensaje: "Ya usaste las pruebas con micrófono de hoy.",
          reintentarEnSegundos: registro.reintentarEnSegundos,
        },
        429,
      );
    }
    if (registro.creada) abiertas.push({ clave, inicio: registro.inicio });
    pruebas = Math.min(pruebas, registro.restantes);
  }
  return responder({ ok: true, pruebas });
}
