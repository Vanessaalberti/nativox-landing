import { DurableObject } from "cloudflare:workers";
import { aplicarLimite, type Decision, type Limite } from "./limites";

// Un objeto por clave (dispositivo, IP o el sitio entero): guarda cuándo se usó y decide si
// queda cupo. Al ser un solo objeto por clave, dos pedidos simultáneos no se saltean el límite.
export class Cupos extends DurableObject<Env> {
  async consumir(limite: Limite): Promise<Decision> {
    const { usos, decision } = aplicarLimite(await this.usos(), Date.now(), limite);
    await this.ctx.storage.put("usos", usos);
    return decision;
  }

  async consultar(limite: Limite): Promise<Decision> {
    const vigentes = (await this.usos()).filter(
      (momento) => Date.now() - momento < limite.periodoMs,
    );
    const { decision } = aplicarLimite(vigentes, Date.now(), limite);
    return { ...decision, restantes: decision.permitido ? decision.restantes + 1 : 0 };
  }

  // Si la transcripción falló, el uso no cuenta.
  async devolver(): Promise<void> {
    const usos = await this.usos();
    await this.ctx.storage.put("usos", usos.slice(0, -1));
  }

  private async usos(): Promise<number[]> {
    const guardados: unknown = await this.ctx.storage.get("usos");
    return Array.isArray(guardados)
      ? guardados.filter((valor): valor is number => typeof valor === "number")
      : [];
  }
}
