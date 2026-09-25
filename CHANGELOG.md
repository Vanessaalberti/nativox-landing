# Registro de cambios

## [Sin publicar]

- Estructura inicial del proyecto.
- Landing completa en español, inglés y portugués: portada que transcribe con el micrófono de quien visita, "¿Qué es Nativox?", botón "Deploy to Cloudflare" con sus requisitos, "Cómo funciona" (sin guía todavía), comparación leída de `comparacion/` y "Probar en mi computadora" con las medidas de la tabla.
- Copia sincronizada de módulos de la aplicación con verificación en la integración continua.
- La portada transcribe en la nube (Whisper en Workers AI): hasta 15 s por prueba, 3 pruebas por dispositivo cada 24 h (contadas en el servidor), ícono de "detener" y cuenta regresiva mientras graba.
- "Borrar los modelos guardados" en "Probar".
- La franja de la portada es infinita de verdad: la cinta ya no se achica ni deja huecos en pantallas anchas.
