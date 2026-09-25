# Método de la comparación

- **Audio (hoy):** el guion de prueba de 12 frases con jerga técnica (`comparacion/referencias/guion-prueba.txt`), con 56 términos contando español, inglés y portugués. **Pendiente:** fragmentos de charlas de ediciones anteriores de Nerdearla (con licencia que permita usarlos).
- **Referencia:** el texto del guion + su glosario (después, transcripción revisada a mano de cada charla).
- **Cortado en vivo** (no la toma completa), igual que en un evento.
- **Combinaciones:** Whisper turbo local (comprimido y de 16 bits) + Bergamot; + TranslateGemma; Whisper turbo en Workers AI; con y sin glosario; Gemma 4 E2B como descartado, con el porqué.
- **Medidas:** WER, términos bien escritos, retraso de una palabra, costo por hora de sala y si anda sin internet. Los retrasos locales se miden en una placa sin f16, en una buena y en una mini PC.
- **Resultado:** `comparacion/resultados/*.json`, que la página lee. Hoy se carga a mano desde las mediciones del laboratorio (24/09/2026, placa AMD sin 16 bits) y cada número trae su `fuente`; cuando exista `scripts/informe-calidad` (paso 12) lo va a generar él. Se mide una vez: la página no gasta nada. Lo que no se midió se muestra como "a medir".
