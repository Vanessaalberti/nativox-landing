import * as v from "valibot";
import { describe, expect, it } from "vitest";
import combinaciones from "../../../comparacion/combinaciones.json";
import { armarFilas, esquemaCombinaciones, esquemaResultado } from "./filas";

describe("comparación", () => {
  const leidas = v.parse(esquemaCombinaciones, combinaciones);

  it("las combinaciones publicadas tienen el formato esperado", () => {
    expect(leidas.length).toBeGreaterThan(0);
  });

  it("sin resultados medidos, no muestra ningún número de calidad", () => {
    const filas = armarFilas(leidas, [], "es");
    expect(
      filas.every(
        (fila) => fila.wer === null && fila.terminos === null && fila.retrasoSegundos === null,
      ),
    ).toBe(true);
  });

  it("junta cada resultado con su combinación y usa el idioma de la página", () => {
    const [primera] = armarFilas(
      leidas,
      [
        {
          combinacion: "whisper-q4-bergamot-sin-glosario",
          wer: 0.12,
          terminos: { bien: 40, total: 56 },
          retrasoSegundos: 3.8,
        },
      ],
      "en",
    );
    expect(primera).toEqual(
      expect.objectContaining({
        nombre: "Local Whisper turbo (compressed) + Bergamot",
        wer: 0.12,
        terminos: { bien: 40, total: 56 },
        retrasoSegundos: 3.8,
      }),
    );
  });
});

describe("comparación con medidas parciales", () => {
  const leidas = v.parse(esquemaCombinaciones, combinaciones);

  it("una medida que falta queda como null y las que están se muestran", () => {
    const filas = armarFilas(
      leidas,
      [
        {
          combinacion: "whisper-q4-bergamot-sin-glosario",
          terminos: { bien: 39, total: 56 },
          fuente: { es: "laboratorio", en: "lab", pt: "laboratório" },
        },
      ],
      "es",
    );
    expect(filas[0]).toEqual(
      expect.objectContaining({
        wer: null,
        retrasoSegundos: null,
        terminos: { bien: 39, total: 56 },
        fuente: "laboratorio",
      }),
    );
    // Las combinaciones sin archivo no muestran ningún número ni fuente.
    expect(filas[2]).toEqual(expect.objectContaining({ wer: null, terminos: null, fuente: null }));
  });

  it("todos los archivos de resultados publicados son válidos y de una combinación que existe", () => {
    const ids = new Set(leidas.map((combinacion) => combinacion.id));
    const publicados = import.meta.glob<unknown>("../../../comparacion/resultados/*.json", {
      eager: true,
      import: "default",
    });
    const resultados = Object.values(publicados).map((crudo) => v.parse(esquemaResultado, crudo));
    expect(resultados.length).toBeGreaterThan(0);
    for (const resultado of resultados) expect(ids.has(resultado.combinacion)).toBe(true);
  });
});
