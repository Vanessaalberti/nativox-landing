# inicio

**Qué cubre:** la portada de la maqueta (titular, radar con el badge cruzado del micrófono, columna "Transcripción en vivo" con sus dos selectores, barra inferior y franja con marquesina) y la sección "¿Qué es Nativox?". El botón "Iniciar transcripción" escucha hasta 15 s (el ícono pasa a "detener" y abajo corre la cuenta regresiva) y muestra los subtítulos a medida que llegan de Whisper en Workers AI, o su traducción; el texto provisorio se ve casi transparente; la ruta le pasa la prueba en la nube de `probar`. Abajo dice cuántas pruebas quedan. En reposo muestra el texto de ejemplo de la maqueta. La franja de abajo es una cinta de dos mitades iguales, más anchas que cualquier pantalla, que se mueve en la placa de video.

**Cambio respecto de la maqueta:** el selector "Modelo" (Whisper / Gemini / Local) pasó a "Mostrar en" (el original o una traducción): Gemini quedó descartado y Whisper corre siempre en local.

**Estructura:** `componentes/` (`Portada`, `Dial`, `PanelEnVivo`, `Desplegable`, `Franja`, `QueEs`) · `textos.ts` (ES/EN/PT) · `index.ts`.
