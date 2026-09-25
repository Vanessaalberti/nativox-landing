# comparacion — datos de la comparación

| Archivo o carpeta | Qué tiene |
| --- | --- |
| `combinaciones.json` | Las filas de la tabla: nombre en los tres idiomas, si usa glosario, costo por hora de sala, si anda sin internet y una nota (por ejemplo, por qué se descartó) |
| `resultados/` | Lo medido de cada combinación (JSON), generado con el script de la aplicación (`scripts/informe-calidad`). Lo que no está acá, la página lo muestra como "a medir" |
| `charlas/` | Lista de charlas usadas (link, fragmento, idioma, licencia) |
| `referencias/` | Transcripción revisada y glosario de cada fragmento |

La página valida los archivos al construirse: uno roto hace fallar la construcción en lugar de publicar una tabla equivocada. Método: `documentacion/metodo-comparacion.md`.
