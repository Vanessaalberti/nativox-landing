# contratos-landing

Lo que cruza entre el navegador y el Worker de la landing (la prueba en la nube de la portada). Se valida con valibot en los dos lados.

- `wav.ts` — `aWav(muestras, frecuencia)`: el audio que manda la portada (WAV PCM de 16 bits, mono, 16 kHz). El servidor lo valida en `servidor/wav.ts`.
- `nube.ts` — `GET /api/cupos` (`{ restantes, reintentarEnSegundos }`) y `POST /api/transcribir?idioma=es` (WAV en el cuerpo → `{ ok: true, texto, restantes }` o `{ ok: false, codigo, mensaje, reintentarEnSegundos }`).
