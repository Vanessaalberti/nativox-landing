# servidor — el Worker de la landing

Atiende solo la prueba en la nube de la portada; el resto del sitio son archivos estáticos.

| Archivo | Qué hace |
| --- | --- |
| `index.ts` | `GET /api/cupos` (cuántas pruebas le quedan a este dispositivo) y `POST /api/transcribir?idioma=es` (WAV → Whisper large-v3 turbo en Workers AI, con `vad_filter`) |
| `limites.ts` | Cuánto audio: en segundos facturados (60 por prueba): 3 pruebas por dispositivo y 12 por IP cada 24 h, 12.000 s por día para el sitio; `aplicarLimite` y `medirCupo` (ventana móvil, con prueba) |
| `cupos.ts` | Durable Object `Cupos`: uno por dispositivo, por IP y uno para el sitio. `consumir` (segundos del pedido), `consultar` y `devolver` (si Whisper falla, ese audio no cuenta) |
| `dispositivo.ts` | La cookie del dispositivo (HttpOnly, la pone el servidor) |
| `wav.ts` | Valida el WAV de cada fragmento (16 bits, mono, 16 kHz, 12 s como mucho) y mide su duración antes de gastar un pedido, con prueba |
| `registrador.ts` | Registros en JSON, sin audio ni IP |
| `env.d.ts` | Generado con `npm run tipos` (no se edita a mano) |
