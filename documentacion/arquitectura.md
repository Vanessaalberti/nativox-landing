# Arquitectura de la landing

| Carpeta | Qué va |
| --- | --- |
| `navegador/arranque/` | Arranque y enrutador |
| `navegador/rutas/` | Páginas finas |
| `navegador/funcionalidades/` | `inicio`, `como-funciona`, `comparacion`, `probar`, `boton-despliegue` |
| `navegador/interfaz/` | Copia del sistema de diseño de la aplicación |
| `navegador/copia-modulos/modulos-nativox/` | **Copia sincronizada** de módulos de la aplicación para "Probar" (audio, transcripción, traducción, flujo de subtítulos, glosario, métricas) |
| `comparacion/` | Charlas, referencias y resultados de la comparación |
| `servidor/` | Sirve el sitio; prueba en la nube opcional con límite por visitante |
| `publico/` | Archivos estáticos |

## Reglas

1. Todo en español; los textos visibles también en inglés y portugués.
2. Nunca "Crear evento" acá: los eventos viven en la instancia de cada organizador.
3. `navegador/copia-modulos/` no se edita a mano: se actualiza con `scripts/sincronizar-copia`.
4. La comparación sale de `comparacion/resultados/`: números calculados, nunca escritos a mano.
5. "Probar" corre en la placa de quien visita: no manda audio a ningún servidor.

**Por qué una copia y no un import:** la aplicación y la landing son repositorios separados (el botón de despliegue necesita la aplicación aislada). La copia lleva un archivo `SINCRONIZADO_DESDE.md` con la versión de origen, y la integración continua comprueba que no se haya editado a mano.
