// El formato del audio que la portada le manda al Worker: WAV PCM de 16 bits, mono, a 16 kHz (lo
// que usa Whisper). El navegador lo arma con esto y el servidor lo valida (servidor/wav.ts).
export function aWav(muestras: Float32Array, frecuencia: number): Uint8Array<ArrayBuffer> {
  const datos = new Uint8Array(44 + muestras.length * 2);
  const vista = new DataView(datos.buffer);
  const escribir = (desde: number, texto: string) => {
    for (const [i, letra] of Array.from(texto).entries())
      vista.setUint8(desde + i, letra.charCodeAt(0));
  };
  escribir(0, "RIFF");
  vista.setUint32(4, 36 + muestras.length * 2, true);
  escribir(8, "WAVE");
  escribir(12, "fmt ");
  vista.setUint32(16, 16, true);
  vista.setUint16(20, 1, true);
  vista.setUint16(22, 1, true);
  vista.setUint32(24, frecuencia, true);
  vista.setUint32(28, frecuencia * 2, true);
  vista.setUint16(32, 2, true);
  vista.setUint16(34, 16, true);
  escribir(36, "data");
  vista.setUint32(40, muestras.length * 2, true);
  for (const [i, muestra] of muestras.entries()) {
    const acotada = Math.max(-1, Math.min(1, muestra));
    vista.setInt16(44 + i * 2, acotada < 0 ? acotada * 0x8000 : acotada * 0x7fff, true);
  }
  return datos;
}
