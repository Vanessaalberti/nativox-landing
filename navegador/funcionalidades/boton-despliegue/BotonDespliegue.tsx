import type { Idioma } from "@nativox/compartido/contratos";

// El botón oficial de Cloudflare copia el repositorio a la cuenta de quien organiza y crea el
// Worker, la base D1, los Durable Objects y la conexión con Workers AI. Antes del clic se explica
// qué hace falta (documento de decisiones → "Pendiente de verificar", punto 2).
const URL_DESPLIEGUE =
  "https://deploy.workers.cloudflare.com/?url=https://github.com/Vanessaalberti/nativox-app";

const TEXTOS: Record<
  Idioma,
  { titulo: string; requisitos: [string, string, string]; boton: string; despues: string }
> = {
  es: {
    titulo: "Desplegá tu instancia",
    requisitos: [
      "Una cuenta de Cloudflare (alcanza la gratuita).",
      "Una cuenta de GitHub o GitLab: el botón copia el proyecto ahí y lo conecta con Cloudflare.",
      "Ninguna API key: la inteligencia artificial corre en el navegador de cada sala.",
    ],
    boton: "Deploy to Cloudflare",
    despues:
      "Cuando termine, tu dirección aparece en Cloudflare: Workers y Pages → tu Worker → «Visitar». Abrila enseguida y creá tu evento: la primera persona que lo crea queda como dueña. Esta pestaña queda abierta para que vuelvas.",
  },
  en: {
    titulo: "Deploy your instance",
    requisitos: [
      "A Cloudflare account (the free one is enough).",
      "A GitHub or GitLab account: the button copies the project there and connects it to Cloudflare.",
      "No API keys: the AI runs in the browser of each room.",
    ],
    boton: "Deploy to Cloudflare",
    despues:
      "When it finishes, your address shows up in Cloudflare: Workers & Pages → your Worker → “Visit”. Open it right away and create your event: whoever creates it first becomes the owner. This tab stays open so you can come back.",
  },
  pt: {
    titulo: "Implante a sua instância",
    requisitos: [
      "Uma conta da Cloudflare (a gratuita é suficiente).",
      "Uma conta do GitHub ou GitLab: o botão copia o projeto para lá e o conecta à Cloudflare.",
      "Nenhuma API key: a inteligência artificial roda no navegador de cada sala.",
    ],
    boton: "Deploy to Cloudflare",
    despues:
      "Quando terminar, o seu endereço aparece na Cloudflare: Workers e Pages → o seu Worker → «Visitar». Abra-o logo e crie o seu evento: quem criar primeiro fica como dono. Esta aba continua aberta para você voltar.",
  },
};

export function BotonDespliegue({ idioma }: { idioma: Idioma }) {
  const textos = TEXTOS[idioma];
  return (
    <div
      id="seccion-despliegue"
      className="mt-10 w-full scroll-mt-20 border-[1.5px] border-ink/20 bg-canvas p-5 text-left"
    >
      <h3 className="font-display text-3xl leading-none uppercase">{textos.titulo}</h3>
      <ul className="mt-3 flex flex-col gap-1.5 font-mono text-xs text-ink/75">
        {textos.requisitos.map((requisito) => (
          <li key={requisito} className="flex gap-2">
            <span className="text-naranja">◆</span>
            {requisito}
          </li>
        ))}
      </ul>
      <a
        href={URL_DESPLIEGUE}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-2 rounded-sm bg-ink px-5 py-3 font-mono text-xs font-bold tracking-widest text-canvas uppercase hover:bg-naranja hover:text-ink"
      >
        {textos.boton} <span>↗</span>
      </a>
      <p className="mt-3 font-mono text-[11px] leading-relaxed text-ink/65">{textos.despues}</p>
    </div>
  );
}
