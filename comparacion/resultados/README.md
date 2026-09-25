# resultados

Un JSON por combinación, con el formato que valida la página (`navegador/funcionalidades/comparacion/filas.ts`):

```json
{ "combinacion": "whisper-q4-bergamot", "wer": 0.084, "terminos": { "bien": 54, "total": 56 }, "retrasoSegundos": 3.8 }
```

`combinacion` es el `id` de `comparacion/combinaciones.json`; `wer` va de 0 a 1. Lo genera el script de la aplicación; no se edita a mano.
