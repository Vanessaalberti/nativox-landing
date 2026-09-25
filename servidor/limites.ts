import { CUPO_POR_PRUEBA, PRUEBAS_POR_DISPOSITIVO } from "../contratos-landing/nube";

// Cuánto audio se puede transcribir en la nube. En tiempo real la portada manda varios pedidos por
// frase (la pasada provisoria y la confirmada), así que lo que se cuenta son segundos de audio (lo
// que factura Workers AI). Los usos se guardan en el servidor (un Durable Object por dispositivo,
// por IP y uno para todo el sitio), no en el navegador.

// Un pedido es una frase: el cortador corta a los 8 s como máximo y suma 1,5 s de contexto.
export const SEGUNDOS_MAXIMOS_POR_PEDIDO = 12;
// Con menos que esto de cupo no vale la pena seguir escuchando.
const SEGUNDOS_MINIMOS_UTILES = 2;
const DIA_MS = 24 * 60 * 60 * 1000;

export interface Limite {
  segundos: number;
  periodoMs: number;
}

export const LIMITES = {
  // 3 pruebas por dispositivo (lo que pidió Vanessa).
  dispositivo: { segundos: PRUEBAS_POR_DISPOSITIVO * CUPO_POR_PRUEBA, periodoMs: DIA_MS },
  // Por si alguien borra la cookie para seguir probando: tope por IP (varias personas pueden
  // compartir una IP en un evento, por eso es 4 veces más alto).
  ip: { segundos: 4 * PRUEBAS_POR_DISPOSITIVO * CUPO_POR_PRUEBA, periodoMs: DIA_MS },
  // Tope del sitio: 12.000 s facturados son 200 min por día, lo que cubren los 10.000 neurons
  // diarios gratis de Workers AI (Whisper turbo: $0,000513 por minuto): unas 200 pruebas.
  sitio: { segundos: 12_000, periodoMs: DIA_MS },
} satisfies Record<string, Limite>;

export interface Uso {
  momento: number;
  segundos: number;
}

export interface Decision {
  permitido: boolean;
  // Segundos de audio que quedan después de esta decisión.
  restantes: number;
  reintentarEnSegundos: number;
}

// Ventana móvil: cuentan los usos de las últimas `periodoMs`.
function usosVigentes(usos: readonly Uso[], ahora: number, periodoMs: number): Uso[] {
  return usos.filter((uso) => ahora - uso.momento < periodoMs);
}

const sumar = (usos: readonly Uso[]) => usos.reduce((total, uso) => total + uso.segundos, 0);

// Cuánto falta para que se liberen `necesarios` segundos, contando desde el uso más viejo.
function esperaHasta(usos: readonly Uso[], ahora: number, periodoMs: number, necesarios: number) {
  let liberados = 0;
  for (const uso of [...usos].sort((a, b) => a.momento - b.momento)) {
    liberados += uso.segundos;
    if (liberados >= necesarios) return Math.ceil((uso.momento + periodoMs - ahora) / 1000);
  }
  return Math.ceil(periodoMs / 1000);
}

// Decide si entran `segundos` más. Devuelve los usos que quedan guardados y la decisión.
export function aplicarLimite(
  usos: readonly Uso[],
  ahora: number,
  { segundos: maximo, periodoMs }: Limite,
  segundos: number,
): { usos: Uso[]; decision: Decision } {
  const vigentes = usosVigentes(usos, ahora, periodoMs);
  const usados = sumar(vigentes);
  if (usados + segundos > maximo) {
    return {
      usos: vigentes,
      decision: {
        permitido: false,
        restantes: Math.max(0, maximo - usados),
        reintentarEnSegundos: esperaHasta(vigentes, ahora, periodoMs, usados + segundos - maximo),
      },
    };
  }
  return {
    usos: [...vigentes, { momento: ahora, segundos }],
    decision: { permitido: true, restantes: maximo - usados - segundos, reintentarEnSegundos: 0 },
  };
}

// Cuánto cupo queda sin gastar nada (para `GET /api/cupos`). Si no alcanza para seguir, dice
// cuánto falta para que vuelva a haber.
export function medirCupo(usos: readonly Uso[], ahora: number, limite: Limite): Decision {
  const vigentes = usosVigentes(usos, ahora, limite.periodoMs);
  const restantes = Math.max(0, limite.segundos - sumar(vigentes));
  return {
    permitido: restantes >= SEGUNDOS_MINIMOS_UTILES,
    restantes,
    reintentarEnSegundos:
      restantes >= SEGUNDOS_MINIMOS_UTILES
        ? 0
        : esperaHasta(vigentes, ahora, limite.periodoMs, SEGUNDOS_MINIMOS_UTILES - restantes),
  };
}
