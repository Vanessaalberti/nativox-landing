import { FRECUENCIA } from "@nativox/navegador/modulos/captura-audio";
import { armarOgg, PREINICIO_POR_DEFECTO } from "../../../../contratos-landing/ogg";

// Opus a 24 kbps: misma calidad para la voz que el WAV, pero ~14 KB en lugar de ~146 KB por
// fragmento. Medido, la respuesta tras el corte pasó de 3,7 s a 1,6 s: casi todo el
// retraso de la nube era subir el audio.
const CONFIGURACION: AudioEncoderConfig = {
  codec: "opus",
  sampleRate: FRECUENCIA,
  numberOfChannels: 1,
  bitrate: 24_000,
};

let disponible: Promise<boolean> | null = null;

// Chrome, Edge y Safari recientes traen el codificador (WebCodecs); si este navegador no lo tiene,
// se manda WAV.
export function opusDisponible(): Promise<boolean> {
  disponible ??=
    typeof AudioEncoder === "undefined"
      ? Promise.resolve(false)
      : AudioEncoder.isConfigSupported(CONFIGURACION).then(
          (resultado) => resultado.supported === true,
          () => false,
        );
  return disponible;
}

// El preinicio (muestras que el decodificador descarta al principio) viene en la cabecera que el
// codificador informa; si no la informa, se usa el valor típico.
function leerPreinicio(descripcion: AllowSharedBufferSource | undefined): number {
  if (!descripcion) return PREINICIO_POR_DEFECTO;
  const vista = ArrayBuffer.isView(descripcion)
    ? new DataView(descripcion.buffer, descripcion.byteOffset, descripcion.byteLength)
    : new DataView(descripcion);
  return vista.byteLength >= 12 ? vista.getUint16(10, true) : PREINICIO_POR_DEFECTO;
}

export async function codificarEnOgg(audio: Float32Array): Promise<Uint8Array<ArrayBuffer>> {
  const paquetes: Uint8Array[] = [];
  let preinicio = PREINICIO_POR_DEFECTO;
  // Un objeto y no una variable: el error llega desde un callback.
  const resultado: { fallo: Error | null } = { fallo: null };

  const codificador = new AudioEncoder({
    output: (fragmento, metadatos) => {
      if (paquetes.length === 0) preinicio = leerPreinicio(metadatos?.decoderConfig?.description);
      const datos = new Uint8Array(fragmento.byteLength);
      fragmento.copyTo(datos);
      paquetes.push(datos);
    },
    error: (error) => {
      resultado.fallo = error;
    },
  });
  codificador.configure(CONFIGURACION);
  const muestras = new AudioData({
    format: "f32-planar",
    sampleRate: FRECUENCIA,
    numberOfFrames: audio.length,
    numberOfChannels: 1,
    timestamp: 0,
    data: audio.slice(),
  });
  codificador.encode(muestras);
  muestras.close();
  await codificador.flush();
  codificador.close();

  if (resultado.fallo || paquetes.length === 0) {
    throw resultado.fallo ?? new Error("El codificador de Opus no devolvió audio.");
  }
  return armarOgg(paquetes, { frecuenciaDeEntrada: FRECUENCIA, preinicio });
}
