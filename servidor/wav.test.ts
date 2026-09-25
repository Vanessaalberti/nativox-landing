import { describe, expect, it } from "vitest";
import { aWav } from "../contratos-landing/wav";
import { validarWav } from "./wav";

const wav = (segundos: number, frecuencia = 16_000) =>
  aWav(new Float32Array(Math.round(segundos * frecuencia)), frecuencia);

describe("validarWav", () => {
  it("acepta un WAV de 16 kHz dentro del límite y dice cuánto dura", () => {
    expect(validarWav(wav(12), 15)).toEqual({ ok: true, valor: { segundos: 12 } });
  });

  it("rechaza lo que pasa de 15 s", () => {
    const resultado = validarWav(wav(20), 15);
    expect(resultado.ok).toBe(false);
  });

  it("rechaza otra frecuencia o algo que no es WAV", () => {
    expect(validarWav(wav(5, 44_100), 15).ok).toBe(false);
    expect(validarWav(new Uint8Array(100), 15).ok).toBe(false);
  });
});
