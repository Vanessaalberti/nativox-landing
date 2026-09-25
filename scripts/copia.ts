import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

// Qué se copia de la aplicación (rutas relativas a su raíz): los módulos que usa "Probar", el
// código compartido que importan y el sistema de diseño. Las pruebas no se copian (usan
// `muestras/`, que vive en la aplicación).
export const CARPETAS_COPIADAS = [
  "compartido/contratos",
  "compartido/distancia-edicion",
  "compartido/glosario",
  "compartido/metricas",
  "navegador/modulos/captura-audio",
  "navegador/modulos/cortador-audio",
  "navegador/modulos/flujo-subtitulos",
  "navegador/modulos/modelos-compartidos",
  "navegador/modulos/transcripcion",
  "navegador/modulos/traduccion",
  "navegador/interfaz/sistema-diseno",
  "navegador/interfaz/subtitulos",
];

export const CARPETA_COPIA = "navegador/copia-modulos/modulos-nativox";
export const ARCHIVO_ORIGEN = "SINCRONIZADO_DESDE.md";

export const esArchivoCopiable = (ruta: string) => !/\.test\.tsx?$/.test(ruta);

export function listarArchivos(carpeta: string): string[] {
  return readdirSync(carpeta).flatMap((nombre) => {
    const ruta = join(carpeta, nombre);
    return statSync(ruta).isDirectory() ? listarArchivos(ruta) : [ruta];
  });
}

export function aRutaPosix(base: string, ruta: string): string {
  return relative(base, ruta).split(sep).join("/");
}

// Los finales de línea se unifican antes de calcular el resumen: Git en Windows puede
// convertirlos y eso no es "editar a mano".
export function resumenDe(ruta: string): string {
  const texto = readFileSync(ruta).toString("utf8").replace(/\r\n/g, "\n");
  return createHash("sha256").update(texto).digest("hex");
}

const FILA = /^\| `([^`]+)` \| `([0-9a-f]{64})` \|$/;

export function leerResumenes(contenido: string): Map<string, string> {
  const resumenes = new Map<string, string>();
  for (const renglon of contenido.split(/\r?\n/)) {
    const fila = FILA.exec(renglon);
    if (fila?.[1] && fila[2]) resumenes.set(fila[1], fila[2]);
  }
  return resumenes;
}

export function escribirResumenes(resumenes: ReadonlyMap<string, string>): string {
  return [...resumenes.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([ruta, resumen]) => `| \`${ruta}\` | \`${resumen}\` |`)
    .join("\n");
}

// Compara lo que dice SINCRONIZADO_DESDE.md con lo que hay en la carpeta: qué se editó, qué
// falta y qué sobra.
export function compararCopia(
  esperados: ReadonlyMap<string, string>,
  actuales: ReadonlyMap<string, string>,
): { editados: string[]; faltan: string[]; sobran: string[] } {
  return {
    editados: [...esperados]
      .filter(([ruta, resumen]) => actuales.has(ruta) && actuales.get(ruta) !== resumen)
      .map(([ruta]) => ruta),
    faltan: [...esperados.keys()].filter((ruta) => !actuales.has(ruta)),
    sobran: [...actuales.keys()].filter((ruta) => !esperados.has(ruta)),
  };
}
