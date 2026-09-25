import {
  CUPO_POR_PRUEBA,
  PRUEBAS_LOCALES_POR_DISPOSITIVO,
  PRUEBAS_POR_DISPOSITIVO,
} from "../contratos-landing/nube";

// Cuánto se puede usar la transcripción en la nube. Hay dos topes, los dos en el servidor (un
// Durable Object por dispositivo, por IP y uno para todo el sitio) para que recargar la página no
// los reinicie:
// - **pruebas:** lo que ve la persona. Una prueba es una sesión de hasta 15 s; el navegador le
//   pone un id y todos los pedidos de esa sesión cuentan como una sola.
// - **segundos de audio:** lo que factura Workers AI (la pasada provisoria vuelve a mandar lo que
//   se viene diciendo). Es la red de seguridad de costos, más holgada que las pruebas.

// Un pedido es una frase: el cortador corta a los 8 s como máximo y suma 1,5 s de contexto.
export const SEGUNDOS_MAXIMOS_POR_PEDIDO = 12;
// Con menos que esto de cupo no vale la pena seguir escuchando.
const SEGUNDOS_MINIMOS_UTILES = 2;
// Una prueba dura 15 s: pasado este plazo, un pedido con el mismo id ya cuenta como prueba nueva.
const VIGENCIA_DE_PRUEBA_MS = 60_000;
const DIA_MS = 24 * 60 * 60 * 1000;

export interface Limite {
  pruebas: number;
  segundos: number;
  periodoMs: number;
}

export const LIMITES = {
  // 3 pruebas por dispositivo (lo que pidió Vanessa).
  dispositivo: {
    pruebas: PRUEBAS_POR_DISPOSITIVO,
    segundos: PRUEBAS_POR_DISPOSITIVO * CUPO_POR_PRUEBA,
    periodoMs: DIA_MS,
  },
  // Por si alguien borra la cookie para seguir probando: tope por IP (varias personas pueden
  // compartir una IP en un evento, por eso es 4 veces más alto).
  ip: {
    pruebas: 4 * PRUEBAS_POR_DISPOSITIVO,
    segundos: 4 * PRUEBAS_POR_DISPOSITIVO * CUPO_POR_PRUEBA,
    periodoMs: DIA_MS,
  },
  // Tope del sitio: 12.000 s facturados son 200 min por día, lo que cubren los 10.000 neurons
  // diarios gratis de Workers AI (Whisper turbo: $0,000513 por minuto).
  sitio: { pruebas: 130, segundos: 12_000, periodoMs: DIA_MS },
} satisfies Record<string, Limite>;

// "Probar" con micrófono: solo se cuentan pruebas (no hay audio que facture, corre en la placa de
// quien visita). Aparte de las de la portada, y sin tope para todo el sitio.
const SIN_TOPE_DE_AUDIO = Number.MAX_SAFE_INTEGER;
export const LIMITES_LOCALES = {
  dispositivo: {
    pruebas: PRUEBAS_LOCALES_POR_DISPOSITIVO,
    segundos: SIN_TOPE_DE_AUDIO,
    periodoMs: DIA_MS,
  },
  ip: {
    pruebas: 4 * PRUEBAS_LOCALES_POR_DISPOSITIVO,
    segundos: SIN_TOPE_DE_AUDIO,
    periodoMs: DIA_MS,
  },
} satisfies Record<string, Limite>;

export interface Uso {
  momento: number;
  segundos: number;
}

export interface Prueba {
  id: string;
  inicio: number;
}

export interface Decision {
  permitido: boolean;
  // Lo que queda después de esta decisión (segundos de audio o pruebas, según el tope).
  restantes: number;
  reintentarEnSegundos: number;
}

const vigentes = <T>(
  lista: readonly T[],
  momento: (elemento: T) => number,
  ahora: number,
  periodoMs: number,
) => lista.filter((elemento) => ahora - momento(elemento) < periodoMs);

// Cuánto falta para que se liberen `necesarios` elementos, contando desde el más viejo.
function esperaHasta(
  lista: readonly { momento: number; peso: number }[],
  ahora: number,
  periodoMs: number,
  necesarios: number,
) {
  let liberados = 0;
  for (const elemento of [...lista].sort((a, b) => a.momento - b.momento)) {
    liberados += elemento.peso;
    if (liberados >= necesarios) return Math.ceil((elemento.momento + periodoMs - ahora) / 1000);
  }
  return Math.ceil(periodoMs / 1000);
}

