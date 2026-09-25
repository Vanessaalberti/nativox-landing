# Integración continua

| Archivo | Cuándo | Qué hace |
| --- | --- | --- |
| `ci.yml` | Cada PR y cada push a `main` | Instala · `npm run revisar` (formato, lint con límites de import, tipos, pruebas, código muerto, duplicación y `verificar-copia`) · construcción. *Falta sumar secretos (`gitleaks`)* |
