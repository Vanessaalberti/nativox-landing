// En el CI: falla si navegador/copia-modulos/ se editó a mano.
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  ARCHIVO_ORIGEN,
  aRutaPosix,
  CARPETA_COPIA,
  compararCopia,
  leerResumenes,
  listarArchivos,
  resumenDe,
} from "./copia.ts";

const carpeta = resolve(CARPETA_COPIA);
const esperados = leerResumenes(readFileSync(join(carpeta, ARCHIVO_ORIGEN), "utf8"));
const actuales = new Map(
  listarArchivos(carpeta)
    .filter((ruta) => !ruta.endsWith(ARCHIVO_ORIGEN))
    .map((ruta) => [aRutaPosix(carpeta, ruta), resumenDe(ruta)]),
);

const { editados, faltan, sobran } = compararCopia(esperados, actuales);
const problemas = [
  ...editados.map((ruta) => `editado a mano: ${ruta}`),
  ...faltan.map((ruta) => `falta: ${ruta}`),
  ...sobran.map((ruta) => `sobra (no vino de la aplicación): ${ruta}`),
];

if (problemas.length > 0) {
  process.stderr.write(
    `La copia de módulos no coincide con ${ARCHIVO_ORIGEN}:\n- ${problemas.join("\n- ")}\n` +
      "Los cambios se hacen en nativox-app y se traen con `npm run sincronizar`.\n",
  );
  process.exit(1);
}
process.stdout.write(`Copia de módulos verificada: ${String(actuales.size)} archivos.\n`);
