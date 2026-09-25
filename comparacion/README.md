# comparacion — datos de la comparación

| Archivo o carpeta | Qué tiene |
| --- | --- |
| `combinaciones.json` | Las filas de la tabla: nombre en los tres idiomas, si usa glosario, costo por hora de sala, si anda sin internet y una nota (por ejemplo, por qué se descartó) |
| `resultados/` | Lo medido de cada combinación (JSON), con la fuente de cada número. Se carga a mano desde mediciones propias. Lo que no está acá, la página lo muestra como "a medir" |
| `charlas/` | Lista de charlas reales usadas (todavía ninguna) |
| `referencias/` | El guion de prueba y su glosario (56 términos); después, la transcripción revisada de cada charla |

La página valida los archivos en el build: uno roto hace fallar el build en lugar de publicar una tabla equivocada. Método: `documentacion/metodo-comparacion.md`.
