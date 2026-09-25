import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const rutaAbsoluta = (ruta: string) => fileURLToPath(new URL(ruta, import.meta.url));

// Los mismos alias que tsconfig.json; también los usa vitest.config.ts.
export const alias = {
  "@navegador": rutaAbsoluta("./navegador"),
  "@nativox": rutaAbsoluta("./navegador/copia-modulos/modulos-nativox"),
  "@compartido": rutaAbsoluta("./navegador/copia-modulos/modulos-nativox/compartido"),
};

// Toda la landing va aislada (en la portada y en "Probar" corren los modelos): en desarrollo
// Vite no lee publico/_headers, así que se replica acá.
const aislamientoEnDesarrollo: Plugin = {
  name: "nativox:aislamiento-en-desarrollo",
  configureServer(servidor) {
    servidor.middlewares.use((_pedido, respuesta, seguir) => {
      respuesta.setHeader("Cross-Origin-Opener-Policy", "same-origin");
      respuesta.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
      seguir();
    });
  },
};

// Bergamot crea su worker y busca su WebAssembly con rutas relativas a su propio archivo, así
// que no se empaqueta: se publica tal cual en /bergamot/ (igual que en la aplicación).
const CARPETA_BERGAMOT = rutaAbsoluta("./node_modules/@browsermt/bergamot-translator/");
const ARCHIVOS_BERGAMOT: Record<string, string> = {
  "translator.js": "text/javascript",
  "worker/translator-worker.js": "text/javascript",
  "worker/bergamot-translator-worker.js": "text/javascript",
  "worker/bergamot-translator-worker.wasm": "application/wasm",
};

const publicarBergamot: Plugin = {
  name: "nativox:publicar-bergamot",
  configureServer(servidor) {
    servidor.middlewares.use("/bergamot/", (pedido, respuesta, seguir) => {
      const archivo = (pedido.url ?? "").replace(/^\//, "").split("?")[0] ?? "";
      const tipo = ARCHIVOS_BERGAMOT[archivo];
      if (!tipo) {
        seguir();
        return;
      }
      respuesta.setHeader("Content-Type", tipo);
      respuesta.end(readFileSync(CARPETA_BERGAMOT + archivo));
    });
  },
  generateBundle() {
    if (this.environment.name !== "client") return;
    for (const archivo of Object.keys(ARCHIVOS_BERGAMOT)) {
      this.emitFile({
        type: "asset",
        fileName: `bergamot/${archivo}`,
        source: readFileSync(CARPETA_BERGAMOT + archivo),
      });
    }
  },
};

// Transformers.js baja el WebAssembly de ONNX Runtime de jsDelivr (y lo guarda en la caché en
// disco), así que la copia que Vite publica nunca se usa. Además pesa 26,9 MB y Cloudflare acepta
// hasta 25 MiB por archivo estático: se saca del build.
const sinWasmDeOnnx: Plugin = {
  name: "nativox:sin-wasm-de-onnx",
  generateBundle(_opciones, paquete) {
    for (const archivo of Object.keys(paquete)) {
      if (/ort-wasm-simd-threaded.*\.wasm$/.test(archivo)) Reflect.deleteProperty(paquete, archivo);
    }
  },
};

export default defineConfig({
  publicDir: "publico",
  resolve: { alias },
  worker: { format: "es" },
  // Transformers.js solo se importa desde el worker: sin esto, Vite lo prepara recién cuando
  // empieza la primera prueba y recarga la página en medio.
  optimizeDeps: { include: ["@huggingface/transformers"] },
  // Tailwind revisa todos los archivos: sin esto, editar un README recarga la página.
  server: { watch: { ignored: ["**/*.md"] } },
  plugins: [
    aislamientoEnDesarrollo,
    publicarBergamot,
    sinWasmDeOnnx,
    tailwindcss(),
    react(),
    // Workers AI solo corre en Cloudflare. Por defecto `npm run dev` no toca la cuenta (ni abre
    // ventanas de inicio de sesión); con NATIVOX_NUBE=1 el binding `AI` se conecta de verdad y hace
    // falta haber corrido `npx wrangler login` antes.
    cloudflare({ remoteBindings: process.env.NATIVOX_NUBE === "1" }),
  ],
});
