import { describe, expect, it } from "vitest";
import { aWav } from "./wav";

describe("aWav", () => {
  it("arma un WAV de 16 bits, mono, con el largo correcto", () => {
    const wav = aWav(Float32Array.of(0, 1, -1, 0.5), 16_000);
    const vista = new DataView(wav.buffer);

    expect(String.fromCharCode(...wav.subarray(0, 4))).toBe("RIFF");
    expect(vista.getUint32(24, true)).toBe(16_000);
    expect(vista.getUint32(40, true)).toBe(8);
    expect([vista.getInt16(44, true), vista.getInt16(46, true), vista.getInt16(48, true)]).toEqual([
      0, 32767, -32768,
    ]);
  });

  it("acota lo que pasa de ±1 en lugar de dar la vuelta", () => {
    const vista = new DataView(aWav(Float32Array.of(2), 16_000).buffer);
    expect(vista.getInt16(44, true)).toBe(32767);
  });
});
