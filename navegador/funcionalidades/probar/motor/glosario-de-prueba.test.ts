import { describe, expect, it } from "vitest";
import { limpiarGlosarioDePrueba } from "./glosario-de-prueba";

describe("limpiarGlosarioDePrueba", () => {
  it("deja los términos, con variantes y traducciones fijas", () => {
    const glosario = "Kubernetes\nNerdearla ~ ner de arla\nrama main => en: main branch";
    expect(limpiarGlosarioDePrueba(glosario)).toEqual({ texto: glosario, descartados: 0 });
  });

  it("descarta las frases: lo que se dice no es una guía", () => {
    const glosario =
      "pull request\nAntes de hacer el merge revisen el pull request y corran los tests";
    expect(limpiarGlosarioDePrueba(glosario)).toEqual({ texto: "pull request", descartados: 1 });
  });
});
