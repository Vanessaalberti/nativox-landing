import { describe, expect, it } from "vitest";
import { sinElContexto } from "./transcriptor-nube";

const respuesta = {
  ok: true as const,
  texto: " para ver como funciona esto de verdad",
  restantes: 100,
  palabras: [
    { palabra: " para", inicio: 0, fin: 0.3 },
    { palabra: " ver", inicio: 0.3, fin: 0.6 },
    { palabra: " como", inicio: 1.4, fin: 1.7 },
    { palabra: " funciona", inicio: 1.7, fin: 2.2 },
    { palabra: " esto", inicio: 2.2, fin: 2.5 },
  ],
};

describe("sinElContexto", () => {
  it("saca las palabras que caen dentro del audio de contexto", () => {
    expect(sinElContexto(respuesta, 1.2)).toBe("como funciona esto");
  });

  it("una palabra que cruza el borde se queda con quien tiene su centro", () => {
    // "como" va de 1,4 a 1,7: su centro (1,55) pasa el borde en 1,5 pero no en 1,6.
    expect(sinElContexto(respuesta, 1.5)).toBe("como funciona esto");
    expect(sinElContexto(respuesta, 1.6)).toBe("funciona esto");
  });

  it("sin contexto devuelve el texto tal cual", () => {
    expect(sinElContexto(respuesta, 0)).toBe(respuesta.texto);
  });

  it("si la nube no devolvió horarios, devuelve el texto tal cual", () => {
    expect(sinElContexto({ ...respuesta, palabras: [] }, 1.5)).toBe(respuesta.texto);
  });
});
