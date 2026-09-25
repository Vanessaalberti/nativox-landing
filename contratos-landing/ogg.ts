// El formato del audio comprimido que la portada le manda al Worker: paquetes Opus de 20 ms dentro
// de un archivo Ogg (RFC 3533 y RFC 7845), mono. El navegador lo arma con `armarOgg` a partir de lo
// que entrega el codificador de WebCodecs, y el servidor mide su duración con `duracionDeOgg`
// (servidor/ogg.ts) sin decodificar nada.

export const FRECUENCIA_OGG = 48_000;
const MUESTRAS_POR_PAQUETE = 960; // 20 ms a 48 kHz
export const PREINICIO_POR_DEFECTO = 312;
const SERIE = 0x4e545658;
const MAXIMO_DE_SEGMENTOS = 255;

const TABLA_CRC = (() => {
  const tabla = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let resto = i << 24;
    for (let bit = 0; bit < 8; bit++) {
      resto = resto & 0x80000000 ? (resto << 1) ^ 0x04c11db7 : resto << 1;
    }
    tabla[i] = resto >>> 0;
  }
  return tabla;
})();

// El CRC de Ogg: polinomio 0x04C11DB7, sin invertir bits y sin xor final.
export function crcOgg(bytes: Uint8Array): number {
  let crc = 0;
  for (const byte of bytes)
    crc = ((crc << 8) ^ (TABLA_CRC[((crc >>> 24) ^ byte) & 0xff] ?? 0)) >>> 0;
  return crc;
}

interface DatosDePagina {
  secuencia: number;
  // Posición del último paquete de la página, en muestras a 48 kHz (cuenta el preinicio).
  granule: number;
  inicio?: boolean;
  fin?: boolean;
}

function pagina(paquetes: readonly Uint8Array[], datos: DatosDePagina): Uint8Array {
  const segmentos: number[] = [];
  for (const paquete of paquetes) {
    let quedan = paquete.length;
    while (quedan >= 255) {
      segmentos.push(255);
      quedan -= 255;
    }
    segmentos.push(quedan);
  }
  const cuerpo = paquetes.reduce((total, paquete) => total + paquete.length, 0);
  const salida = new Uint8Array(27 + segmentos.length + cuerpo);
  const vista = new DataView(salida.buffer);
  salida.set([0x4f, 0x67, 0x67, 0x53], 0); // "OggS"
  vista.setUint8(5, (datos.inicio ? 0x02 : 0) | (datos.fin ? 0x04 : 0));
  vista.setBigUint64(6, BigInt(datos.granule), true);
  vista.setUint32(14, SERIE, true);
  vista.setUint32(18, datos.secuencia, true);
  vista.setUint8(26, segmentos.length);
  salida.set(segmentos, 27);
  let posicion = 27 + segmentos.length;
  for (const paquete of paquetes) {
    salida.set(paquete, posicion);
    posicion += paquete.length;
  }
  vista.setUint32(22, crcOgg(salida), true);
  return salida;
}

const texto = (valor: string) => Uint8Array.from(valor, (letra) => letra.charCodeAt(0));

// La cabecera "OpusHead" de un flujo mono (RFC 7845, sección 5.1).
function cabeceraOpus(frecuenciaDeEntrada: number, preinicio: number): Uint8Array {
  const cabecera = new Uint8Array(19);
  cabecera.set(texto("OpusHead"), 0);
  const vista = new DataView(cabecera.buffer);
  vista.setUint8(8, 1); // versión
  vista.setUint8(9, 1); // canales
  vista.setUint16(10, preinicio, true);
  vista.setUint32(12, frecuenciaDeEntrada, true);
  return cabecera;
}

function comentarios(): Uint8Array {
  const marca = texto("OpusTags");
  const proveedor = texto("nativox");
  const salida = new Uint8Array(marca.length + 4 + proveedor.length + 4);
  salida.set(marca, 0);
  const vista = new DataView(salida.buffer);
  vista.setUint32(marca.length, proveedor.length, true);
  salida.set(proveedor, marca.length + 4);
  return salida;
}

// Junta los paquetes Opus (cada uno de 20 ms) en un archivo Ogg. La duración queda en la posición
// (granule) de la última página: (granule - preinicio) / 48000 segundos.
export function armarOgg(
  paquetes: readonly Uint8Array[],
  opciones: { frecuenciaDeEntrada: number; preinicio?: number },
): Uint8Array<ArrayBuffer> {
  const preinicio = opciones.preinicio ?? PREINICIO_POR_DEFECTO;
  const paginas = [
    pagina([cabeceraOpus(opciones.frecuenciaDeEntrada, preinicio)], {
      secuencia: 0,
      granule: 0,
      inicio: true,
    }),
    pagina([comentarios()], { secuencia: 1, granule: 0 }),
  ];

  let grupo: Uint8Array[] = [];
  let segmentos = 0;
  let enviados = 0;
  const cerrar = (fin: boolean) => {
    enviados += grupo.length;
    paginas.push(
      pagina(grupo, {
        secuencia: paginas.length,
        granule: preinicio + enviados * MUESTRAS_POR_PAQUETE,
        fin,
      }),
    );
    grupo = [];
    segmentos = 0;
  };
  for (const paquete of paquetes) {
    const necesarios = Math.floor(paquete.length / 255) + 1;
    if (segmentos + necesarios > MAXIMO_DE_SEGMENTOS) cerrar(false);
    grupo.push(paquete);
    segmentos += necesarios;
  }
  cerrar(true);

  const total = paginas.reduce((suma, elemento) => suma + elemento.length, 0);
  const archivo = new Uint8Array(total);
  let posicion = 0;
  for (const elemento of paginas) {
    archivo.set(elemento, posicion);
    posicion += elemento.length;
  }
  return archivo;
}
