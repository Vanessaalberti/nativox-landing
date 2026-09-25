import type { Idioma } from "@nativox/compartido/contratos";
import type { Motivo, Nivel } from "@nativox/navegador/modulos/evaluar-equipo";

interface TextosEvaluacion {
  etiqueta: string;
  titulo: string;
  intro: string;
  pasos: [string, string, string, string];
  evaluar: string;
  reevaluar: string;
  detectando: string;
  midiendoWhisper: (actual: number, total: number) => string;
  midiendoTraduccion: (idioma: string) => string;
  placa: string;
  placaSinNombre: string;
  f16: string;
  si: string;
  no: string;
  version: string;
  versiones: { fp16: string; q4: string };
  pasada: string;
  traduccion: string;
  porIdioma: string;
  recomendado: string;
  porQue: string;
  nube: string;
  irALaNube: string;
  gemma: string;
  barra: {
    titulo: string;
    ayuda: string;
    sinEvaluar: string;
    recomendado: string;
    masExigente: string;
    nombres: Record<Nivel, string>;
    descripciones: Record<Nivel, string>;
  };
  motivos: (motivo: Motivo) => string;
}

const segundos = (ms: number, idioma: Idioma) =>
  `${(ms / 1000).toLocaleString(idioma, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} s`;

export const TEXTOS_EVALUACION: Record<Idioma, TextosEvaluacion> = {
  es: {
    etiqueta: "Antes de probar",
    titulo: "Evaluá tu computadora",
    intro:
      "Un clic: bajamos los modelos (una sola vez), transcribimos y traducimos un audio de muestra y medimos cuánto tarda tu placa de video. Con eso te recomendamos cómo usarla y te dejamos elegido el nivel de velocidad.",
    pasos: [
      "Detectar la placa de video",
      "Descargar los modelos (Whisper y Bergamot), una sola vez",
      "Transcribir un audio de muestra y medir",
      "Traducir y medir",
    ],
    evaluar: "Evaluar mi computadora",
    reevaluar: "Volver a evaluar",
    detectando: "Detectando tu placa de video…",
    midiendoWhisper: (actual, total) =>
      `Midiendo Whisper: pasada ${String(actual)} de ${String(total)}…`,
    midiendoTraduccion: (idioma) => `Midiendo la traducción a ${idioma}…`,
    placa: "Placa de video",
    placaSinNombre: "el navegador no informa el modelo",
    f16: "Soporte de 16 bits (f16)",
    si: "Sí",
    no: "No",
    version: "Whisper",
    versiones: { fp16: "Sin comprimir (16 bits)", q4: "Comprimido (4 bits)" },
    pasada: "Una pasada de Whisper",
    traduccion: "Traducción (Bergamot)",
    porIdioma: "por idioma",
    recomendado: "Recomendado para tu computadora",
    porQue: "Por qué",
    nube: "Tu computadora no alcanza para transcribir en vivo por sí sola. Podés usar la transcripción en la nube:",
    irALaNube: "Probarla en la portada →",
    gemma:
      "Tu placa tendría margen para TranslateGemma (traducción de más calidad), pero todavía no está incluido en esta versión: por ahora se traduce con Bergamot.",
    barra: {
      titulo: "Nivel de velocidad",
      ayuda: "Cuánto trabajo le pedís a tu placa. Más nivel, el texto aparece antes.",
      sinEvaluar: "Todavía no evaluaste tu computadora: empezamos en Equilibrado.",
      recomendado: "Recomendado",
      masExigente:
        "Es más exigente que lo recomendado para tu placa: si el texto se atrasa, bajá un nivel.",
      nombres: { 1: "Ahorro", 2: "Equilibrado", 3: "Rápido", 4: "Máximo" },
      descripciones: {
        1: "Frases completas: el texto aparece al terminar cada frase. Es lo que menos le exige a tu placa.",
        2: "Texto provisorio cada ~2 s mientras hablás.",
        3: "Texto provisorio cada ~1 s: casi instantáneo.",
        4: "Lo más seguido que dé tu placa. La exige al máximo.",
      },
    },
    motivos: (motivo) => {
      switch (motivo.codigo) {
        case "sin-webgpu":
          return "Este navegador o esta computadora no tiene WebGPU, que hace falta para correr Whisper en tu placa.";
        case "f16-sin-comprimir":
          return "Tu placa soporta 16 bits: Whisper corre sin comprimir, con mejor calidad.";
        case "sin-f16-comprimido":
          return "Tu placa no soporta 16 bits: Whisper corre comprimido (4 bits), que rinde bien en equipos más modestos.";
        case "pasada-rapida":
          return `Una pasada de Whisper tarda ${segundos(motivo.pasadaMs, "es")}: alcanza para actualizar el texto muy seguido.`;
        case "pasada-media":
          return `Una pasada de Whisper tarda ${segundos(motivo.pasadaMs, "es")}: el texto provisorio se actualiza cada un par de segundos.`;
        case "pasada-lenta":
          return `Una pasada de Whisper tarda ${segundos(motivo.pasadaMs, "es")}: conviene mostrar frases completas para que no se acumule cola.`;
        case "pasada-muy-lenta":
          return `Una pasada de Whisper tarda ${segundos(motivo.pasadaMs, "es")}: es más de lo que dura una frase.`;
        case "no-llega-en-vivo":
          return `Con ${segundos(motivo.pasadaMs, "es")} por pasada el texto se atrasaría más y más, incluso con frases completas.`;
        case "margen-para-gemma":
          return "Tu placa es rápida y tiene 16 bits: tendría margen para un traductor de más calidad.";
      }
    },
  },
  en: {
    etiqueta: "Before you try",
    titulo: "Check your computer",
    intro:
      "One click: we download the models (only once), transcribe and translate a sample audio and measure how long your graphics card takes. With that we recommend how to use it and pick the speed level for you.",
    pasos: [
      "Detect the graphics card",
      "Download the models (Whisper and Bergamot), only once",
      "Transcribe a sample audio and measure",
      "Translate and measure",
    ],
    evaluar: "Check my computer",
    reevaluar: "Check again",
    detectando: "Detecting your graphics card…",
    midiendoWhisper: (actual, total) =>
      `Measuring Whisper: pass ${String(actual)} of ${String(total)}…`,
    midiendoTraduccion: (idioma) => `Measuring translation to ${idioma}…`,
    placa: "Graphics card",
    placaSinNombre: "the browser does not report the model",
    f16: "16-bit support (f16)",
    si: "Yes",
    no: "No",
    version: "Whisper",
    versiones: { fp16: "Uncompressed (16-bit)", q4: "Compressed (4-bit)" },
    pasada: "One Whisper pass",
    traduccion: "Translation (Bergamot)",
    porIdioma: "per language",
    recomendado: "Recommended for your computer",
    porQue: "Why",
    nube: "Your computer can't transcribe live on its own. You can use cloud transcription:",
    irALaNube: "Try it on the home page →",
    gemma:
      "Your card would have room for TranslateGemma (higher-quality translation), but it is not included in this version yet: for now translation uses Bergamot.",
    barra: {
      titulo: "Speed level",
      ayuda:
        "How much work you ask of your card. The higher the level, the sooner the text shows up.",
      sinEvaluar: "You haven't checked your computer yet: we start at Balanced.",
      recomendado: "Recommended",
      masExigente:
        "This is more demanding than recommended for your card: if the text falls behind, lower the level.",
      nombres: { 1: "Saver", 2: "Balanced", 3: "Fast", 4: "Maximum" },
      descripciones: {
        1: "Full sentences: text appears when each sentence ends. The lightest on your card.",
        2: "Draft text every ~2 s while you speak.",
        3: "Draft text every ~1 s: almost instant.",
        4: "As often as your card can. It pushes it to the limit.",
      },
    },
    motivos: (motivo) => {
      switch (motivo.codigo) {
        case "sin-webgpu":
          return "This browser or computer has no WebGPU, which is needed to run Whisper on your card.";
        case "f16-sin-comprimir":
          return "Your card supports 16-bit: Whisper runs uncompressed, with better quality.";
        case "sin-f16-comprimido":
          return "Your card doesn't support 16-bit: Whisper runs compressed (4-bit), which works well on more modest machines.";
        case "pasada-rapida":
          return `One Whisper pass takes ${segundos(motivo.pasadaMs, "en")}: fast enough to refresh the text very often.`;
        case "pasada-media":
          return `One Whisper pass takes ${segundos(motivo.pasadaMs, "en")}: the draft text refreshes every couple of seconds.`;
        case "pasada-lenta":
          return `One Whisper pass takes ${segundos(motivo.pasadaMs, "en")}: showing full sentences avoids a growing queue.`;
        case "pasada-muy-lenta":
          return `One Whisper pass takes ${segundos(motivo.pasadaMs, "en")}: longer than a sentence lasts.`;
        case "no-llega-en-vivo":
          return `At ${segundos(motivo.pasadaMs, "en")} per pass the text would fall further and further behind, even with full sentences.`;
        case "margen-para-gemma":
          return "Your card is fast and has 16-bit: it would have room for a higher-quality translator.";
      }
    },
  },
  pt: {
    etiqueta: "Antes de testar",
    titulo: "Avalie o seu computador",
    intro:
      "Um clique: baixamos os modelos (uma única vez), transcrevemos e traduzimos um áudio de exemplo e medimos quanto tempo a sua placa de vídeo leva. Com isso recomendamos como usá-la e já deixamos escolhido o nível de velocidade.",
    pasos: [
      "Detectar a placa de vídeo",
      "Baixar os modelos (Whisper e Bergamot), uma única vez",
      "Transcrever um áudio de exemplo e medir",
      "Traduzir e medir",
    ],
    evaluar: "Avaliar o meu computador",
    reevaluar: "Avaliar de novo",
    detectando: "Detectando a sua placa de vídeo…",
    midiendoWhisper: (actual, total) =>
      `Medindo o Whisper: passada ${String(actual)} de ${String(total)}…`,
    midiendoTraduccion: (idioma) => `Medindo a tradução para ${idioma}…`,
    placa: "Placa de vídeo",
    placaSinNombre: "o navegador não informa o modelo",
    f16: "Suporte a 16 bits (f16)",
    si: "Sim",
    no: "Não",
    version: "Whisper",
    versiones: { fp16: "Sem compressão (16 bits)", q4: "Comprimido (4 bits)" },
    pasada: "Uma passada do Whisper",
    traduccion: "Tradução (Bergamot)",
    porIdioma: "por idioma",
    recomendado: "Recomendado para o seu computador",
    porQue: "Por quê",
    nube: "O seu computador não consegue transcrever ao vivo sozinho. Você pode usar a transcrição na nuvem:",
    irALaNube: "Testar na página inicial →",
    gemma:
      "A sua placa teria margem para o TranslateGemma (tradução de mais qualidade), mas ele ainda não está incluído nesta versão: por enquanto a tradução usa o Bergamot.",
    barra: {
      titulo: "Nível de velocidade",
      ayuda:
        "Quanto trabalho você pede à sua placa. Quanto maior o nível, mais cedo o texto aparece.",
      sinEvaluar: "Você ainda não avaliou o seu computador: começamos em Equilibrado.",
      recomendado: "Recomendado",
      masExigente:
        "É mais exigente do que o recomendado para a sua placa: se o texto atrasar, baixe um nível.",
      nombres: { 1: "Economia", 2: "Equilibrado", 3: "Rápido", 4: "Máximo" },
      descripciones: {
        1: "Frases completas: o texto aparece quando cada frase termina. É o que menos exige da sua placa.",
        2: "Texto provisório a cada ~2 s enquanto você fala.",
        3: "Texto provisório a cada ~1 s: quase instantâneo.",
        4: "O mais seguido que a sua placa aguentar. Exige o máximo dela.",
      },
    },
    motivos: (motivo) => {
      switch (motivo.codigo) {
        case "sin-webgpu":
          return "Este navegador ou computador não tem WebGPU, necessário para rodar o Whisper na sua placa.";
        case "f16-sin-comprimir":
          return "A sua placa suporta 16 bits: o Whisper roda sem compressão, com melhor qualidade.";
        case "sin-f16-comprimido":
          return "A sua placa não suporta 16 bits: o Whisper roda comprimido (4 bits), que rende bem em equipamentos mais modestos.";
        case "pasada-rapida":
          return `Uma passada do Whisper leva ${segundos(motivo.pasadaMs, "pt")}: dá para atualizar o texto bem seguido.`;
        case "pasada-media":
          return `Uma passada do Whisper leva ${segundos(motivo.pasadaMs, "pt")}: o texto provisório se atualiza a cada par de segundos.`;
        case "pasada-lenta":
          return `Uma passada do Whisper leva ${segundos(motivo.pasadaMs, "pt")}: convém mostrar frases completas para não acumular fila.`;
        case "pasada-muy-lenta":
          return `Uma passada do Whisper leva ${segundos(motivo.pasadaMs, "pt")}: mais do que dura uma frase.`;
        case "no-llega-en-vivo":
          return `Com ${segundos(motivo.pasadaMs, "pt")} por passada o texto ficaria cada vez mais atrasado, mesmo com frases completas.`;
        case "margen-para-gemma":
          return "A sua placa é rápida e tem 16 bits: teria margem para um tradutor de mais qualidade.";
      }
    },
  },
};

export { segundos as formatearSegundos };
