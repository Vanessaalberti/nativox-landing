import type { RefObject } from "react";
import type { PruebaArmada } from "./armar-prueba";

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
