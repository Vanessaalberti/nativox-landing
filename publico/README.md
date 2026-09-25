# publico

- `favicon.svg` — el ícono de Nativox.
- `conferencia.jpg` — la foto de "¿Qué es Nativox?" (de la maqueta).
- `_headers` — aislamiento entre orígenes en todo el sitio (ONNX Runtime lo usa para correr Whisper con varios hilos).

Bergamot se publica en `/bergamot/` desde `node_modules` en el build (ver `vite.config.ts`).

`muestra-equipo.wav` es el audio que usa "Evaluar mi computadora" en "Probar" (~10 s, 16 kHz, mono). Se generó con la voz sintética Microsoft Sabina de Windows, para no depender de una voz humana ni de un audio de terceros; dice una frase con términos técnicos.
