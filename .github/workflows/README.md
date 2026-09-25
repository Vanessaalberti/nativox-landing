# CI

| Archivo | Cuándo | Qué hace |
| --- | --- | --- |
| `ci.yml` | Cada PR y cada push a `main` | Instala · `npm run revisar` (formato, lint con límites de import, tipos, pruebas, dead code, duplicación y `verificar-copia`) · build. *Falta sumar secretos (`gitleaks`)* |
