import type { Idioma } from "@nativox/compartido/contratos";

export const TEXTOS_MARCO: Record<
  Idioma,
  {
    queEs: string;
    comoFunciona: string;
    comparacion: string;
    creadoPor: string;
    proyecto: string;
    idiomas: string;
  }
> = {
  es: {
    queEs: "Qué es",
    comoFunciona: "Cómo funciona",
    comparacion: "Comparación",
    creadoPor: "Creado por",
    proyecto: "Proyecto open source para la Vibeathon de Nerdearla 2026.",
    idiomas: "Idioma de la página",
  },
  en: {
    queEs: "What it is",
    comoFunciona: "How it works",
    comparacion: "Comparison",
    creadoPor: "Created by",
    proyecto: "Open source project for the Nerdearla 2026 Vibeathon.",
    idiomas: "Page language",
  },
  pt: {
    queEs: "O que é",
    comoFunciona: "Como funciona",
    comparacion: "Comparação",
    creadoPor: "Criado por",
    proyecto: "Projeto open source para a Vibeathon da Nerdearla 2026.",
    idiomas: "Idioma da página",
  },
};
