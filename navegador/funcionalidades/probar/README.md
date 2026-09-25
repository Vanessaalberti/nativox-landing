# probar

**Qué cubre:** "Probar en mi computadora": micrófono o archivo → transcripción y traducción en la placa de quien visita, con los módulos copiados de la aplicación (mismo flujo que la sesión en vivo: cortador, Whisper con glosario, texto provisorio, Bergamot). Muestra las medidas de la tabla: WER y términos bien escritos (si se pega "lo que dijiste"), retraso, pasada de Whisper y traducción. Incluye "Borrar los modelos guardados" (libera lo que se descargó en este navegador).

**Prueba en la nube (la portada):** `usePruebaEnLaNube` graba hasta 15 s con el micrófono (`nube/grabadora.ts`), arma el WAV (`contratos-landing/wav.ts`), lo manda al Worker (`nube/cliente-nube.ts`) y, si se pide otra lengua, lo traduce con Bergamot (~22 MB, solo entonces). La cuenta regresiva es `hooks/useLimiteDeTiempo.ts`.

**Estructura:** `motor/` (`preparar-modelos.ts`, `armar-prueba.ts`) · `hooks/usePrueba.ts` · `resumen.ts` (con prueba) · `componentes/` (`PanelPrueba`, `FormularioPrueba`, `MedidasPrueba`) · `textos.ts` · `index.ts`.
