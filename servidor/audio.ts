import type { Resultado } from "@nativox/compartido/contratos";
import { FRECUENCIA_OGG } from "../contratos-landing/ogg";
import { validarWav } from "./wav";

const ES_OGG = (datos: Uint8Array) =>
  datos[0] === 0x4f && datos[1] === 0x67 && datos[2] === 0x67 && datos[3] === 0x53;
const LARGO_MAXIMO_DE_PAGINA = 65_307;

// Opus en Ogg: la duración está en la posición (granule) de la última página, así que se mide sin
// decodificar. Se busca hacia atrás la última "OggS" y el preinicio en la cabecera "OpusHead".
function validarOgg(datos: Uint8Array, maximoSegundos: number): Resultado<{ segundos: number }> {
  const vista = new DataView(datos.buffer, datos.byteOffset, datos.byteLength);
  const desde = Math.max(0, datos.length - LARGO_MAXIMO_DE_PAGINA);
  let ultima = -1;
  for (let i = datos.length - 27; i >= desde; i--) {
    if (ES_OGG(datos.subarray(i, i + 4))) {
      ultima = i;
      break;
    }
  }
  const cabecera = buscar(datos, "OpusHead");
  if (ultima <= 0 || cabecera === -1) return { ok: false, motivo: "El audio Ogg está incompleto." };

  const preinicio = vista.getUint16(cabecera + 10, true);
  const granule = Number(vista.getBigUint64(ultima + 6, true));
  const segundos = (granule - preinicio) / FRECUENCIA_OGG;
  if (!Number.isFinite(segundos) || segundos <= 0) {
    return { ok: false, motivo: "No se pudo medir la duración del audio." };
  }
  if (segundos > maximoSegundos + 0.5) {
    return {
      ok: false,
      motivo: `El audio dura ${segundos.toFixed(1)} s y el máximo es ${String(maximoSegundos)} s.`,
    };
  }
  return { ok: true, valor: { segundos } };
}

function buscar(datos: Uint8Array, palabra: string): number {
  const bytes = Uint8Array.from(palabra, (letra) => letra.charCodeAt(0));
  const limite = Math.min(datos.length - bytes.length, 200);
  for (let i = 0; i <= limite; i++) {
    if (bytes.every((byte, j) => datos[i + j] === byte)) return i;
  }
  return -1;
}

// La portada manda cada fragmento en Opus (chico y rápido) o, si el navegador no lo puede
// codificar, en WAV. Los dos se miden antes de gastar un pedido.
export function medirAudio(
  datos: Uint8Array,
  maximoSegundos: number,
): Resultado<{ segundos: number }> {
  return ES_OGG(datos) ? validarOgg(datos, maximoSegundos) : validarWav(datos, maximoSegundos);
}
