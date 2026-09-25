import { DurableObject } from "cloudflare:workers";
import {
  aplicarLimite,
  medirCupo,
  registrarPrueba,
  type Decision,
  type Limite,
  type Prueba,
  type Uso,
} from "./limites";

// Un objeto por clave (dispositivo, IP o el sitio entero): guarda las pruebas y los segundos de
// audio usados, y decide si queda cupo. Al ser un solo objeto por clave, dos pedidos simultáneos no
// se saltean el límite. Lo guardado sobrevive a recargar la página y a reiniciar el navegador.
export class Cupos extends DurableObject<Env> {
  // Cuenta la prueba (una sola vez por id) y, si `creada`, hay que devolverla si el pedido falla.
  async registrarPrueba(
    limite: Limite,
    id: string,
  ): Promise<Decision & { creada: boolean; inicio: number }> {
    const inicio = Date.now();
    const { pruebas, decision, creada } = registrarPrueba(await this.pruebas(), inicio, limite, id);
    await this.ctx.storage.put("pruebas", pruebas);
    return { ...decision, creada, inicio };
  }

  async devolverPrueba(id: string, inicio: number): Promise<void> {
    const pruebas = await this.pruebas();
    await this.ctx.storage.put(
      "pruebas",
      pruebas.filter((prueba) => !(prueba.id === id && prueba.inicio === inicio)),
    );
  }

  // `momento` identifica el uso: si la transcripción falla, se devuelve exactamente ese.
  async consumir(limite: Limite, segundos: number): Promise<Decision & { momento: number }> {
    const momento = Date.now();
    const { usos, decision } = aplicarLimite(await this.usos(), momento, limite, segundos);
    await this.ctx.storage.put("usos", usos);
    return { ...decision, momento };
  }

  async consultar(limite: Limite) {
    return medirCupo(await this.usos(), await this.pruebas(), Date.now(), limite);
  }

  // Si la transcripción falló, ese audio no cuenta.
  async devolver(momento: number, segundos: number): Promise<void> {
    const usos = await this.usos();
    const indice = usos.findIndex((uso) => uso.momento === momento && uso.segundos === segundos);
    if (indice === -1) return;
    await this.ctx.storage.put(
      "usos",
      usos.filter((_uso, i) => i !== indice),
    );
  }

  private async usos(): Promise<Uso[]> {
    return leerLista(await this.ctx.storage.get("usos"), esUso);
  }

  private async pruebas(): Promise<Prueba[]> {
    return leerLista(await this.ctx.storage.get("pruebas"), esPrueba);
  }
}

function leerLista<T>(guardado: unknown, valido: (valor: unknown) => valor is T): T[] {
  if (!Array.isArray(guardado)) return [];
  const lista: unknown[] = guardado;
  return lista.filter(valido);
}

const esObjeto = (valor: unknown): valor is Record<string, unknown> =>
  typeof valor === "object" && valor !== null;

const esUso = (valor: unknown): valor is Uso =>
  esObjeto(valor) && typeof valor.momento === "number" && typeof valor.segundos === "number";

const esPrueba = (valor: unknown): valor is Prueba =>
  esObjeto(valor) && typeof valor.id === "string" && typeof valor.inicio === "number";
