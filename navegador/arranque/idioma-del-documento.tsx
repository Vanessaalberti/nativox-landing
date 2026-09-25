import { useEffect } from "react";
import type { Idioma } from "@nativox/compartido/contratos";

const TITULOS: Record<Idioma, string> = {
  es: "Nativox — Transcripción y traducción en vivo",
  en: "Nativox — Live transcription and translation",
  pt: "Nativox — Transcrição e tradução ao vivo",
};

// El idioma de la página va en <html lang> (lectores de pantalla, traductores del navegador) y en
// el título de la pestaña.
export function IdiomaDelDocumento({
  idioma,
  children,
}: {
  idioma: Idioma;
  children: React.ReactNode;
}) {
  useEffect(() => {
    document.documentElement.lang = idioma;
    document.title = TITULOS[idioma];
  }, [idioma]);
  return children;
}
