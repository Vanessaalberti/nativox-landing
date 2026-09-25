import { describe, expect, it } from "vitest";
import { aplicarLimite } from "./limites";

const limite = { usos: 3, periodoMs: 1000 };

describe("aplicarLimite", () => {
  it("deja probar tres veces y la cuarta no", () => {
    let usos: number[] = [];
    const restantes: number[] = [];
    for (const ahora of [0, 100, 200]) {
      const resultado = aplicarLimite(usos, ahora, limite);
      usos = resultado.usos;
      restantes.push(resultado.decision.restantes);
    }
    expect(restantes).toEqual([2, 1, 0]);
    expect(aplicarLimite(usos, 300, limite).decision).toEqual({
      permitido: false,
      restantes: 0,
      reintentarEnSegundos: 1,
    });
  });

  it("los usos viejos dejan de contar cuando pasa el período", () => {
    const { decision } = aplicarLimite([0, 100, 200], 1050, limite);
    expect(decision.permitido).toBe(true);
    expect(decision.restantes).toBe(0);
  });
});
