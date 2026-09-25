import type { Resultado } from "@nativox/compartido/contratos";
import { abrirEntrada, FRECUENCIA } from "@nativox/navegador/modulos/captura-audio";
import { SEGUNDOS_POR_PRUEBA } from "../../../../contratos-landing/nube";

export interface Grabacion {
  // Corta la captura y devuelve lo grabado a 16 kHz, hasta el máximo de la prueba (15 s).
  terminar(): Float32Array;
}

export interface OpcionesDeGrabacion {
  // Volumen de cada bloque de 100 ms (0 a 1), para mostrar que el micrófono está escuchando.
  alNivel: (nivel: number) => void;
  // El micrófono se cortó solo (se desconectó o se retiró el permiso).
  alCortarse: () => void;
}

// Graba la voz de quien prueba, con los filtros de voz del navegador (eco, ruido y volumen) porque
// es el micrófono de una notebook o un auricular. Todo queda en memoria: no viaja a ningún lado.
export async function iniciarGrabacion({
  alNivel,
  alCortarse,
}: OpcionesDeGrabacion): Promise<Resultado<Grabacion>> {
  const bloques: Float32Array[] = [];
  const captura = await abrirEntrada(null, {
    conFiltrosDeVoz: true,
    alRecibir: (bloque) => {
      bloques.push(bloque);
      alNivel(volumen(bloque));
    },
    alTerminar: alCortarse,
  });
  if (!captura.ok) return captura;

  return {
    ok: true,
    valor: {
      terminar() {
        captura.valor.detener();
        const total = bloques.reduce((suma, bloque) => suma + bloque.length, 0);
        const audio = new Float32Array(Math.min(total, SEGUNDOS_POR_PRUEBA * FRECUENCIA));
        let posicion = 0;
        for (const bloque of bloques) {
          if (posicion >= audio.length) break;
          audio.set(bloque.subarray(0, audio.length - posicion), posicion);
          posicion += bloque.length;
        }
        return audio;
      },
    },
  };
}

// Valor eficaz del bloque, llevado a 0 a 1 (la voz normal ronda 0,05 a 0,2).
function volumen(bloque: Float32Array): number {
  let suma = 0;
  for (const muestra of bloque) suma += muestra * muestra;
  return Math.min(1, Math.sqrt(suma / Math.max(1, bloque.length)) * 4);
}

// El pico más alto de la grabación: si es casi cero, el micrófono no escuchó nada.
export function picoDe(audio: Float32Array): number {
  let pico = 0;
  for (const muestra of audio) pico = Math.max(pico, Math.abs(muestra));
  return pico;
}
