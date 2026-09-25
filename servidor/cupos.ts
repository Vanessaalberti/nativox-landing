import { DurableObject } from "cloudflare:workers";
import { aplicarLimite, medirCupo, type Decision, type Limite, type Uso } from "./limites";

// Un objeto por clave (dispositivo, IP o el sitio entero): guarda cuándo se usó y cuántos segundos
// de audio, y decide si queda cupo. Al ser un solo objeto por clave, dos pedidos simultáneos no se
// saltean el límite.
export class Cupos extends DurableObject<Env> {
  // `momento` identifica el uso: si la transcripción falla, se devuelve exactamente ese.
  async consumir(limite: Limite, segundos: number): Promise<Decision & { momento: number }> {
    const momento = Date.now();
    const { usos, decision } = aplicarLimite(await this.usos(), momento, limite, segundos);
    await this.ctx.storage.put("usos", usos);
    return { ...decision, momento };
  }

  async consultar(limite: Limite): Promise<Decision> {
    return medirCupo(await this.usos(), Date.now(), limite);
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
    const guardados: unknown = await this.ctx.storage.get("usos");
    if (!Array.isArray(guardados)) return [];
    const lista: unknown[] = guardados;
    return lista.filter(
      (valor): valor is Uso =>
        typeof valor === "object" &&
        valor !== null &&
        "momento" in valor &&
        "segundos" in valor &&
        typeof valor.momento === "number" &&
        typeof valor.segundos === "number",
    );
  }
}
