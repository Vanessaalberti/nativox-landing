import { describe, expect, it } from "vitest";
import { aplicarLimite, medirCupo, registrarPrueba, type Prueba, type Uso } from "./limites";

const limite = { pruebas: 3, segundos: 10, periodoMs: 1000 };
const ID_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const ID_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const ID_C = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const ID_D = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";

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

  it("los usos viejos dejan de contar cuando pasa el período", () => {
    const { decision } = aplicarLimite([{ momento: 0, segundos: 10 }], 1050, limite, 10);
    expect(decision.permitido).toBe(true);
    expect(decision.restantes).toBe(0);
  });
});

describe("registrarPrueba", () => {
  // La ventana de una prueba en curso es de 60 s: se prueba con el período largo de un día.
  const dia = { ...limite, periodoMs: 24 * 60 * 60 * 1000 };

  it("varios pedidos de la misma prueba gastan una sola", () => {
    let pruebas: Prueba[] = [];
    const restantes: number[] = [];
    for (const ahora of [0, 1000, 2000, 3000]) {
      const resultado = registrarPrueba(pruebas, ahora, dia, ID_A);
      pruebas = resultado.pruebas;
      restantes.push(resultado.decision.restantes);
    }
    expect(restantes).toEqual([2, 2, 2, 2]);
    expect(pruebas).toHaveLength(1);
  });

  it("la cuarta prueba no entra, aunque se recargue la página entre una y otra", () => {
    let pruebas: Prueba[] = [];
    // Cada F5 es un id nuevo en el navegador, pero el servidor ya las tiene contadas.
    for (const [ahora, id] of [
      [0, ID_A],
      [100_000, ID_B],
      [200_000, ID_C],
    ] as const) {
      pruebas = registrarPrueba(pruebas, ahora, dia, id).pruebas;
    }
    const cuarta = registrarPrueba(pruebas, 300_000, dia, ID_D);
    expect(cuarta.decision.permitido).toBe(false);
    expect(cuarta.decision.restantes).toBe(0);
    expect(cuarta.decision.reintentarEnSegundos).toBe(Math.ceil((dia.periodoMs - 300_000) / 1000));
    expect(cuarta.creada).toBe(false);
  });

  it("una prueba en curso sigue pudiendo pedir aunque ya no queden más", () => {
    let pruebas: Prueba[] = [];
    for (const [ahora, id] of [
      [0, ID_A],
      [1000, ID_B],
      [2000, ID_C],
    ] as const) {
      pruebas = registrarPrueba(pruebas, ahora, dia, id).pruebas;
    }
    expect(registrarPrueba(pruebas, 5000, dia, ID_C).decision.permitido).toBe(true);
  });

  it("pasada la vigencia, el mismo id ya cuenta como prueba nueva", () => {
    const primera = registrarPrueba([], 0, dia, ID_A);
    const tarde = registrarPrueba(primera.pruebas, 61_000, dia, ID_A);
    expect(tarde.creada).toBe(true);
    expect(tarde.pruebas).toHaveLength(2);
  });

  it("las pruebas de hace más de un período dejan de contar", () => {
    const { decision } = registrarPrueba([{ id: ID_A, inicio: 0 }], 1050, limite, ID_B);
    expect(decision.restantes).toBe(2);
  });
});

describe("medirCupo", () => {
  const pruebas: Prueba[] = [{ id: ID_A, inicio: 0 }];

  it("con cupo dice cuántas pruebas quedan y no pide esperar", () => {
    expect(medirCupo([{ momento: 0, segundos: 4 }], pruebas, 100, limite)).toEqual({
      pruebas: 2,
      reintentarEnSegundos: 0,
    });
  });

  it("sin pruebas dice cuánto falta para la más vieja", () => {
    const tres: Prueba[] = [
      { id: ID_A, inicio: 0 },
      { id: ID_B, inicio: 200 },
      { id: ID_C, inicio: 400 },
    ];
    expect(medirCupo([], tres, 500, limite)).toEqual({ pruebas: 0, reintentarEnSegundos: 1 });
  });

  it("con menos de 2 s de audio se considera agotado aunque queden pruebas", () => {
    const decision = medirCupo([{ momento: 0, segundos: 9 }], pruebas, 100, limite);
    expect(decision.pruebas).toBe(0);
    expect(decision.reintentarEnSegundos).toBe(1);
  });
});
