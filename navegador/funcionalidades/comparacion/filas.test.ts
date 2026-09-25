import * as v from "valibot";
import { describe, expect, it } from "vitest";
import combinaciones from "../../../comparacion/combinaciones.json";
import { armarFilas, esquemaCombinaciones } from "./filas";

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
