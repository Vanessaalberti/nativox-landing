import type { Idioma } from "@nativox/compartido/contratos";

interface TextosComparacion {
  etiqueta: string;
  titulo: string;
  intro: string;
  metodo: string;
  columnas: [string, string, string, string, string, string, string];
  si: string;
  no: string;
  aMedir: string;
  pie: string;
  probaloVos: string;
  enTuNavegador: string;
  probarTexto: string;
  probarBoton: string;
}

export const TEXTOS_COMPARACION: Record<Idioma, TextosComparacion> = {
  es: {
    etiqueta: "03 — Comparación",
    titulo: "Probado con charlas reales",
    intro:
      "Pasamos charlas de ediciones anteriores de Nerdearla por cada combinación y medimos lo que importa en vivo: cuántas palabras salen mal, si los términos técnicos quedan bien escritos, cuánto tarda en aparecer cada palabra y cuánto cuesta.",
    metodo:
      "Método: el mismo audio para todos, cortado en vivo (no la toma completa), con y sin glosario. WER = porcentaje de palabras mal contra la transcripción revisada a mano. Los resultados y los audios están en el repositorio para repetir la prueba.",
    columnas: [
      "Transcripción + traducción",
      "Glosario",
      "WER",
      "Términos bien",
      "Retraso de una palabra",
      "Costo por hora de sala",
      "Sin internet",
    ],
    si: "Sí",
    no: "No",
    aMedir: "a medir",
    pie: "Los resultados se calculan una vez y se publican acá: esta página no gasta nada. Los que corren en la computadora dependen de la placa de video: el retraso se mide también en una mini PC.",
    probaloVos: "Probalo vos",
    enTuNavegador: "En tu navegador, gratis",
    probarTexto:
      "Subí un audio o hablá: la transcripción y la traducción corren en tu propia placa de video, así que no cuesta nada ni sale de tu computadora. Te mostramos las mismas medidas de la tabla.",
    probarBoton: "Probar en mi computadora →",
  },
  en: {
    etiqueta: "03 — Comparison",
    titulo: "Tested with real talks",
    intro:
      "We ran talks from previous Nerdearla editions through each combination and measured what matters live: how many words come out wrong, whether technical terms are spelled right, how long each word takes to appear and how much it costs.",
    metodo:
      "Method: the same audio for all, cut live (not the full take), with and without a glossary. WER = percentage of wrong words against the hand-checked transcript. Results and audio files are in the repository so the test can be repeated.",
    columnas: [
      "Transcription + translation",
      "Glossary",
      "WER",
      "Correct terms",
      "Delay of a word",
      "Cost per room hour",
      "Offline",
    ],
    si: "Yes",
    no: "No",
    aMedir: "to be measured",
    pie: "Results are computed once and published here: this page costs nothing. The ones that run on the computer depend on the graphics card: the delay is also measured on a mini PC.",
    probaloVos: "Try it yourself",
    enTuNavegador: "In your browser, for free",
    probarTexto:
      "Upload an audio file or speak: transcription and translation run on your own graphics card, so it costs nothing and never leaves your computer. You get the same measurements as the table.",
    probarBoton: "Try it on my computer →",
  },
  pt: {
    etiqueta: "03 — Comparação",
    titulo: "Testado com palestras reais",
    intro:
      "Passamos palestras de edições anteriores da Nerdearla por cada combinação e medimos o que importa ao vivo: quantas palavras saem erradas, se os termos técnicos ficam bem escritos, quanto demora para cada palavra aparecer e quanto custa.",
    metodo:
      "Método: o mesmo áudio para todos, cortado ao vivo (não a gravação completa), com e sem glossário. WER = porcentagem de palavras erradas contra a transcrição revisada à mão. Os resultados e os áudios estão no repositório para repetir o teste.",
    columnas: [
      "Transcrição + tradução",
      "Glossário",
      "WER",
      "Termos corretos",
      "Atraso de uma palavra",
      "Custo por hora de sala",
      "Sem internet",
    ],
    si: "Sim",
    no: "Não",
    aMedir: "a medir",
    pie: "Os resultados são calculados uma vez e publicados aqui: esta página não gasta nada. Os que rodam no computador dependem da placa de vídeo: o atraso também é medido em um mini PC.",
    probaloVos: "Experimente",
    enTuNavegador: "No seu navegador, grátis",
    probarTexto:
      "Envie um áudio ou fale: a transcrição e a tradução rodam na sua própria placa de vídeo, então não custam nada e não saem do seu computador. Mostramos as mesmas medidas da tabela.",
    probarBoton: "Testar no meu computador →",
  },
};
