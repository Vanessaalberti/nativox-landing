// Cuántas veces se puede probar la transcripción en la nube. Los usos se cuentan en el servidor
// (un Durable Object por dispositivo, por IP y uno para todo el sitio), no en el navegador.
export const SEGUNDOS_POR_PRUEBA = 15;
const DIA_MS = 24 * 60 * 60 * 1000;

export interface Limite {
  usos: number;
  periodoMs: number;
}

export const LIMITES = {
  // Lo que pidió Vanessa: 3 pruebas por dispositivo.
  dispositivo: { usos: 3, periodoMs: DIA_MS },
  // Por si alguien borra la cookie para seguir probando: tope por IP (varias personas pueden
  // compartir una IP en un evento, por eso es más alto).
  ip: { usos: 12, periodoMs: DIA_MS },
  // Tope del sitio: 800 pruebas de 15 s son ~200 min por día, lo que cubren los 10.000 neurons
  // diarios gratis de Workers AI (Whisper turbo: $0,000513 por minuto).
  sitio: { usos: 800, periodoMs: DIA_MS },
} satisfies Record<string, Limite>;

export interface Decision {
  permitido: boolean;
  restantes: number;
  reintentarEnSegundos: number;
}

// Ventana móvil: cuentan los usos de las últimas `periodoMs`. Devuelve los usos que quedan
// guardados y la decisión.
export function aplicarLimite(
  usos: readonly number[],
  ahora: number,
  { usos: maximo, periodoMs }: Limite,
): { usos: number[]; decision: Decision } {
  const vigentes = usos.filter((momento) => ahora - momento < periodoMs);
  if (vigentes.length >= maximo) {
    const masViejo = Math.min(...vigentes);
    return {
      usos: vigentes,
      decision: {
        permitido: false,
        restantes: 0,
        reintentarEnSegundos: Math.ceil((masViejo + periodoMs - ahora) / 1000),
      },
    };
  }
  return {
    usos: [...vigentes, ahora],
    decision: { permitido: true, restantes: maximo - vigentes.length - 1, reintentarEnSegundos: 0 },
  };
}
