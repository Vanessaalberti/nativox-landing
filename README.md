# Nativox — landing

La página pública de Nativox: qué es, cómo funciona, **comparación con charlas reales**, "Probar en mi computadora" y el botón **"Deploy to Cloudflare"**. La despliega Vanessa una vez; los datos de los eventos nunca viven acá (cada organizador despliega su propia instancia de [nativox-app](https://github.com/Vanessaalberti/nativox-app)).

## Páginas

Español en la raíz; inglés y portugués con su prefijo (`/en`, `/pt`).

| Ruta | Qué muestra |
| --- | --- |
| `/` | Portada: el botón "Iniciar transcripción" graba hasta 15 s y los transcribe con **Whisper en Workers AI** (sin descargar ningún modelo). Cada dispositivo tiene 3 pruebas por día. Después, "¿Qué es Nativox?" y el botón de despliegue con sus requisitos |
| `/como-funciona` | La guía de instalación todavía no está escrita: la página lo dice (como en la maqueta) |
| `/comparacion` | Tabla de combinaciones leída de `comparacion/`: lo que todavía no se midió dice "a medir" |
| `/probar` | Audio o micrófono → transcripción y traducción **en la placa de quien visita** (sin límite y sin internet después de la primera vez), con las medidas de la tabla. Incluye "Borrar los modelos guardados" |

**La prueba en la nube de la portada:** el audio (WAV de 15 s como mucho) va a un Worker chico (`servidor/`) que llama a Whisper large-v3 turbo en Workers AI con la cuenta de Vanessa. Los usos se cuentan en el servidor, en Durable Objects: 3 por dispositivo (cookie que pone el servidor) cada 24 h, 12 por IP (por si se borra la cookie) y 800 por día para todo el sitio (~200 min, lo que cubre la cuota diaria gratuita de Workers AI; hay que confirmarlo en la cuenta). Si Whisper falla, la prueba no cuenta. Si se agotan, la portada ofrece "Probar" en la computadora.

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
| `npm run revisar` | Formato · lint (con límites de import) · tipos · pruebas · código muerto · duplicación · que la copia de módulos no se haya editado a mano |
| `npm run construir` | Construcción en `dist/` |
| `npm run sincronizar -- <carpeta de nativox-app>` | Trae de nuevo los módulos de la aplicación (por defecto `../aplicacion`) y actualiza `SINCRONIZADO_DESDE.md` |
| `npm run deploy` | Construye y publica en la cuenta de Cloudflare de Vanessa (crea el Worker, el Durable Object de los cupos y la conexión con Workers AI; sin secretos) |
| `npm run tipos` | Regenera `servidor/env.d.ts` con `wrangler types` (después de tocar `wrangler.jsonc`) |

**La copia de módulos** (`navegador/copia-modulos/modulos-nativox/`) es código de la aplicación: no se edita acá. Los cambios se hacen en nativox-app y se traen con `npm run sincronizar`. La integración continua comprueba cada archivo contra su resumen.

## Licencia

MIT — ver `LICENSE`.
