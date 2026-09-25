import { describe, expect, it } from "vitest";
import { rutaDe } from "./rutas-por-idioma";

describe("rutaDe", () => {
  it.each([
    ["inicio", "es", "/"],
    ["inicio", "en", "/en"],
    ["comparacion", "es", "/comparacion"],
    ["probar", "pt", "/pt/probar"],
    ["como-funciona", "en", "/en/como-funciona"],
  ] as const)("%s en %s → %s", (pagina, idioma, ruta) => {
    expect(rutaDe(pagina, idioma)).toBe(ruta);
  });
});
