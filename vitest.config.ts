import { defineConfig } from "vitest/config";
import { alias } from "./vite.config.ts";

export default defineConfig({
  resolve: { alias },
  test: {
    include: ["{navegador,scripts,servidor,contratos-landing}/**/*.test.{ts,tsx}"],
    exclude: ["navegador/copia-modulos/**"],
  },
});
