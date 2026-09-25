# Arquitectura de la landing

React + Vite + Tailwind publicado en Cloudflare, con un Worker chico para la prueba en la nube de la portada (Whisper en Workers AI y los cupos en un Durable Object). Sin base de datos y sin secretos. "Probar" corre en el navegador de quien visita.

| Carpeta | Qué va |
| --- | --- |
| `navegador/arranque/` | Arranque, enrutador (ES en la raíz, `/en`, `/pt`), idioma del documento y estilos propios de la portada |
| `navegador/rutas/` | Páginas finas: arman funcionalidades |
| `navegador/funcionalidades/` | `marco` (encabezado, pie, rutas por idioma), `inicio`, `como-funciona`, `comparacion`, `probar`, `boton-despliegue` |
| `navegador/copia-modulos/modulos-nativox/` | **Copia sincronizada** de la aplicación: módulos de audio, transcripción, traducción, flujo de subtítulos y modelos; `compartido/` (contratos, glosario, métricas) y el sistema de diseño |
| `navegador/segundo-plano/` | El worker de modelos (conecta los mensajes con la copia de `modelos-compartidos`) |
| `servidor/` | El Worker: `GET /api/cupos` y `POST /api/transcribir` (valida el WAV, descuenta el cupo, llama a Whisper) y el Durable Object `Cupos` |
| `contratos-landing/` | Lo que cruza entre la portada y el Worker (formato del WAV y respuestas), validado en los dos lados |
| `comparacion/` | Combinaciones, charlas, referencias y resultados de la comparación |
| `publico/` | Archivos estáticos y `_headers` |
| `scripts/` | Sincronizar y verificar la copia de módulos |

## Reglas

1. Todo en español; los textos visibles también en inglés y portugués.
2. Nunca "Crear evento" acá: los eventos viven en la instancia de cada organizador.
3. `navegador/copia-modulos/` no se edita a mano: se actualiza con `npm run sincronizar`.
4. La comparación sale de `comparacion/`: números calculados, nunca escritos a mano.
5. "Probar" corre en la placa de quien visita: no manda audio a ningún servidor. La portada sí (a Workers AI, fragmento por fragmento), con 15 s como mucho y cupo por dispositivo medido en segundos de audio facturado.

## Límites de import (`eslint-plugin-boundaries`)

`rutas` → `funcionalidades` y la copia (tipos) · `funcionalidades` → la copia y `contratos-landing` · `arranque` → `rutas` y la copia · `segundo-plano` → la copia · `servidor` → `contratos-landing` y la copia. Una funcionalidad no importa a otra: lo que comparten lo junta la ruta (por ejemplo, la portada recibe el encabezado y la transcripción en vivo por parámetro).

**Por qué una copia y no un import:** la aplicación y la landing son repositorios separados (el botón de deploy necesita la aplicación aislada). La copia lleva `SINCRONIZADO_DESDE.md` con el commit de origen y el resumen de cada archivo, y el CI comprueba que no se haya editado a mano.
