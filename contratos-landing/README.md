# contratos-landing

Lo que cruza entre el navegador y el Worker de la landing (la prueba en la nube de la portada). Se valida con valibot en los dos lados.

- `ogg.ts` — `armarOgg(paquetes, ...)`: junta los paquetes Opus de 20 ms que entrega el codificador de WebCodecs en un archivo Ogg (con su CRC). El servidor mide su duración en `servidor/audio.ts`.
- `nube.ts` también define `esquemaRespuestaPruebaLocal` (`POST /api/prueba-local`) y `PRUEBAS_LOCALES_POR_DISPOSITIVO` (4).
- `wav.ts` — `aWav(muestras, frecuencia)`: el audio que manda la portada (WAV PCM de 16 bits, mono, 16 kHz). El servidor lo valida en `servidor/wav.ts`.
- `nube.ts` — `GET /api/cupos` (`{ pruebas, reintentarEnSegundos }`) y `POST /api/transcribir?idioma=es` (un fragmento Opus en Ogg o WAV en el cuerpo y, en `X-Nativox-Prompt` el prompt codificado y en `X-Nativox-Prueba` el id de la sesión → `{ ok: true, texto, palabras, pruebas }` o `{ ok: false, codigo, mensaje, reintentarEnSegundos }`).
