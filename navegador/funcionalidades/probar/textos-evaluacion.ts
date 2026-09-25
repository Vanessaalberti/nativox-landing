import type { Idioma } from "@nativox/compartido/contratos";
import type { Motivo, Nivel } from "@nativox/navegador/modulos/evaluar-equipo";

interface TextosEvaluacion {
  etiqueta: string;
  titulo: string;
  intro: string;
  pasos: [string, string, string];
  evaluar: string;
  reevaluar: string;
  detectando: string;
  midiendo: string;
  fallo: (paso: string) => string;
  // Lo que se muestra del equipo.
  placa: string;
  placaSinNombre: string;
  webgpu: string;
  f16: string;
  ram: string;
  ramValor: (gb: number) => string;
  nucleos: string;
  buffer: string;
  bufferValor: (mb: number) => string;
  potencia: string;
  pasada: string;
  version: string;
  versiones: { fp16: string; q4: string };
  si: string;
  no: string;
  sinDato: string;
  recomendado: string;
  porQue: string;
  nube: string;
  irALaNube: string;
  gemma: string;
  controles: {
    traductor: string;
    bergamot: string;
    gemma: string;
    gemmaAyuda: string;
    gemmaSinMargen: string;
    intentos: (restantes: number) => string;
    sinIntentos: string;
    quedan: string;
  };
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

export const formatearSegundos = (ms: number, idioma: Idioma) =>
  Number.isFinite(ms)
    ? `${(ms / 1000).toLocaleString(idioma, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} s`
    : "—";

export const TEXTOS_EVALUACION: Record<Idioma, TextosEvaluacion> = {
  es: {
    etiqueta: "Antes de probar",
    titulo: "Evaluá tu computadora",
    intro:
      "Un clic: revisamos tu placa de video y tu memoria y medimos cuánta potencia tiene (unos segundos, sin descargar nada ni usar el micrófono). Con eso te recomendamos cómo usarla y te dejamos elegido el nivel de velocidad.",
    pasos: [
      "Revisar tu placa de video y tu memoria",
      "Medir la potencia de la placa (unos segundos)",
      "Recomendar cómo usarla",
    ],
    evaluar: "Evaluar mi computadora",
    reevaluar: "Volver a evaluar",
    detectando: "Revisando tu placa de video y tu memoria…",
    midiendo: "Midiendo la potencia de tu placa…",
    fallo: (paso) => `Falló en «${paso}»`,
    placa: "Placa de video",
    placaSinNombre: "el navegador no informa el modelo",
    webgpu: "WebGPU",
    f16: "Soporte de 16 bits (f16)",
    ram: "Memoria RAM",
    ramValor: (gb) => `${String(gb)} GB (aprox.)`,
    nucleos: "Núcleos del procesador",
    buffer: "Memoria máxima por modelo",
    bufferValor: (mb) => `${(mb / 1024).toLocaleString("es", { maximumFractionDigits: 1 })} GB`,
    potencia: "Potencia de la placa",
    pasada: "Una pasada de Whisper (estimada)",
    version: "Whisper",
    versiones: { fp16: "Sin comprimir (16 bits)", q4: "Comprimido (4 bits)" },
    si: "Sí",
    no: "No",
    sinDato: "el navegador no lo informa",
    recomendado: "Recomendado para tu computadora",
    porQue: "Por qué",
    nube: "Tu computadora no alcanza para transcribir en vivo por sí sola. Podés usar la transcripción en la nube:",
    irALaNube: "Probarla en la portada →",
    gemma:
      "Tu placa tendría margen para TranslateGemma (traducción de más calidad, pero pesa ~2 a 3 GB y es más lenta que Bergamot). Podés elegirlo abajo, en «Traductor».",
    controles: {
      traductor: "Traductor",
      bergamot: "Bergamot · liviano y al instante",
      gemma: "TranslateGemma · más calidad (~2 a 3 GB)",
      gemmaAyuda:
        "Traduce mejor (números, modismos), pero baja un modelo de 2 a 3 GB y necesita una placa con margen.",
      gemmaSinMargen:
        "Tu placa no tiene el margen recomendado para TranslateGemma: si los subtítulos se atrasan, volvé a Bergamot.",
      intentos: (restantes) =>
        `Te quedan ${String(restantes)} de 4 pruebas con micrófono hoy: una por cada nivel de velocidad, de hasta 15 s cada una.`,
      sinIntentos:
        "Ya usaste tus 4 pruebas con micrófono de hoy. Podés seguir con un archivo de audio o volver mañana.",
      quedan: "Quedan",
    },
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
        case "poca-memoria":
          return `Tu computadora tiene poca memoria (${String(motivo.memoriaGb)} GB): cerrá otras pestañas al usar los modelos.`;
        case "pasada-rapida":
          return `Estimamos ${formatearSegundos(motivo.pasadaMs, "es")} por pasada de Whisper: alcanza para actualizar el texto muy seguido.`;
        case "pasada-media":
          return `Estimamos ${formatearSegundos(motivo.pasadaMs, "es")} por pasada de Whisper: el texto provisorio se actualiza cada un par de segundos.`;
        case "pasada-lenta":
          return `Estimamos ${formatearSegundos(motivo.pasadaMs, "es")} por pasada de Whisper: conviene mostrar frases completas para que no se acumule cola.`;
        case "pasada-muy-lenta":
          return `Estimamos ${formatearSegundos(motivo.pasadaMs, "es")} por pasada de Whisper: es más de lo que dura una frase.`;
        case "no-llega-en-vivo":
          return `Con ${formatearSegundos(motivo.pasadaMs, "es")} por pasada el texto se atrasaría más y más, incluso con frases completas.`;
        case "margen-para-gemma":
          return "Tu placa es potente y tiene 16 bits: tendría margen para un traductor de más calidad.";
        case "gemma-pide-memoria":
          return "TranslateGemma pide un modelo de ~2 GB y tu equipo no tiene memoria de sobra: conviene Bergamot.";
      }
    },
  },
  en: {
    etiqueta: "Before you try",
    titulo: "Check your computer",
    intro:
      "One click: we check your graphics card and your memory and measure how powerful the card is (a few seconds, no downloads and no microphone). With that we recommend how to use it and pick the speed level for you.",
    pasos: [
      "Check your graphics card and memory",
      "Measure the card's power (a few seconds)",
      "Recommend how to use it",
    ],
    evaluar: "Check my computer",
    reevaluar: "Check again",
    detectando: "Checking your graphics card and memory…",
    midiendo: "Measuring your card's power…",
    fallo: (paso) => `Failed at “${paso}”`,
    placa: "Graphics card",
    placaSinNombre: "the browser does not report the model",
    webgpu: "WebGPU",
    f16: "16-bit support (f16)",
    ram: "RAM",
    ramValor: (gb) => `${String(gb)} GB (approx.)`,
    nucleos: "CPU cores",
    buffer: "Max memory per model",
    bufferValor: (mb) => `${(mb / 1024).toLocaleString("en", { maximumFractionDigits: 1 })} GB`,
    potencia: "Card power",
    pasada: "One Whisper pass (estimated)",
    version: "Whisper",
    versiones: { fp16: "Uncompressed (16-bit)", q4: "Compressed (4-bit)" },
    si: "Yes",
    no: "No",
    sinDato: "the browser does not report it",
    recomendado: "Recommended for your computer",
    porQue: "Why",
    nube: "Your computer can't transcribe live on its own. You can use cloud transcription:",
    irALaNube: "Try it on the home page →",
    gemma:
      "Your card would have room for TranslateGemma (higher-quality translation, but it weighs ~2 to 3 GB and is slower than Bergamot). You can pick it below, under “Translator”.",
    controles: {
      traductor: "Translator",
      bergamot: "Bergamot · light and instant",
      gemma: "TranslateGemma · higher quality (~2 to 3 GB)",
      gemmaAyuda:
        "Translates better (numbers, idioms), but downloads a 2 to 3 GB model and needs a card with headroom.",
      gemmaSinMargen:
        "Your card does not have the recommended headroom for TranslateGemma: if the subtitles fall behind, go back to Bergamot.",
      intentos: (restantes) =>
        `You have ${String(restantes)} of 4 microphone tries left today: one for each speed level, up to 15 s each.`,
      sinIntentos:
        "You used your 4 microphone tries for today. You can keep going with an audio file or come back tomorrow.",
      quedan: "Remaining:",
    },
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
        case "poca-memoria":
          return `Your computer has little memory (${String(motivo.memoriaGb)} GB): close other tabs while using the models.`;
        case "pasada-rapida":
          return `We estimate ${formatearSegundos(motivo.pasadaMs, "en")} per Whisper pass: fast enough to refresh the text very often.`;
        case "pasada-media":
          return `We estimate ${formatearSegundos(motivo.pasadaMs, "en")} per Whisper pass: the draft text refreshes every couple of seconds.`;
        case "pasada-lenta":
          return `We estimate ${formatearSegundos(motivo.pasadaMs, "en")} per Whisper pass: showing full sentences avoids a growing queue.`;
        case "pasada-muy-lenta":
          return `We estimate ${formatearSegundos(motivo.pasadaMs, "en")} per Whisper pass: longer than a sentence lasts.`;
        case "no-llega-en-vivo":
          return `At ${formatearSegundos(motivo.pasadaMs, "en")} per pass the text would fall further and further behind, even with full sentences.`;
        case "margen-para-gemma":
          return "Your card is powerful and has 16-bit: it would have room for a higher-quality translator.";
        case "gemma-pide-memoria":
          return "TranslateGemma needs a ~2 GB model and your machine has no memory to spare: Bergamot is the better fit.";
      }
    },
  },
  pt: {
    etiqueta: "Antes de testar",
    titulo: "Avalie o seu computador",
    intro:
      "Um clique: verificamos a sua placa de vídeo e a sua memória e medimos quanta potência ela tem (alguns segundos, sem baixar nada e sem usar o microfone). Com isso recomendamos como usá-la e já deixamos escolhido o nível de velocidade.",
    pasos: [
      "Verificar a sua placa de vídeo e a memória",
      "Medir a potência da placa (alguns segundos)",
      "Recomendar como usá-la",
    ],
    evaluar: "Avaliar o meu computador",
    reevaluar: "Avaliar de novo",
    detectando: "Verificando a sua placa de vídeo e a memória…",
    midiendo: "Medindo a potência da sua placa…",
    fallo: (paso) => `Falhou em “${paso}”`,
    placa: "Placa de vídeo",
    placaSinNombre: "o navegador não informa o modelo",
    webgpu: "WebGPU",
    f16: "Suporte a 16 bits (f16)",
    ram: "Memória RAM",
    ramValor: (gb) => `${String(gb)} GB (aprox.)`,
    nucleos: "Núcleos do processador",
    buffer: "Memória máxima por modelo",
    bufferValor: (mb) => `${(mb / 1024).toLocaleString("pt", { maximumFractionDigits: 1 })} GB`,
    potencia: "Potência da placa",
    pasada: "Uma passada do Whisper (estimada)",
    version: "Whisper",
    versiones: { fp16: "Sem compressão (16 bits)", q4: "Comprimido (4 bits)" },
    si: "Sim",
    no: "Não",
    sinDato: "o navegador não informa",
    recomendado: "Recomendado para o seu computador",
    porQue: "Por quê",
    nube: "O seu computador não consegue transcrever ao vivo sozinho. Você pode usar a transcrição na nuvem:",
    irALaNube: "Testar na página inicial →",
    gemma:
      "A sua placa teria margem para o TranslateGemma (tradução de mais qualidade, mas pesa ~2 a 3 GB e é mais lento que o Bergamot). Você pode escolhê-lo abaixo, em “Tradutor”.",
    controles: {
      traductor: "Tradutor",
      bergamot: "Bergamot · leve e instantâneo",
      gemma: "TranslateGemma · mais qualidade (~2 a 3 GB)",
      gemmaAyuda:
        "Traduz melhor (números, expressões), mas baixa um modelo de 2 a 3 GB e precisa de uma placa com folga.",
      gemmaSinMargen:
        "A sua placa não tem a folga recomendada para o TranslateGemma: se as legendas atrasarem, volte ao Bergamot.",
      intentos: (restantes) =>
        `Restam ${String(restantes)} de 4 testes com microfone hoje: um para cada nível de velocidade, de até 15 s cada.`,
      sinIntentos:
        "Você usou seus 4 testes com microfone de hoje. Pode continuar com um arquivo de áudio ou voltar amanhã.",
      quedan: "Restam",
    },
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
        case "poca-memoria":
          return `O seu computador tem pouca memória (${String(motivo.memoriaGb)} GB): feche outras abas ao usar os modelos.`;
        case "pasada-rapida":
          return `Estimamos ${formatearSegundos(motivo.pasadaMs, "pt")} por passada do Whisper: dá para atualizar o texto bem seguido.`;
        case "pasada-media":
          return `Estimamos ${formatearSegundos(motivo.pasadaMs, "pt")} por passada do Whisper: o texto provisório se atualiza a cada par de segundos.`;
        case "pasada-lenta":
          return `Estimamos ${formatearSegundos(motivo.pasadaMs, "pt")} por passada do Whisper: convém mostrar frases completas para não acumular fila.`;
        case "pasada-muy-lenta":
          return `Estimamos ${formatearSegundos(motivo.pasadaMs, "pt")} por passada do Whisper: mais do que dura uma frase.`;
        case "no-llega-en-vivo":
          return `Com ${formatearSegundos(motivo.pasadaMs, "pt")} por passada o texto ficaria cada vez mais atrasado, mesmo com frases completas.`;
        case "margen-para-gemma":
          return "A sua placa é potente e tem 16 bits: teria margem para um tradutor de mais qualidade.";
        case "gemma-pide-memoria":
          return "O TranslateGemma pede um modelo de ~2 GB e o seu equipamento não tem memória de sobra: o Bergamot é mais indicado.";
      }
    },
  },
};
