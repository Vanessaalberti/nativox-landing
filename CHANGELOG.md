# Changelog

## [Sin publicar]

- Estructura inicial del proyecto.
- Landing completa en español, inglés y portugués: portada que transcribe con el micrófono de quien visita, "¿Qué es Nativox?", botón "Deploy to Cloudflare" con sus requisitos, "Cómo funciona" (sin guía todavía), comparación leída de `comparacion/` y "Probar en mi computadora" con las medidas de la tabla.
- Copia sincronizada de módulos de la aplicación con verificación en el CI.
- La portada muestra subtítulos en tiempo real con Whisper en Workers AI: hasta 15 s por prueba, cortes en pausas de ~1 s con texto provisorio casi invisible y confirmación al cerrar la frase, 3 pruebas por dispositivo cada 24 h contadas en el servidor (recargar la página no las reinicia; el navegador manda un id por sesión) y un tope de audio facturado como red de seguridad, ícono de "detener" y cuenta regresiva.
- Glosario técnico general precargado en la portada (~380 términos), con una prueba que verifica que no corrige frases comunes.
- `npm run dev` ya no toca la cuenta de Cloudflare; para usar Workers AI en local: `NATIVOX_NUBE=1` y un token con permiso de Workers AI.
- El favicon es el isotipo de los cuatro cuadrados naranjas.
- "Borrar los modelos guardados" en "Probar".
- La franja de la portada es infinita de verdad: la cinta ya no se achica ni deja huecos en pantallas anchas.