const comoUsos = (usos: readonly Uso[]) =>
  usos.map((uso) => ({ momento: uso.momento, peso: uso.segundos }));
const comoPruebas = (pruebas: readonly Prueba[]) =>
  pruebas.map((prueba) => ({ momento: prueba.inicio, peso: 1 }));
const sumar = (usos: readonly Uso[]) => usos.reduce((total, uso) => total + uso.segundos, 0);

// Segundos de audio: decide si entran `segundos` más. Devuelve los usos que quedan guardados y la
// decisión.
export function aplicarLimite(
  usos: readonly Uso[],
  ahora: number,
  { segundos: maximo, periodoMs }: Limite,
  segundos: number,
): { usos: Uso[]; decision: Decision } {
  const actuales = vigentes(usos, (uso) => uso.momento, ahora, periodoMs);
  const usados = sumar(actuales);
  if (usados + segundos > maximo) {
    return {
      usos: actuales,
      decision: {
        permitido: false,
        restantes: Math.max(0, maximo - usados),
        reintentarEnSegundos: esperaHasta(
          comoUsos(actuales),
          ahora,
          periodoMs,
          usados + segundos - maximo,
        ),
      },
    };
  }
  return {
    usos: [...actuales, { momento: ahora, segundos }],
    decision: { permitido: true, restantes: maximo - usados - segundos, reintentarEnSegundos: 0 },
  };
}

// Pruebas: si el id ya está registrado y sigue vigente, el pedido es de una prueba en curso y no
// gasta otra. Si no, se registra una nueva (si queda cupo).
export function registrarPrueba(
  pruebas: readonly Prueba[],
  ahora: number,
  { pruebas: maximo, periodoMs }: Limite,
  id: string,
): { pruebas: Prueba[]; decision: Decision; creada: boolean } {
  const actuales = vigentes(pruebas, (prueba) => prueba.inicio, ahora, periodoMs);
  const enCurso = actuales.some(
    (prueba) => prueba.id === id && ahora - prueba.inicio < VIGENCIA_DE_PRUEBA_MS,
  );
  if (enCurso) {
    return {
      pruebas: actuales,
      decision: {
        permitido: true,
        restantes: Math.max(0, maximo - actuales.length),
        reintentarEnSegundos: 0,
      },
      creada: false,
    };
  }
  if (actuales.length >= maximo) {
    return {
      pruebas: actuales,
      decision: {
        permitido: false,
        restantes: 0,
        reintentarEnSegundos: esperaHasta(comoPruebas(actuales), ahora, periodoMs, 1),
      },
      creada: false,
    };
  }
  return {
    pruebas: [...actuales, { id, inicio: ahora }],
    decision: { permitido: true, restantes: maximo - actuales.length - 1, reintentarEnSegundos: 0 },
    creada: true,
  };
}

// Lo que queda sin gastar nada (para `GET /api/cupos`): pruebas, y 0 si el audio ya no alcanza
// para seguir. Si no queda, dice cuánto falta para que vuelva a haber.
export function medirCupo(
  usos: readonly Uso[],
  pruebas: readonly Prueba[],
  ahora: number,
  limite: Limite,
): { pruebas: number; reintentarEnSegundos: number } {
  const usosActuales = vigentes(usos, (uso) => uso.momento, ahora, limite.periodoMs);
  const pruebasActuales = vigentes(pruebas, (prueba) => prueba.inicio, ahora, limite.periodoMs);
  const segundosRestantes = Math.max(0, limite.segundos - sumar(usosActuales));
  const faltaAudio = segundosRestantes < SEGUNDOS_MINIMOS_UTILES;
  const pruebasRestantes = faltaAudio ? 0 : Math.max(0, limite.pruebas - pruebasActuales.length);
  if (pruebasRestantes > 0) return { pruebas: pruebasRestantes, reintentarEnSegundos: 0 };

  const esperas = [
    faltaAudio
      ? esperaHasta(
          comoUsos(usosActuales),
          ahora,
          limite.periodoMs,
          SEGUNDOS_MINIMOS_UTILES - segundosRestantes,
        )
      : 0,
    pruebasActuales.length >= limite.pruebas
      ? esperaHasta(comoPruebas(pruebasActuales), ahora, limite.periodoMs, 1)
      : 0,
  ];
  return { pruebas: 0, reintentarEnSegundos: Math.max(...esperas) };
}
