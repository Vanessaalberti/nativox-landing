import boundaries from "eslint-plugin-boundaries";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

// Zonas de la landing (documentacion/arquitectura.md). La copia de módulos es código de la
// aplicación: acá solo se importa, no se revisa (ya lo revisa su repositorio).
const zonas = [
  { type: "arranque", pattern: "navegador/arranque" },
  { type: "rutas", pattern: "navegador/rutas" },
  { type: "funcionalidad", pattern: "navegador/funcionalidades/*", capture: ["nombre"] },
  { type: "segundo-plano", pattern: "navegador/segundo-plano" },
  { type: "copia", pattern: "navegador/copia-modulos" },
  { type: "servidor", pattern: "servidor" },
  { type: "contratos", pattern: "contratos-landing" },
];

const puedeImportar = (desde, hacia) => ({
  from: { element: { type: desde } },
  allow: { to: { element: { types: { anyOf: hacia } } } },
});

const politicas = [
  // Dentro de la propia carpeta, y paquetes externos o del entorno (react, node:).
  { allow: { dependency: { relationship: { to: "internal" } } } },
  { allow: { to: { module: { origin: "external" } } } },
  { allow: { to: { module: { origin: "core" } } } },

  puedeImportar("arranque", ["rutas", "copia"]),
  puedeImportar("rutas", ["funcionalidad", "copia"]),
  puedeImportar("funcionalidad", ["copia", "contratos"]),
  puedeImportar("servidor", ["contratos", "copia"]),
  puedeImportar("contratos", ["copia"]),
  puedeImportar("segundo-plano", ["copia"]),
];

export default defineConfig(
  globalIgnores([
    "node_modules/",
    "dist/",
    ".wrangler/",
    "coverage/",
    "navegador/copia-modulos/",
    "servidor/env.d.ts",
  ]),

  {
    files: ["**/*.{ts,tsx}"],
    extends: [tseslint.configs.strictTypeChecked],
    languageOptions: {
      parserOptions: {
        project: [
          "./configuracion/tsconfig.navegador.json",
          "./configuracion/tsconfig.servidor.json",
          "./configuracion/tsconfig.herramientas.json",
        ],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "no-console": "error",
      "no-empty": "error",
      // "todo" es palabra común en español: solo se marca "TODO:" o "FIXME" al principio.
      "no-warning-comments": ["warn", { terms: ["todo:", "fixme"], location: "start" }],
      "max-lines": ["warn", { max: 300, skipBlankLines: true, skipComments: true }],
      "max-lines-per-function": ["warn", { max: 50, skipBlankLines: true, skipComments: true }],
      "max-params": ["warn", 4],
      complexity: ["warn", 10],
      // `onClick={() => setAbierto(true)}` es la forma habitual en React: no confunde a nadie.
      "@typescript-eslint/no-confusing-void-expression": ["error", { ignoreArrowShorthand: true }],
    },
  },

  {
    // Un componente con su JSX ocupa más líneas que una función: el aviso salta más tarde.
    files: ["**/*.tsx"],
    rules: {
      "max-lines-per-function": ["warn", { max: 120, skipBlankLines: true, skipComments: true }],
    },
  },

  {
    files: ["navegador/**/*.{ts,tsx}", "servidor/**/*.ts", "contratos-landing/**/*.ts"],
    plugins: { boundaries },
    settings: {
      "boundaries/elements": zonas,
      "import/resolver": {
        typescript: {
          project: [
            "./configuracion/tsconfig.navegador.json",
            "./configuracion/tsconfig.servidor.json",
          ],
          noWarnOnMultipleProjects: true,
        },
      },
    },
    rules: {
      "boundaries/dependencies": ["error", { default: "disallow", policies: politicas }],
    },
  },

  {
    // El único archivo que escribe en los registros del Worker.
    files: ["servidor/registrador.ts"],
    rules: { "no-console": "off" },
  },

  {
    files: ["**/*.test.{ts,tsx}"],
    // Los comparadores de Vitest (`expect.any`, `expect.objectContaining`) están tipados como any.
    rules: { "max-lines-per-function": "off", "@typescript-eslint/no-unsafe-assignment": "off" },
  },
);
