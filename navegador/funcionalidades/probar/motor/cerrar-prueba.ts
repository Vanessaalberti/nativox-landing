import type { RefObject } from "react";
import type { Resultado } from "@nativox/compartido/contratos";
import type { Captura } from "@nativox/navegador/modulos/captura-audio";
import type { FlujoSubtitulos } from "@nativox/navegador/modulos/flujo-subtitulos";
import type { PruebaArmada } from "./armar-prueba";

// Une la captura con el flujo de subtítulos que la consume (o devuelve por qué no se pudo abrir).
export function conFlujo(
  captura: Resultado<Captura>,
  flujo: FlujoSubtitulos,
): Resultado<PruebaArmada> {
  if (!captura.ok) return captura;
  return { ok: true, valor: { captura: captura.valor, flujo } };
}

// Corta la captura de la prueba en curso y espera a que termine de transcribir y traducir lo que
// quedó. `alTerminando` avisa que ya no entra audio nuevo, para mostrarlo mientras se espera.
// Devuelve false si no había ninguna prueba en curso.
export async function cerrarPrueba(
  enCurso: RefObject<PruebaArmada | null>,
  alTerminando: () => void,
): Promise<boolean> {
  const prueba = enCurso.current;
  if (!prueba) return false;
  enCurso.current = null;
  prueba.captura.detener();
  alTerminando();
  await prueba.flujo.terminar();
  return true;
}
