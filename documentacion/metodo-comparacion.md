# Método de la comparación

- **Audio:** fragmentos de charlas de ediciones anteriores de Nerdearla (con licencia que permita usarlos), en español y en inglés, con jerga técnica.
- **Referencia:** transcripción revisada a mano + glosario de cada charla.
- **Cortado en vivo** (no la toma completa), igual que en un evento.
- **Combinaciones:** Whisper turbo local (comprimido y de 16 bits) + Bergamot; + TranslateGemma; Whisper turbo en Workers AI; con y sin glosario; Gemma 4 E2B como descartado, con el porqué.
- **Medidas:** WER, términos bien escritos, retraso de una palabra, costo por hora de sala y si anda sin internet. Los retrasos locales se miden en una placa sin f16, en una buena y en una mini PC.
- **Resultado:** `comparacion/resultados/*.json`, que la página lee. Se calcula una vez: la página no gasta nada.
