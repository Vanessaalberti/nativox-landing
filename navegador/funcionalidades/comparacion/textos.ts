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
  fuentes: string;
  probaloVos: string;
  enTuNavegador: string;
  probarTexto: string;
  probarBoton: string;
}

export const TEXTOS_COMPARACION: Record<Idioma, TextosComparacion> = {
  es: {
    etiqueta: "03 — Comparación",
    titulo: "Lo que medimos hasta ahora",
    intro:
      "Pasamos un guion técnico de 12 frases (jerga, siglas, números, modismos y frases ambiguas) por cada combinación y medimos lo que importa en vivo: cuántas palabras salen mal, si los términos técnicos quedan bien escritos, cuánto tarda en aparecer cada palabra y cuánto cuesta. Lo que todavía no medimos dice «a medir».",
    metodo:
      "Método: el guion de prueba tiene 56 términos técnicos (contando español, inglés y portugués) y se dice cortado en vivo, no como toma completa, en una placa de video AMD sin soporte de 16 bits. WER = porcentaje de palabras mal contra el texto del guion. Términos bien = cuántos de los 56 quedan igual (o con su traducción fija) después de traducir. Todavía no probamos con charlas reales de Nerdearla. El guion y su glosario están en el repositorio para repetir la prueba.",
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
    pie: "Los resultados se midieron una vez y se publican acá: esta página no gasta nada. Los que corren en la computadora dependen de la placa de video: falta medirlos en una placa con 16 bits y en una mini PC.",
    fuentes: "De dónde sale cada número",
    probaloVos: "Probalo vos",
    enTuNavegador: "En tu navegador, gratis",
    probarTexto:
      "Grabá hasta 15 segundos: la transcripción y la traducción corren en tu propia placa de video, así que no cuesta nada ni sale de tu computadora. Te mostramos las mismas medidas de la tabla.",
    probarBoton: "Probar en mi computadora →",
  },
  en: {
    etiqueta: "03 — Comparison",
    titulo: "What we have measured so far",
    intro:
      "We ran a 12-sentence technical script (jargon, acronyms, numbers, idioms and ambiguous sentences) through each combination and measured what matters live: how many words come out wrong, whether technical terms are spelled right, how long each word takes to appear and how much it costs. Whatever we have not measured yet says “to be measured”.",
    metodo:
      "Method: the test script has 56 technical terms (counting Spanish, English and Portuguese) and is spoken cut live, not as a full take, on an AMD graphics card without 16-bit support. WER = percentage of wrong words against the script text. Correct terms = how many of the 56 stay the same (or with their fixed translation) after translating. We have not tested with real Nerdearla talks yet. The script and its glossary are in the repository so the test can be repeated.",
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
    pie: "Results were measured once and published here: this page costs nothing. The ones that run on the computer depend on the graphics card: they still need to be measured on a card with 16-bit support and on a mini PC.",
    fuentes: "Where each number comes from",
    probaloVos: "Try it yourself",
    enTuNavegador: "In your browser, for free",
    probarTexto:
      "Record up to 15 seconds: transcription and translation run on your own graphics card, so it costs nothing and never leaves your computer. You get the same measurements as the table.",
    probarBoton: "Try it on my computer →",
  },
  pt: {
    etiqueta: "03 — Comparação",
    titulo: "O que medimos até agora",
    intro:
      "Passamos um roteiro técnico de 12 frases (jargão, siglas, números, expressões e frases ambíguas) por cada combinação e medimos o que importa ao vivo: quantas palavras saem erradas, se os termos técnicos ficam bem escritos, quanto demora para cada palavra aparecer e quanto custa. O que ainda não medimos diz «a medir».",
    metodo:
      "Método: o roteiro de teste tem 56 termos técnicos (contando espanhol, inglês e português) e é dito cortado ao vivo, não como gravação completa, em uma placa de vídeo AMD sem suporte a 16 bits. WER = porcentagem de palavras erradas contra o texto do roteiro. Termos corretos = quantos dos 56 ficam iguais (ou com a tradução fixa) depois de traduzir. Ainda não testamos com palestras reais da Nerdearla. O roteiro e o glossário estão no repositório para repetir o teste.",
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
    pie: "Os resultados foram medidos uma vez e publicados aqui: esta página não gasta nada. Os que rodam no computador dependem da placa de vídeo: ainda falta medi-los em uma placa com 16 bits e em um mini PC.",
    fuentes: "De onde sai cada número",
    probaloVos: "Experimente",
    enTuNavegador: "No seu navegador, grátis",
    probarTexto:
      "Grave até 15 segundos: a transcrição e a tradução rodam na sua própria placa de vídeo, então não custam nada e não saem do seu computador. Mostramos as mesmas medidas da tabela.",
    probarBoton: "Testar no meu computador →",
  },
};
