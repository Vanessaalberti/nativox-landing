import type { Idioma, Resultado } from "@nativox/compartido/contratos";
import {
  conectarModelos,
  elegirVarianteWhisper,
  type Modelos,
  type VarianteWhisper,
} from "@nativox/navegador/modulos/modelos-compartidos";
import { crearBergamot, type Traductor } from "@nativox/navegador/modulos/traduccion";

export interface ModelosListos {
  modelos: Modelos;
  variante: VarianteWhisper;
  traductor: Traductor;
}

// 0 a 1, o null mientras no se sabe cuánto falta.
export type AvanceDescarga = {
  etapa: "revisando" | "whisper" | "traductor";
  proporcion: number | null;
};

// Los modelos se cargan una vez por pestaña, en la placa de quien visita: probar de nuevo no los
// vuelve a bajar, y la segunda visita los lee del disco.
let cargados: Promise<Resultado<ModelosListos>> | null = null;

export function prepararModelos(
  pares: { de: Idioma; a: readonly Idioma[] },
  alAvanzar: (avance: AvanceDescarga) => void,
): Promise<Resultado<ModelosListos>> {
  cargados ??= cargarUnaVez(alAvanzar).then((resultado) => {
    if (!resultado.ok) cargados = null;
    return resultado;
  });
  return cargados.then((resultado) =>
    resultado.ok ? prepararTraducciones(resultado.valor, pares, alAvanzar) : resultado,
  );
}

async function cargarUnaVez(
  alAvanzar: (avance: AvanceDescarga) => void,
): Promise<Resultado<ModelosListos>> {
  alAvanzar({ etapa: "revisando", proporcion: null });
  const variante = await elegirVarianteWhisper();
  if (!variante.ok) return variante;

  const worker = new Worker(new URL("../../../segundo-plano/modelos.worker.ts", import.meta.url), {
    type: "module",
  });
  const modelos = conectarModelos(worker);
  alAvanzar({ etapa: "whisper", proporcion: 0 });
  const whisper = await modelos.cargarWhisper(variante.valor, (cargado, total) => {
    alAvanzar({ etapa: "whisper", proporcion: total > 0 ? cargado / total : null });
  });
  if (!whisper.ok) return whisper;

  alAvanzar({ etapa: "traductor", proporcion: null });
  const traductor = await crearBergamot("/bergamot/translator.js");
  if (!traductor.ok) return traductor;
  return { ok: true, valor: { modelos, variante: variante.valor, traductor: traductor.valor } };
}

// Bergamot baja el modelo de cada par la primera vez que traduce: se hace ahora.
async function prepararTraducciones(
  listos: ModelosListos,
  pares: { de: Idioma; a: readonly Idioma[] },
  alAvanzar: (avance: AvanceDescarga) => void,
): Promise<Resultado<ModelosListos>> {
  for (const a of pares.a) {
    alAvanzar({ etapa: "traductor", proporcion: null });
    const prueba = await listos.traductor.traducir("Hola.", pares.de, a);
    if (!prueba.ok) return prueba;
  }
  return { ok: true, valor: listos };
}
