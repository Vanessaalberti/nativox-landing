import { describe, expect, it } from "vitest";
import type { Linea } from "@nativox/compartido/contratos";
import { resumirPrueba } from "./resumen";

const linea = (id: string, original: string, provisoria = false): Linea => ({
  tipo: "linea",
  id,
  original,
  traducciones: {},
  provisoria,
  inicio: 0,
  fin: 1,
});

const medicion = (numero: number, retraso: number, pasada: number) => ({
  numero,
  transcripcionMs: pasada,
  traduccionMs: 100,
  retrasoConfirmacionSegundos: retraso,
  retrasoTraduccionSegundos: retraso + 0.1,
});

describe("resumirPrueba", () => {
  it("con lo que se dijo, calcula WER y términos sobre lo confirmado", () => {
    const resumen = resumirPrueba(
      [linea("1", "revisen el pull request"), linea("2", "en github"), linea("3", "y des", true)],
      [medicion(0, 3, 2000), medicion(1, 4, 3000)],
      { referencia: "Revisen el pull request en GitHub.", glosario: "pull request\nGitHub" },
    );

    expect(resumen).toEqual({
      wer: 0,
      terminos: { bien: 2, total: 2 },
      retrasoSegundos: 3.5,
      pasadaMs: 2500,
      traduccionMs: 100,
    });
  });

  it("sin lo que se dijo, no inventa WER ni términos", () => {
    const resumen = resumirPrueba([linea("1", "hola")], [], { referencia: "", glosario: "GitHub" });

    expect(resumen.wer).toBeNull();
    expect(resumen.terminos).toBeNull();
    expect(resumen.retrasoSegundos).toBeNull();
  });
});
