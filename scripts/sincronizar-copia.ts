// Copia los módulos y el sistema de diseño desde la aplicación y escribe SINCRONIZADO_DESDE.md.
// Uso: npm run sincronizar -- <carpeta de nativox-app>   (por defecto ../aplicacion)
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  ARCHIVO_ORIGEN,
  aRutaPosix,
  CARPETA_COPIA,
  CARPETAS_COPIADAS,
  escribirResumenes,
  esArchivoCopiable,
  listarArchivos,
  resumenDe,
} from "./copia.ts";

const aplicacion = resolve(process.argv[2] ?? "../aplicacion");
const destino = resolve(CARPETA_COPIA);

if (!existsSync(join(aplicacion, "compartido"))) {
  throw new Error(
    `No encuentro la aplicación en ${aplicacion}. Pasá su carpeta: npm run sincronizar -- <carpeta>`,
  );
}

rmSync(destino, { recursive: true, force: true });
for (const carpeta of CARPETAS_COPIADAS) {
  mkdirSync(join(destino, carpeta), { recursive: true });
  cpSync(join(aplicacion, carpeta), join(destino, carpeta), {
    recursive: true,
    filter: (origen) => esArchivoCopiable(origen),
  });
}

const resumenes = new Map(
  listarArchivos(destino)
    .filter((ruta) => !ruta.endsWith(ARCHIVO_ORIGEN))
    .map((ruta) => [aRutaPosix(destino, ruta), resumenDe(ruta)]),
);

const git = (argumentos: string[]) =>
  execFileSync("git", ["-C", aplicacion, ...argumentos], { encoding: "utf8" }).trim();
const commit = git(["rev-parse", "--short", "HEAD"]);
const conCambios = git(["status", "--porcelain", "--", ...CARPETAS_COPIADAS]) !== "";

writeFileSync(
  join(destino, ARCHIVO_ORIGEN),
  `# Sincronizado desde nativox-app

**No se edita a mano.** Se actualiza con \`npm run sincronizar\` y la integración continua comprueba (\`npm run verificar-copia\`) que cada archivo coincida con su resumen.

- Commit de origen: \`${commit}\`${conCambios ? " (con cambios todavía sin commitear en la aplicación)" : ""}
- Fecha: ${new Date().toISOString().slice(0, 10)}
- Carpetas: ${CARPETAS_COPIADAS.map((carpeta) => `\`${carpeta}\``).join(", ")}

| Archivo | SHA-256 |
| --- | --- |
${escribirResumenes(resumenes)}
`,
);

process.stdout.write(
  `Copiados ${String(resumenes.size)} archivos desde ${aplicacion} (${commit}).\n`,
);
