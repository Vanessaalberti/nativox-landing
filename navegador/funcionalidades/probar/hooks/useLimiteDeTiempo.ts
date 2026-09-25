import { useEffect, useRef, useState } from "react";

const MS_ENTRE_ACTUALIZACIONES = 200;

// Cuenta regresiva mientras `activo`: devuelve los segundos que quedan (redondeados para arriba)
// y llama a `alAgotarse` una sola vez cuando llega a cero. Sin límite, devuelve null.
export function useLimiteDeTiempo(
  activo: boolean,
  segundos: number | null,
  alAgotarse: () => void,
): number | null {
  const [restantes, setRestantes] = useState<number | null>(null);
  const alAgotarseActual = useRef(alAgotarse);
  alAgotarseActual.current = alAgotarse;

  useEffect(() => {
    if (!activo || segundos === null) {
      setRestantes(null);
      return;
    }
    const inicio = performance.now();
    setRestantes(segundos);
    const temporizador = setInterval(() => {
      const quedan = segundos - (performance.now() - inicio) / 1000;
      setRestantes(Math.max(0, Math.ceil(quedan)));
      if (quedan <= 0) {
        clearInterval(temporizador);
        alAgotarseActual.current();
      }
    }, MS_ENTRE_ACTUALIZACIONES);
    return () => clearInterval(temporizador);
  }, [activo, segundos]);

  return restantes;
}
