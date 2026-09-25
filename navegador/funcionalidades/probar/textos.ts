import type { Idioma } from "@nativox/compartido/contratos";
import type { AvanceDescarga } from "./motor/preparar-modelos";

export const NOMBRES_DE_IDIOMA: Record<Idioma, string> = {
  es: "Español",
  en: "English",
  pt: "Português",
};

interface TextosProbar {
  etiqueta: string;
  titulo: string;
  intro: string;
  primeraVez: string;
  idiomaOriginal: string;
  traducirA: string;
  glosario: string;
  glosarioAyuda: string;
  glosarioDescartado: (renglones: number) => string;
  iniciar: string;
  transcripcion: string;
  vacio: string;
  medidas: string;
  medida: string;
  valor: string;
  wer: string;
  terminos: string;
  retraso: string;
  pasada: string;
  traduccion: string;
  sinReferencia: string;
  borrar: string;
  borrarConfirmar: string;
  borrarListo: (liberado: string) => string;
  avance: Record<AvanceDescarga["etapa"], string>;
}

export const TEXTOS_PROBAR: Record<Idioma, TextosProbar> = {
  es: {
    etiqueta: "04 — Probalo vos",
    titulo: "En tu navegador, gratis",
    intro:
      "Grabá hasta 15 segundos: la transcripción y la traducción corren en tu propia placa de video, así que no cuesta nada ni sale de tu computadora. Te mostramos las mismas medidas de la tabla.",
    primeraVez:
      "La primera vez se descargan los modelos (~0,8 GB de Whisper y ~22 MB por idioma de Bergamot) y quedan guardados en tu navegador. Necesitás Chrome o Edge actualizado con WebGPU.",
    idiomaOriginal: "Idioma que se habla",
    traducirA: "Traducir a",
    glosario: "Glosario (opcional, un término por renglón)",
    glosarioAyuda:
      "Solo palabras o siglas que querés que salgan bien escritas. No pegues acá lo que vas a decir: el modelo lo repetiría.",
    glosarioDescartado: (renglones) =>
      `Ignoramos ${String(renglones)} renglón(es) del glosario por parecer frases, no términos.`,
    iniciar: "Probar en mi computadora →",
    transcripcion: "Transcripción",
    vacio: "Acá aparece lo que se va diciendo.",
    medidas: "Medidas en tu computadora",
    medida: "Medida",
    valor: "Valor",
    wer: "WER",
    terminos: "Términos bien",
    retraso: "Retraso de una frase",
    pasada: "Pasada de Whisper",
    traduccion: "Traducción",
    sinReferencia: "necesita «lo que dijiste»",
    borrar: "Borrar los modelos guardados",
    borrarConfirmar:
      "Se borran los modelos que se guardaron en este navegador. La próxima prueba los vuelve a descargar (~0,8 GB). ¿Seguimos?",
    borrarListo: (liberado) =>
      `Listo: se liberaron ${liberado}. Recargá la página para soltar lo que quedó en memoria.`,
    avance: {
      revisando: "Revisando tu placa de video…",
      whisper: "Descargando Whisper (solo la primera vez)",
      traductor: "Preparando el traductor…",
      gemma: "Descargando TranslateGemma (~2 a 3 GB, solo la primera vez)",
    },
  },
  en: {
    etiqueta: "04 — Try it yourself",
    titulo: "In your browser, for free",
    intro:
      "Record up to 15 seconds: transcription and translation run on your own graphics card, so it costs nothing and never leaves your computer. You get the same measurements as the table.",
    primeraVez:
      "The first time, the models are downloaded (~0.8 GB for Whisper and ~22 MB per language for Bergamot) and stay saved in your browser. You need an up-to-date Chrome or Edge with WebGPU.",
    idiomaOriginal: "Spoken language",
    traducirA: "Translate to",
    glosario: "Glossary (optional, one term per line)",
    glosarioAyuda:
      "Only words or acronyms you want spelled right. Do not paste what you are going to say: the model would repeat it.",
    glosarioDescartado: (renglones) =>
      `We ignored ${String(renglones)} glossary line(s) because they look like sentences, not terms.`,
    iniciar: "Try it on my computer →",
    transcripcion: "Transcription",
    vacio: "What is being said shows up here.",
    medidas: "Measured on your computer",
    medida: "Measurement",
    valor: "Value",
    wer: "WER",
    terminos: "Correct terms",
    retraso: "Delay of a sentence",
    pasada: "Whisper pass",
    traduccion: "Translation",
    sinReferencia: "needs “what you said”",
    borrar: "Delete the saved models",
    borrarConfirmar:
      "The models saved in this browser will be deleted. The next test downloads them again (~0.8 GB). Continue?",
    borrarListo: (liberado) =>
      `Done: ${liberado} freed. Reload the page to release what is still in memory.`,
    avance: {
      revisando: "Checking your graphics card…",
      whisper: "Downloading Whisper (first time only)",
      traductor: "Getting the translator ready…",
      gemma: "Downloading TranslateGemma (~2 to 3 GB, first time only)",
    },
  },
  pt: {
    etiqueta: "04 — Experimente",
    titulo: "No seu navegador, grátis",
    intro:
      "Grave até 15 segundos: a transcrição e a tradução rodam na sua própria placa de vídeo, então não custam nada e não saem do seu computador. Mostramos as mesmas medidas da tabela.",
    primeraVez:
      "Na primeira vez os modelos são baixados (~0,8 GB do Whisper e ~22 MB por idioma do Bergamot) e ficam salvos no seu navegador. Você precisa do Chrome ou Edge atualizado com WebGPU.",
    idiomaOriginal: "Idioma falado",
    traducirA: "Traduzir para",
    glosario: "Glossário (opcional, um termo por linha)",
    glosarioAyuda:
      "Só palavras ou siglas que você quer ver bem escritas. Não cole aqui o que vai dizer: o modelo o repetiria.",
    glosarioDescartado: (renglones) =>
      `Ignoramos ${String(renglones)} linha(s) do glossário por parecerem frases, não termos.`,
    iniciar: "Testar no meu computador →",
    transcripcion: "Transcrição",
    vacio: "O que está sendo dito aparece aqui.",
    medidas: "Medido no seu computador",
    medida: "Medida",
    valor: "Valor",
    wer: "WER",
    terminos: "Termos corretos",
    retraso: "Atraso de uma frase",
    pasada: "Passada do Whisper",
    traduccion: "Tradução",
    sinReferencia: "precisa de “o que você disse”",
    borrar: "Apagar os modelos salvos",
    borrarConfirmar:
      "Os modelos salvos neste navegador serão apagados. O próximo teste os baixa de novo (~0,8 GB). Continuar?",
    borrarListo: (liberado) =>
      `Pronto: ${liberado} liberados. Recarregue a página para soltar o que ficou na memória.`,
    avance: {
      revisando: "Verificando sua placa de vídeo…",
      whisper: "Baixando o Whisper (só na primeira vez)",
      traductor: "Preparando o tradutor…",
      gemma: "Baixando o TranslateGemma (~2 a 3 GB, só na primeira vez)",
    },
  },
};

export function describirAvance(avance: AvanceDescarga, idioma: Idioma): string {
  const detalle = TEXTOS_PROBAR[idioma].avance[avance.etapa];
  return avance.proporcion === null
    ? detalle
    : `${detalle} · ${String(Math.round(avance.proporcion * 100))}%`;
}
