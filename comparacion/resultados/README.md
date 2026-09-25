# resultados

Un JSON por combinación, con el formato que valida la página (`navegador/funcionalidades/comparacion/filas.ts`):

```json
{
  "combinacion": "whisper-q4-bergamot",
  "wer": 0.014,
  "terminos": { "bien": 56, "total": 56 },
  "retrasoSegundos": 5.4,
  "fuente": { "es": "…", "en": "…", "pt": "…" }
}
```

`combinacion` es el `id` de `comparacion/combinaciones.json`; `wer` va de 0 a 1. **Cada medida es opcional:** la que falta la página la muestra como "a medir". `fuente` (en los tres idiomas) dice de dónde sale cada número y se muestra debajo de la tabla.

**Hoy se cargan a mano** desde mediciones propias (24/09/2026, placa AMD sin 16 bits) y cada número trae su `fuente`. **No se inventa ninguna medida:** una combinación que no se probó (Whisper de 16 bits, Workers AI) no tiene archivo y aparece como "a medir".
