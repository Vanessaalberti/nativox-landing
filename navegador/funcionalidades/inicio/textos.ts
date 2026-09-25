import type { Idioma } from "@nativox/compartido/contratos";

interface TextosInicio {
  titulo: [string, string, string, string, string];
  bajada: [string, string];
  invitacion: string;
  audio: string;
  entrada: string;
  iniciar: string;
  detener: string;
  limite: string;
  quedan: string;
  pruebas: (restantes: number) => string;
  transcribiendo: string;
  traduciendo: string;
  sinCupo: (horas: number) => string;
  probarLocal: string;
  enVivo: string;
  reposo: [string, string, string, string, string];
  ultimaPalabra: string;
  idiomaHablado: string;
  mostrarEn: string;
  original: string;
  franja: [string, string, string];
  sobre: string;
  queEs: [string, string];
  parrafos: [string, string, string];
  verComoFunciona: string;
  imagen: string;
}

export const TEXTOS_INICIO: Record<Idioma, TextosInicio> = {
  es: {
    titulo: ["Transcripción y", "traducción", "en vivo", "para cualquier", "conferencia."],
    bajada: ["Código abierto, autohosteable, sin costo", "de infraestructura"],
    invitacion: "Habla por tu micrófono y mira el resultado a la derecha",
    audio: "\\ Audio",
    entrada: "Input",
    iniciar: "Iniciar transcripción",
    detener: "Detener",
    limite: "Podés hablar hasta 15 segundos",
    quedan: "Quedan",
    pruebas: (restantes) =>
      restantes === 1 ? "Te queda 1 prueba" : `Te quedan ${String(restantes)} pruebas`,
    transcribiendo: "Transcribiendo en la nube…",
    traduciendo: "Traduciendo…",
    sinCupo: (horas) =>
      `Ya usaste tus 3 pruebas en este dispositivo. Vuelven a estar disponibles en ${String(horas)} h.`,
    probarLocal: "Mientras tanto, probalo en tu computadora →",
    enVivo: "Transcripción en vivo",
    reposo: [
      "Bienvenidos a todos.",
      "Hoy vamos a hablar sobre cómo",
      "la tecnología puede transformar",
      "la experiencia de una conferencia",
      "en tiempo",
    ],
    ultimaPalabra: "real.",
    idiomaHablado: "Idioma de transcripción",
    mostrarEn: "Mostrar en",
    original: "Original",
    franja: ["Transcripción abierta", "Traducción en vivo", "Código abierto"],
    sobre: "01 — Sobre el proyecto",
    queEs: ["¿Qué es", "Nativox?"],
    parrafos: [
      "Cada charla que se da en un idioma que la audiencia no domina deja gente afuera. Durante años la única forma de resolverlo fue interpretación simultánea humana — cara, difícil de conseguir, imposible de escalar a más de un escenario a la vez.",
      "Nativox transcribe y traduce charlas en vivo, en tiempo real, para cualquier conferencia — sin intérpretes contratados, sin licencias, sin depender de un solo proveedor. Corre en el navegador de quien organiza el evento, con motores de IA intercambiables y sin costo de infraestructura para quien lo mantiene.",
      "Es código abierto de punta a punta: cualquier comunidad, conferencia o evento puede desplegar su propia instancia, gratis, hoy mismo.",
    ],
    verComoFunciona: "Ver cómo funciona",
    imagen: "Charla en una conferencia con audiencia en vivo",
  },
  en: {
    titulo: ["Live", "transcription", "and translation", "for any", "conference."],
    bajada: ["Open source, self-hostable, no", "infrastructure cost"],
    invitacion: "Speak into your microphone and see the result on the right",
    audio: "\\ Audio",
    entrada: "Input",
    iniciar: "Start transcription",
    detener: "Stop",
    limite: "You can speak for up to 15 seconds",
    quedan: "Remaining:",
    pruebas: (restantes) => (restantes === 1 ? "1 try left" : `${String(restantes)} tries left`),
    transcribiendo: "Transcribing in the cloud…",
    traduciendo: "Translating…",
    sinCupo: (horas) =>
      `You used your 3 tries on this device. They come back in ${String(horas)} h.`,
    probarLocal: "Meanwhile, try it on your computer →",
    enVivo: "Live transcription",
    reposo: [
      "Welcome, everyone.",
      "Today we are going to talk about how",
      "technology can transform",
      "the experience of a conference",
      "in",
    ],
    ultimaPalabra: "real time.",
    idiomaHablado: "Transcription language",
    mostrarEn: "Show in",
    original: "Original",
    franja: ["Open transcription", "Live translation", "Open source"],
    sobre: "01 — About the project",
    queEs: ["What is", "Nativox?"],
    parrafos: [
      "Every talk given in a language the audience does not master leaves people out. For years, the only way to solve it was human simultaneous interpretation — expensive, hard to find, impossible to scale to more than one stage at a time.",
      "Nativox transcribes and translates talks live, in real time, for any conference — no hired interpreters, no licenses, no dependence on a single provider. It runs in the organizer's browser, with interchangeable AI engines and no infrastructure cost for whoever maintains it.",
      "It is open source end to end: any community, conference or event can deploy its own instance, for free, today.",
    ],
    verComoFunciona: "See how it works",
    imagen: "Talk at a conference with a live audience",
  },
  pt: {
    titulo: ["Transcrição e", "tradução", "ao vivo", "para qualquer", "conferência."],
    bajada: ["Código aberto, auto-hospedável, sem custo", "de infraestrutura"],
    invitacion: "Fale no seu microfone e veja o resultado à direita",
    audio: "\\ Áudio",
    entrada: "Input",
    iniciar: "Iniciar transcrição",
    detener: "Parar",
    limite: "Você pode falar por até 15 segundos",
    quedan: "Restam",
    pruebas: (restantes) =>
      restantes === 1 ? "Resta 1 teste" : `Restam ${String(restantes)} testes`,
    transcribiendo: "Transcrevendo na nuvem…",
    traduciendo: "Traduzindo…",
    sinCupo: (horas) =>
      `Você usou seus 3 testes neste dispositivo. Eles voltam em ${String(horas)} h.`,
    probarLocal: "Enquanto isso, teste no seu computador →",
    enVivo: "Transcrição ao vivo",
    reposo: [
      "Bem-vindos a todos.",
      "Hoje vamos falar sobre como",
      "a tecnologia pode transformar",
      "a experiência de uma conferência",
      "em tempo",
    ],
    ultimaPalabra: "real.",
    idiomaHablado: "Idioma da transcrição",
    mostrarEn: "Mostrar em",
    original: "Original",
    franja: ["Transcrição aberta", "Tradução ao vivo", "Código aberto"],
    sobre: "01 — Sobre o projeto",
    queEs: ["O que é", "Nativox?"],
    parrafos: [
      "Cada palestra dada em um idioma que o público não domina deixa gente de fora. Durante anos, a única forma de resolver isso foi a interpretação simultânea humana — cara, difícil de conseguir, impossível de escalar para mais de um palco ao mesmo tempo.",
      "Nativox transcreve e traduz palestras ao vivo, em tempo real, para qualquer conferência — sem intérpretes contratados, sem licenças, sem depender de um único fornecedor. Roda no navegador de quem organiza o evento, com motores de IA intercambiáveis e sem custo de infraestrutura para quem o mantém.",
      "É código aberto de ponta a ponta: qualquer comunidade, conferência ou evento pode implantar a sua própria instância, de graça, hoje mesmo.",
    ],
    verComoFunciona: "Ver como funciona",
    imagen: "Palestra em uma conferência com público ao vivo",
  },
};
