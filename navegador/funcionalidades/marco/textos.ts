import type { Idioma } from "@nativox/compartido/contratos";

export const TEXTOS_MARCO: Record<
  Idioma,
  {
    queEs: string;
    comoFunciona: string;
    comparacion: string;
    desplegar: string;
    creadoPor: string;
    proyecto: string;
    idiomas: string;
  }
> = {
  es: {
    queEs: "Qué es",
    comoFunciona: "Cómo funciona",
    comparacion: "Comparación",
    desplegar: "Desplegar",
    creadoPor: "Creado por",
    proyecto: "Proyecto open source para la Vibeathon de Nerdearla 2026.",
    idiomas: "Idioma de la página",
  },
  en: {
    queEs: "What it is",
    comoFunciona: "How it works",
    comparacion: "Comparison",
    desplegar: "Deploy",
    creadoPor: "Created by",
    proyecto: "Open source project for the Nerdearla 2026 Vibeathon.",
    idiomas: "Page language",
  },
  pt: {
    queEs: "O que é",
    comoFunciona: "Como funciona",
    comparacion: "Comparação",
    desplegar: "Implantar",
    creadoPor: "Criado por",
    proyecto: "Projeto open source para a Vibeathon da Nerdearla 2026.",
    idiomas: "Idioma da página",
  },
};
