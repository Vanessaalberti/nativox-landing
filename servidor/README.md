# servidor — el Worker de la landing

Atiende solo la prueba en la nube de la portada; el resto del sitio son archivos estáticos.

| Archivo | Qué hace |
| --- | --- |
| `index.ts` | `GET /api/cupos` (`{ pruebas }`: cuántas le quedan a este dispositivo) y `POST /api/transcribir?idioma=es` (Opus o WAV → Whisper large-v3 turbo en Workers AI, con `vad_filter`, `initial_prompt` y el horario de cada palabra) |
| `limites.ts` | Dos topes en ventana móvil de 24 h: **pruebas** (3 por dispositivo, 12 por IP, 130 para el sitio; los pedidos con el mismo id de sesión cuentan una sola vez) y **segundos de audio facturado** (90 por prueba, 12.000 por día para el sitio) como red de seguridad. `registrarPrueba`, `aplicarLimite` y `medirCupo`, con prueba |
| `cupos.ts` | Durable Object `Cupos`: uno por dispositivo, por IP y uno para el sitio. `registrarPrueba`, `consumir` (segundos del pedido), `consultar` y sus devoluciones (si Whisper falla, ese audio y la prueba que abrió ese pedido no cuentan) |
| `prueba-local.ts` | `GET /api/cupos-local` y `POST /api/prueba-local`: las 4 pruebas diarias con micrófono de "Probar" (por dispositivo y por IP, sin tope del sitio, aparte de las de la portada). No recibe audio |
| `dispositivo.ts` | La cookie del dispositivo (HttpOnly, la pone el servidor) |
| `audio.ts` | Mide la duración de cada fragmento sin decodificarlo: Opus en Ogg (por la posición de su última página) o WAV; con prueba |
| `wav.ts` | Valida el WAV de cada fragmento (16 bits, mono, 16 kHz, 12 s como mucho) y mide su duración antes de gastar un pedido, con prueba |
| `registrador.ts` | Registros en JSON, sin audio ni IP |
| `env.d.ts` | Generado con `npm run tipos` (no se edita a mano) |
