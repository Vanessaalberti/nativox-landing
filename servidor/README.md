# servidor — el Worker de la landing

Atiende solo la prueba en la nube de la portada; el resto del sitio son archivos estáticos.

| Archivo | Qué hace |
| --- | --- |
| `index.ts` | `GET /api/cupos` (cuántas pruebas le quedan a este dispositivo) y `POST /api/transcribir?idioma=es` (WAV → Whisper large-v3 turbo en Workers AI, con `vad_filter`) |
| `limites.ts` | Cuántas pruebas: 3 por dispositivo y 12 por IP cada 24 h, 800 por día para el sitio; `aplicarLimite` (ventana móvil, con prueba) |
| `cupos.ts` | Durable Object `Cupos`: uno por dispositivo, por IP y uno para el sitio. `consumir`, `consultar` y `devolver` (si Whisper falla, la prueba no cuenta) |
| `dispositivo.ts` | La cookie del dispositivo (HttpOnly, la pone el servidor) |
| `wav.ts` | Valida el WAV (16 bits, mono, 16 kHz, 15 s como mucho) antes de gastar un pedido, con prueba |
| `registrador.ts` | Registros en JSON, sin audio ni IP |
| `env.d.ts` | Generado con `npm run tipos` (no se edita a mano) |
