import { describe, expect, it } from "vitest";
import { compararCopia, escribirResumenes, esArchivoCopiable, leerResumenes } from "./copia.ts";

const A = "a".repeat(64);
const B = "b".repeat(64);

describe("copia de módulos", () => {
  it("lee los resúmenes que escribe", () => {
    const resumenes = new Map([
      ["navegador/modulos/x/index.ts", A],
      ["compartido/y/index.ts", B],
    ]);
    const tabla = escribirResumenes(resumenes);

    expect(leerResumenes(`# título\n\n| Archivo | SHA-256 |\n| --- | --- |\n${tabla}\n`)).toEqual(
      resumenes,
    );
  });

  it("detecta lo editado a mano, lo que falta y lo que sobra", () => {
    const esperados = new Map([
      ["a.ts", A],
      ["b.ts", A],
      ["c.ts", A],
    ]);
    const actuales = new Map([
      ["a.ts", A],
      ["b.ts", B],
      ["d.ts", A],
    ]);

    expect(compararCopia(esperados, actuales)).toEqual({
      editados: ["b.ts"],
      faltan: ["c.ts"],
      sobran: ["d.ts"],
    });
  });

  it("no copia las pruebas", () => {
    expect(esArchivoCopiable("glosario/glosario.test.ts")).toBe(false);
    expect(esArchivoCopiable("glosario/leer.ts")).toBe(true);
  });
});
