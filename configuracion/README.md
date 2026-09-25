# configuracion

Proyectos de TypeScript. `tsconfig.json` (en la raíz) tiene las opciones comunes (modo estricto y alias) y los referencia.

| Archivo | Qué revisa |
| --- | --- |
| `tsconfig.navegador.json` | `navegador/` (incluida la copia de módulos) y los resultados de `comparacion/` |
| `tsconfig.herramientas.json` | `vite.config.ts`, `vitest.config.ts`, `scripts/` y las pruebas |

**Alias:** `@navegador/*` → `navegador/*`; `@nativox/*` → la copia de la aplicación (`navegador/copia-modulos/modulos-nativox/*`); `@compartido/*` → el código compartido de esa copia, porque así lo importan los módulos copiados.
