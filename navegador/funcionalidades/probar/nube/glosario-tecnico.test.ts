import { describe, expect, it } from "vitest";
import { armarPromptWhisper, corregirTranscripcion } from "@nativox/compartido/glosario";
import { GLOSARIO_TECNICO } from "./glosario-tecnico";

const corregir = (texto: string) => corregirTranscripcion(texto, GLOSARIO_TECNICO).texto;

describe("glosario técnico de la portada", () => {
  it("es amplio", () => {
    expect(GLOSARIO_TECNICO.length).toBeGreaterThan(300);
  });

  it("arregla lo que Whisper suele escribir mal", () => {
    expect(corregir("Hoy en nerd earla hablamos de cloud flare y de cuber netes.")).toBe(
      "Hoy en Nerdearla hablamos de Cloudflare y de Kubernetes.",
    );
    expect(corregir("Abrí un pul request en git hub y hacemos roll back si falla.")).toBe(
      "Abrí un pull request en GitHub y hacemos rollback si falla.",
    );
    expect(corregir("Usamos type script con web socket y post gres SQL.")).toBe(
      "Usamos TypeScript con WebSocket y PostgreSQL.",
    );
  });

  // Frases comunes que tienen que quedar EXACTAMENTE igual: el glosario no puede corregir palabras
  // bien dichas (la corrección tolera 1 o 2 letras de diferencia).
  it.each([
    "Las redes sociales cambiaron la forma en que nos comunicamos.",
    "Se llama Ana y trabaja con la escala de la empresa, en un spa de la costa.",
    "La meta del proyecto es que el astro brille; el prisma refracta la luz.",
    "Hoy vamos a hablar sobre cómo la tecnología puede transformar la experiencia de una conferencia.",
    "Los pandas comen bambú y el cursor del mouse se movió hacia la derecha.",
    "The main thing is that we all pay attention to the queue before the release.",
    "Ela disse que a comunidade precisa de mais tempo para revisar os números.",
    "Este es un ejemplo de despliegue en producción con contenedores y observabilidad.",
    "Los agentes de inteligencia artificial pueden ayudar con la inferencia y la latencia.",
    "Me gusta el café con leche y la música clásica; el elixir de la vida es la paciencia.",
    "El lunes por la mañana tenemos una reunión con el equipo de ventas para revisar los números.",
    "El comité decidió que el bundle de la semana pasada era un desafío para el equipo de desarrollo.",
    "Vamos a transformar la manera de trabajar, a revisar el código y a probar el linde de la propuesta.",
    "La reunión de la mañana terminó temprano; el ingeniero explicó cómo mejorar el rendimiento del sistema.",
    "Por favor, mandame el archivo por correo y decime si necesitás que lo revise otra persona del equipo.",
    "Nuestra empresa tiene clientes en toda América Latina y estamos abriendo oficinas nuevas este año.",
    "Yesterday the team decided to refactor the module, improve the tests and write better documentation.",
    "A gente vai lançar o produto na segunda-feira e precisa de todos os detalhes até sexta.",
    "El presupuesto de este año incluye capacitación, nuevos equipos y un espacio para la comunidad.",
    "Necesito que reinicies el servidor y me avises cuando termine el proceso de la tarde.",
  ])("no toca una frase común: %s", (frase) => {
    expect(corregir(frase)).toBe(frase);
  });

  it("los términos más importantes entran en el prompt de Whisper", () => {
    const prompt = armarPromptWhisper(GLOSARIO_TECNICO, "");
    for (const termino of ["Nerdearla", "Cloudflare", "Kubernetes", "GitHub", "pull request"]) {
      expect(prompt).toContain(termino);
    }
  });
});
