import { Fragment } from "react";

// Cuántas veces se repiten los textos en cada mitad de la cinta. La cinta son dos mitades iguales
// que se corren un 50 % y vuelven a empezar sin que se note; para que nunca quede un hueco, cada
// mitad tiene que ser más ancha que la pantalla más ancha (6 vueltas ≈ 4500 px).
const REPETICIONES = 6;

// Dos franjas cruzadas: la de atrás, naranja lisa; la de adelante, verde, con el texto que corre
// lento para no robar el foco. Se extienden más allá del ancho para que no queden huecos.
export function Franja({ textos }: { textos: readonly string[] }) {
  const tira = Array.from({ length: REPETICIONES }, () => textos).flat();
  const vuelta = (
    <span className="flex items-center px-4">
      {tira.map((texto, indice) => (
        <Fragment key={`${String(indice)}-${texto}`}>
          {texto}
          <span className="mx-4 text-naranja">◆</span>
        </Fragment>
      ))}
    </span>
  );
  return (
    <div className="relative z-20 h-20 w-full overflow-visible" aria-hidden>
      <div className="absolute top-1/2 right-[-4%] left-[-4%] h-11 -translate-y-1/2 -rotate-1 bg-naranja shadow-sm" />
      <div className="absolute top-1/2 right-[-4%] left-[-4%] flex h-11 -translate-y-1/2 rotate-1 items-center overflow-hidden bg-verde shadow-md">
        <div className="flex w-max shrink-0 animate-marquesina items-center font-display text-lg tracking-wider whitespace-nowrap text-ink uppercase will-change-transform">
          {vuelta}
          {vuelta}
        </div>
      </div>
    </div>
  );
}
