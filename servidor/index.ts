import * as v from "valibot";
import { esquemaIdioma } from "@nativox/compartido/contratos";
import type { RespuestaTranscripcion } from "../contratos-landing/nube";
import { leerDispositivo } from "./dispositivo";
import { LIMITES, SEGUNDOS_MAXIMOS_POR_PEDIDO, type Limite } from "./limites";
import { registrarError } from "./registrador";
import { medirAudio } from "./audio";

import { cuposDe as cupos, juntarCupos } from "./cupos";
import { consultarCuposLocales, FORMATO_UUID, registrarPruebaLocal } from "./prueba-local";

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
    } else if (pathname === "/api/cupos-local" && pedido.method === "GET") {
      respuesta = await consultarCuposLocales(env, claves);
    } else if (pathname === "/api/prueba-local" && pedido.method === "POST") {
      respuesta = await registrarPruebaLocal(pedido, env, claves);
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

async function consultarCupos(env: Env, claves: Claves): Promise<Response> {
  const decisiones = await Promise.all(
    (Object.keys(LIMITES) as (keyof typeof LIMITES)[]).map((tipo) =>
      cupos(env, claves[tipo]).consultar(LIMITES[tipo]),
    ),
  );
  return Response.json(juntarCupos(decisiones));
}

async function transcribir(pedido: Request, env: Env, claves: Claves): Promise<Response> {
  const idioma = v.safeParse(esquemaIdioma, new URL(pedido.url).searchParams.get("idioma"));
  if (!idioma.success) return error(400, "pedido-invalido", "Falta el idioma (es, en o pt).");

  const idPrueba = pedido.headers.get("X-Nativox-Prueba") ?? "";
  if (!FORMATO_UUID.test(idPrueba))
    return error(400, "pedido-invalido", "Falta el id de la prueba.");

  const audio = new Uint8Array(await pedido.arrayBuffer());
  const wav = medirAudio(audio, SEGUNDOS_MAXIMOS_POR_PEDIDO);
  if (!wav.ok) return error(400, "audio-invalido", wav.motivo);
  const { segundos } = wav.valor;
  const prompt = leerPrompt(pedido);

  const consumidos = await consumirEnOrden(env, claves, segundos, idPrueba);
  if (!consumidos.ok) {
    return error(
      429,
      "sin-cupo",
      "Ya usaste las pruebas disponibles.",
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
      // El horario de cada palabra: el navegador lo usa para sacar el audio de contexto.
      palabras: (salida.segments ?? []).flatMap((segmento) =>
        (segmento.words ?? []).flatMap(({ word, start, end }) =>
          word !== undefined && start !== undefined && end !== undefined
            ? [{ palabra: word, inicio: start, fin: end }]
            : [],
        ),
      ),
      pruebas: consumidos.pruebas,
    };
    return Response.json(cuerpo);
  } catch (causa) {
    // Si el modelo falló, ese audio no cuenta (ni la prueba, si este pedido era el primero).
    await devolver(env, consumidos.usos, idPrueba, segundos);
    registrarError("Falló Whisper en Workers AI", causa);
    return error(
      502,
      "fallo-del-modelo",
      "La transcripción en la nube no respondió. Probá de nuevo en un rato.",
    );
  }
}

interface UsoRegistrado {
  clave: string;
  // El uso de audio de este pedido y, si el pedido abrió una prueba, cuándo se abrió.
  momento: number;
  pruebaAbiertaEn: number | null;
}

async function devolver(
  env: Env,
  usos: readonly UsoRegistrado[],
  idPrueba: string,
  segundos: number,
) {
  await Promise.all(
    usos.flatMap(({ clave, momento, pruebaAbiertaEn }) => [
      cupos(env, clave).devolver(momento, segundos),
      ...(pruebaAbiertaEn === null
        ? []
        : [cupos(env, clave).devolverPrueba(idPrueba, pruebaAbiertaEn)]),
    ]),
  );
}

// Primero el dispositivo, después la IP y al final el sitio; en cada uno se cuenta la prueba (una
// sola vez por sesión) y los segundos de audio. Si alguno dice que no, se devuelve lo que ya se
// había descontado.
async function consumirEnOrden(env: Env, claves: Claves, segundos: number, idPrueba: string) {
  const usos: UsoRegistrado[] = [];
  let pruebas = Number.POSITIVE_INFINITY;
  for (const tipo of Object.keys(LIMITES) as (keyof typeof LIMITES)[]) {
    const limite: Limite = LIMITES[tipo];
    const cupo = cupos(env, claves[tipo]);
    const prueba = await cupo.registrarPrueba(limite, idPrueba);
    const pruebaAbiertaEn = prueba.creada ? prueba.inicio : null;
    if (!prueba.permitido) {
      await devolver(env, usos, idPrueba, segundos);
      return { ok: false as const, decision: prueba };
    }
    const audio = await cupo.consumir(limite, segundos);
    if (!audio.permitido) {
      await devolver(
        env,
        [...usos, { clave: claves[tipo], momento: -1, pruebaAbiertaEn }],
        idPrueba,
        segundos,
      );
      return { ok: false as const, decision: audio };
    }
    usos.push({ clave: claves[tipo], momento: audio.momento, pruebaAbiertaEn });
    pruebas = Math.min(pruebas, prueba.restantes);
  }
  return { ok: true as const, pruebas, usos };
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
