import * as v from "valibot";
import { esquemaIdioma } from "@nativox/compartido/contratos";
import type { Cupos as CuposRespuesta, RespuestaTranscripcion } from "../contratos-landing/nube";
import { leerDispositivo } from "./dispositivo";
import { LIMITES, SEGUNDOS_MAXIMOS_POR_PEDIDO, type Limite } from "./limites";
import { registrarError } from "./registrador";
import { validarWav } from "./wav";

export { Cupos } from "./cupos";

// El Worker de la landing solo atiende la prueba en la nube de la portada; el resto del sitio
// son archivos estáticos.
export default {
  async fetch(pedido, env) {
    const { pathname } = new URL(pedido.url);
    const dispositivo = leerDispositivo(pedido);
    const claves = {
      dispositivo: `dispositivo:${dispositivo.id}`,
      ip: `ip:${pedido.headers.get("CF-Connecting-IP") ?? "local"}`,
      sitio: "sitio",
    };

    let respuesta: Response;
    if (pathname === "/api/cupos" && pedido.method === "GET") {
      respuesta = await consultarCupos(env, claves);
    } else if (pathname === "/api/transcribir" && pedido.method === "POST") {
      respuesta = await transcribir(pedido, env, claves);
    } else {
      respuesta = Response.json({ ok: false, mensaje: "No existe esa ruta" }, { status: 404 });
    }
    if (dispositivo.cookieNueva) respuesta.headers.append("Set-Cookie", dispositivo.cookieNueva);
    return respuesta;
  },
} satisfies ExportedHandler<Env>;

type Claves = Record<keyof typeof LIMITES, string>;

const cupos = (env: Env, clave: string) => env.CUPOS.get(env.CUPOS.idFromName(clave));

async function consultarCupos(env: Env, claves: Claves): Promise<Response> {
  const decisiones = await Promise.all(
    (Object.keys(LIMITES) as (keyof typeof LIMITES)[]).map((tipo) =>
      cupos(env, claves[tipo]).consultar(LIMITES[tipo]),
    ),
  );
  const cuerpo: CuposRespuesta = {
    restantes: Math.min(...decisiones.map((d) => d.restantes)),
    reintentarEnSegundos: Math.max(...decisiones.map((d) => d.reintentarEnSegundos)),
  };
  return Response.json(cuerpo);
}

async function transcribir(pedido: Request, env: Env, claves: Claves): Promise<Response> {
  const idioma = v.safeParse(esquemaIdioma, new URL(pedido.url).searchParams.get("idioma"));
  if (!idioma.success) return error(400, "pedido-invalido", "Falta el idioma (es, en o pt).");

  const audio = new Uint8Array(await pedido.arrayBuffer());
  const wav = validarWav(audio, SEGUNDOS_MAXIMOS_POR_PEDIDO);
  if (!wav.ok) return error(400, "audio-invalido", wav.motivo);
  const { segundos } = wav.valor;
  const prompt = leerPrompt(pedido);

  const consumidos = await consumirEnOrden(env, claves, segundos);
  if (!consumidos.ok) {
    return error(
      429,
      "sin-cupo",
      "Ya usaste el audio disponible.",
      consumidos.decision.reintentarEnSegundos,
    );
  }

  try {
    const salida = await env.AI.run("@cf/openai/whisper-large-v3-turbo", {
      audio: btoa(Array.from(audio, (byte) => String.fromCharCode(byte)).join("")),
      task: "transcribe",
      language: idioma.output,
      vad_filter: true,
      // El glosario y lo último que se dijo (el navegador lo arma): mantiene los términos y la
      // continuidad entre frases.
      ...(prompt !== "" && { initial_prompt: prompt }),
    });
    const cuerpo: RespuestaTranscripcion = {
      ok: true,
      texto: salida.text.trim(),
      restantes: consumidos.restantes,
    };
    return Response.json(cuerpo);
  } catch (causa) {
    // Si el modelo falló, ese audio no cuenta.
    await Promise.all(
      consumidos.usos.map(({ clave, momento }) => cupos(env, clave).devolver(momento, segundos)),
    );
    registrarError("Falló Whisper en Workers AI", causa);
    return error(
      502,
      "fallo-del-modelo",
      "La transcripción en la nube no respondió. Probá de nuevo en un rato.",
    );
  }
}

// Primero el dispositivo, después la IP y al final el sitio: si uno dice que no, se devuelven
// los que ya se habían descontado.
async function consumirEnOrden(env: Env, claves: Claves, segundos: number) {
  const usos: { clave: string; momento: number }[] = [];
  let restantes = Number.POSITIVE_INFINITY;
  for (const tipo of Object.keys(LIMITES) as (keyof typeof LIMITES)[]) {
    const limite: Limite = LIMITES[tipo];
    const decision = await cupos(env, claves[tipo]).consumir(limite, segundos);
    if (!decision.permitido) {
      await Promise.all(
        usos.map(({ clave, momento }) => cupos(env, clave).devolver(momento, segundos)),
      );
      return { ok: false as const, decision };
    }
    usos.push({ clave: claves[tipo], momento: decision.momento });
    restantes = Math.min(restantes, decision.restantes);
  }
  return { ok: true as const, restantes, usos };
}

const LARGO_MAXIMO_PROMPT = 800;

// El prompt viaja en un encabezado (codificado) y no en la URL, para que no quede en los registros.
function leerPrompt(pedido: Request): string {
  const crudo = pedido.headers.get("X-Nativox-Prompt");
  if (!crudo) return "";
  try {
    return decodeURIComponent(crudo).slice(0, LARGO_MAXIMO_PROMPT);
  } catch {
    return "";
  }
}

function error(
  estado: number,
  codigo: Exclude<RespuestaTranscripcion, { ok: true }>["codigo"],
  mensaje: string,
  reintentarEnSegundos = 0,
) {
  const cuerpo: RespuestaTranscripcion = { ok: false, codigo, mensaje, reintentarEnSegundos };
  return Response.json(cuerpo, { status: estado });
}
