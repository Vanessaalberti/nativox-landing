# Nativox — landing

La página pública de Nativox: qué es, cómo funciona, **comparación con charlas reales**, "Probar en mi computadora" y el botón **"Deploy to Cloudflare"**. Es un sitio aparte del producto (no es open source, ver *Licencia*) y la despliega Vanessa una vez; los datos de los eventos nunca viven acá (cada organizador despliega su propia instancia de [nativox-app](https://github.com/Vanessaalberti/nativox-app)).

## Páginas

Español en la raíz; inglés y portugués con su prefijo (`/en`, `/pt`).

| Ruta | Qué muestra |
| --- | --- |
| `/` | Portada: el botón "Iniciar transcripción" graba hasta 15 s y los transcribe con **Whisper en Workers AI** (sin descargar ningún modelo). Cada dispositivo tiene 3 pruebas por día. Después, "¿Qué es Nativox?" y el botón de deploy con sus requisitos |
| `/como-funciona` | La guía: sin API keys y con modelos que corren en tu computadora; después, en zigzag, los tres pasos (desplegar tu instancia con un clic, hacer el deploy en Cloudflare y activar `workers.dev`, y configurar tu evento) |
| `/comparacion` | Tabla de combinaciones leída de `comparacion/`: lo que todavía no se midió dice "a medir" |
| `/probar` | Audio o micrófono → transcripción y traducción **en la placa de quien visita** (sin límite y sin internet después de la primera vez), con las medidas de la tabla. Incluye "Evaluar mi computadora" (revisa la placa y la memoria, mide su potencia sin descargar ni grabar nada, recomienda la versión de Whisper y el nivel de velocidad, y deja elegido el nivel en la barra), elegir traductor (Bergamot o TranslateGemma), 4 pruebas por día con el micrófono (aparte de las de la portada) y "Borrar los modelos guardados" |

**La prueba en la nube de la portada:** subtítulos en tiempo real, hasta 15 s por prueba. La portada usa el mismo flujo que la sesión en vivo de la aplicación (cortes en pausas de ~1 s, contexto de audio y de texto, filtro de alucinaciones, micrófono con los filtros de voz del navegador) y manda cada fragmento (Opus en Ogg, ~10 veces más chico que el WAV; WAV si el navegador no lo codifica) a un Worker chico (`servidor/`) que llama a Whisper large-v3 turbo en Workers AI con la cuenta de Vanessa. Usa un **glosario técnico general** (`glosario/tecnico.txt`, ~380 términos: Nerdearla, Cloudflare, Kubernetes, pull request, TypeScript…) para guiar a Whisper, corregir lo transcripto y proteger esos términos al traducir; es público a propósito (ver `glosario/README.md`). Hay dos pasadas: una provisoria cada 1 s, casi invisible, y la confirmada al cortar la frase. Los límites se cuentan en el servidor, en Durable Objects, así que recargar la página no los reinicia: **3 pruebas por dispositivo** (cookie que pone el servidor) cada 24 h, 12 por IP (por si se borra la cookie) y 130 por día para todo el sitio. Cada sesión del navegador lleva un id y todos sus pedidos cuentan como una sola prueba. Como red de seguridad de costos también se cuentan los **segundos de audio facturado** (la pasada provisoria vuelve a mandar lo que se viene diciendo, así que cada segundo hablado factura ~3 a 5): 90 s por prueba, 12.000 s por día para el sitio (~200 min, lo que cubre la cuota diaria gratuita de Workers AI; hay que confirmarlo en la cuenta). Si Whisper falla (se reintenta una vez), ese audio no cuenta. Si se agotan, la portada ofrece "Probar" en la computadora.

**"Probar" es local:** la primera vez se descargan los modelos (~0,8 GB de Whisper y ~22 MB por idioma de Bergamot) y quedan guardados; el audio no sale de la computadora.

## Desarrollo

Necesitás Node 24 (los scripts de `scripts/` son TypeScript y Node los corre directo).

```bash
npm install
npm run dev
```

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | La landing en local, sin cuenta de Cloudflare: la prueba en la nube de la portada responde "no respondió". Para usar Workers AI de verdad: `npx wrangler login` una vez y después `NATIVOX_NUBE=1 npm run dev` (en PowerShell: `$env:NATIVOX_NUBE="1"; npm run dev`) |
| `npm run revisar` | Formato · lint (con límites de import) · tipos · pruebas · dead code · duplicación · que la copia de módulos no se haya editado a mano |
| `npm run construir` | Build en `dist/` |
| `npm run sincronizar -- <carpeta de nativox-app>` | Trae de nuevo los módulos de la aplicación (por defecto `../aplicacion`) y actualiza `SINCRONIZADO_DESDE.md` |
| `npm run deploy` | Construye y publica en la cuenta de Cloudflare de Vanessa (crea el Worker, el Durable Object de los cupos y la conexión con Workers AI; sin secretos) |
| `npm run tipos` | Regenera `servidor/env.d.ts` con `wrangler types` (después de tocar `wrangler.jsonc`) |

**La copia de módulos** (`navegador/copia-modulos/modulos-nativox/`) es código de la aplicación: no se edita acá. Los cambios se hacen en nativox-app y se traen con `npm run sincronizar`. El CI comprueba cada archivo contra su resumen.

## Licencia

**Esta landing no es open source:** es propiedad de su autora y tiene todos los derechos reservados (ver `LICENSE`). Sirve solo para presentar el producto.

El **producto open source es [nativox-app](https://github.com/Vanessaalberti/nativox-app)**, con licencia MIT: es el repositorio que contiene toda la funcionalidad (la aplicación que cada organizador despliega en su propia cuenta de Cloudflare) y el proyecto en sí. La única parte de este repositorio que es MIT es `navegador/copia-modulos/`, porque es una copia de código de nativox-app.
