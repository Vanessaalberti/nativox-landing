import { describe, expect, it } from "vitest";
import { aplicarLimite, medirCupo, type Uso } from "./limites";

const limite = { segundos: 10, periodoMs: 1000 };

describe("aplicarLimite", () => {
  it("descuenta los segundos de cada pedido hasta agotar el cupo", () => {
    let usos: Uso[] = [];
    const restantes: number[] = [];
    for (const [ahora, segundos] of [
      [0, 4],
      [100, 4],
      [200, 2],
    ] as const) {
      const resultado = aplicarLimite(usos, ahora, limite, segundos);
      usos = resultado.usos;
      restantes.push(resultado.decision.restantes);
    }
    expect(restantes).toEqual([6, 2, 0]);
    expect(aplicarLimite(usos, 300, limite, 1).decision).toEqual({
      permitido: false,
      restantes: 0,
      reintentarEnSegundos: 1,
    });
  });

  it("rechaza un pedido que no entra entero, aunque quede algo de cupo", () => {
    const { decision, usos } = aplicarLimite([{ momento: 0, segundos: 8 }], 100, limite, 5);
    expect(decision.permitido).toBe(false);
    expect(decision.restantes).toBe(2);
    expect(usos).toEqual([{ momento: 0, segundos: 8 }]);
  });

  it("dice cuánto falta para que se libere lo necesario", () => {
    const usos: Uso[] = [
      { momento: 0, segundos: 6 },
      { momento: 500, segundos: 4 },
    ];
    // Hacen falta 5 s: con lo del momento 0 (6 s) alcanza y se libera a los 1000 ms.
    expect(aplicarLimite(usos, 600, limite, 5).decision.reintentarEnSegundos).toBe(1);
  });

  it("los usos viejos dejan de contar cuando pasa el período", () => {
    const { decision } = aplicarLimite([{ momento: 0, segundos: 10 }], 1050, limite, 10);
    expect(decision.permitido).toBe(true);
    expect(decision.restantes).toBe(0);
  });
});

describe("medirCupo", () => {
  it("con cupo dice cuánto queda y no pide esperar", () => {
    expect(medirCupo([{ momento: 0, segundos: 4 }], 100, limite)).toEqual({
      permitido: true,
      restantes: 6,
      reintentarEnSegundos: 0,
    });
  });

  it("con menos de 2 s se considera agotado", () => {
    const decision = medirCupo([{ momento: 0, segundos: 9 }], 100, limite);
    expect(decision.permitido).toBe(false);
    expect(decision.restantes).toBe(1);
    expect(decision.reintentarEnSegundos).toBe(1);
  });
});
