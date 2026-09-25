# como-funciona

**Qué cubre:** la guía de instalación (`/como-funciona`). Primero un texto de qué es: sin ninguna API key, con modelos que corren en tu computadora (Whisper y Bergamot o TranslateGemma), y que con un clic en «Deploy to Cloudflare» se copia el repositorio y se despliega, sin clonar ni instalar nada y con mucho para personalizar. Después los tres pasos, en una línea de tiempo en zigzag (los impares a la izquierda, los pares a la derecha) sobre una línea central: desplegar la instancia (con el mismo botón de la portada), hacer el deploy en Cloudflare y configurar el evento. Ocupa todo el ancho, como la portada y "Probar".

**Qué NO hace:** el paso a paso literal de Cloudflare: eso lo ve cada persona cuando entra a su cuenta, y la página no lo copia. Todavía no lleva capturas de pantalla.

**Estructura:** `ComoFunciona.tsx` · `textos.ts` (ES/EN/PT) · `index.ts`. El botón de deploy le llega por `despliegue` desde la ruta (una funcionalidad no importa otra).
