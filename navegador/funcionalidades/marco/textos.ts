import type { Idioma } from "@nativox/compartido/contratos";

export const TEXTOS_MARCO: Record<
  Idioma,
  {
    queEs: string;
    comoFunciona: string;
    comparacion: string;
    desplegar: string;
    test: string;
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
    test: "Test",
    creadoPor: "Creado por",
    proyecto: "Nativox es open source · Vibeathon de Nerdearla 2026.",
    idiomas: "Idioma de la página",
  },
  en: {
    queEs: "What it is",
    comoFunciona: "How it works",
    comparacion: "Comparison",
    desplegar: "Deploy",
    test: "Test",
    creadoPor: "Created by",
    proyecto: "Nativox is open source · Nerdearla 2026 Vibeathon.",
    idiomas: "Page language",
  },
  pt: {
    queEs: "O que é",
    comoFunciona: "Como funciona",
    comparacion: "Comparação",
    desplegar: "Implantar",
    test: "Teste",
    creadoPor: "Criado por",
    proyecto: "O Nativox é open source · Vibeathon da Nerdearla 2026.",
    idiomas: "Idioma da página",
  },
};
