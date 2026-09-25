// El único lugar que escribe en los registros del Worker: JSON de una línea, sin datos de quien
// visita (ni audio ni IP).
export function registrarError(mensaje: string, causa: unknown): void {
  console.error(
    JSON.stringify({
      nivel: "error",
      mensaje,
      causa: causa instanceof Error ? causa.message : String(causa),
    }),
  );
}
