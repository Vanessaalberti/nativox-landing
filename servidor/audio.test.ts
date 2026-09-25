import { describe, expect, it } from "vitest";
import { armarOgg, crcOgg } from "../contratos-landing/ogg";
import { aWav } from "../contratos-landing/wav";
import { medirAudio } from "./audio";

const paquetes = (cantidad: number, largo = 60) =>
  Array.from({ length: cantidad }, (_, i) => new Uint8Array(largo).fill(i % 256));

describe("medirAudio", () => {
  it("mide la duración de un Ogg Opus por la posición de su última página", () => {
    // 150 paquetes de 20 ms = 3 s (con más de una página).
    const ogg = armarOgg(paquetes(150), { frecuenciaDeEntrada: 16_000 });
    const medido = medirAudio(ogg, 12);
    expect(medido.ok && medido.valor.segundos).toBeCloseTo(3, 5);
  });

  it("acepta paquetes de 255 bytes o más (necesitan más de un segmento)", () => {
    const grandes = paquetes(120, 600);
    const medido = medirAudio(armarOgg(grandes, { frecuenciaDeEntrada: 16_000 }), 12);
    expect(medido.ok && medido.valor.segundos).toBeCloseTo(2.4, 5);
  });

  it("rechaza un Ogg que dura más que el máximo", () => {
    const largo = armarOgg(paquetes(700), { frecuenciaDeEntrada: 16_000 }); // 14 s
    expect(medirAudio(largo, 12)).toMatchObject({ ok: false });
  });

  it("rechaza un Ogg cortado", () => {
    const ogg = armarOgg(paquetes(10), { frecuenciaDeEntrada: 16_000 });
    expect(medirAudio(ogg.subarray(0, 20), 12)).toMatchObject({ ok: false });
  });

  it("sigue aceptando WAV", () => {
    const medido = medirAudio(aWav(new Float32Array(16_000 * 2), 16_000), 12);
    expect(medido.ok && medido.valor.segundos).toBeCloseTo(2, 5);
  });
});

describe("armarOgg", () => {
  it("empieza con OpusHead y OpusTags y cada página lleva su CRC", () => {
    const ogg = armarOgg(paquetes(5), { frecuenciaDeEntrada: 16_000 });
    const texto = new TextDecoder("latin1").decode(ogg);
    expect(texto.startsWith("OggS")).toBe(true);
    expect(texto).toContain("OpusHead");
    expect(texto).toContain("OpusTags");

    const vista = new DataView(ogg.buffer);
    let posicion = 0;
    let paginas = 0;
    while (posicion < ogg.length) {
      const segmentos = ogg[posicion + 26] ?? 0;
      let cuerpo = 0;
      for (let i = 0; i < segmentos; i++) cuerpo += ogg[posicion + 27 + i] ?? 0;
      const largo = 27 + segmentos + cuerpo;
      const pagina = ogg.slice(posicion, posicion + largo);
      const guardado = vista.getUint32(posicion + 22, true);
      new DataView(pagina.buffer).setUint32(22, 0, true);
      expect(crcOgg(pagina)).toBe(guardado);
      posicion += largo;
      paginas++;
    }
    expect(paginas).toBe(3);
  });
});
