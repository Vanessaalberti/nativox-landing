# scripts

TypeScript que Node 24 corre directo (sin compilar).

| Archivo | Qué hace |
| --- | --- |
| `sincronizar-copia.ts` | `npm run sincronizar -- <carpeta>`: copia los módulos y el sistema de diseño desde nativox-app y escribe `SINCRONIZADO_DESDE.md` |
| `verificar-copia.ts` | `npm run verificar-copia`: falla si `navegador/copia-modulos/` se editó a mano |
| `copia.ts` | Lo común a los dos (qué se copia, resúmenes, comparación), con pruebas en `copia.test.ts` |
