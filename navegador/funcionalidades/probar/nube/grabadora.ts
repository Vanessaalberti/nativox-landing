import type { Resultado } from "@nativox/compartido/contratos";
import { abrirEntrada, FRECUENCIA } from "@nativox/navegador/modulos/captura-audio";

export interface Grabacion {
  // Corta la captura y devuelve todo lo que se grabó, a 16 kHz.
  terminar(): Float32Array;
}

// Graba del micrófono juntando los bloques en memoria (son 15 s como mucho: ~1 MB).
export async function grabarMicrofono(
  alCortarse: (motivo: string) => void,
): Promise<Resultado<Grabacion>> {
  const bloques: Float32Array[] = [];
  const captura = await abrirEntrada(null, {
    alRecibir: (bloque) => bloques.push(bloque),
    alTerminar: alCortarse,
  });
  if (!captura.ok) return captura;
  return {
    ok: true,
    valor: {
      terminar() {
        captura.valor.detener();
        const todo = new Float32Array(bloques.reduce((total, bloque) => total + bloque.length, 0));
        let posicion = 0;
        for (const bloque of bloques) {
          todo.set(bloque, posicion);
          posicion += bloque.length;
        }
        return todo;
      },
    },
  };
}

export { FRECUENCIA };
