# copia-modulos — copia sincronizada de la aplicación

**No se edita a mano.** Se actualiza con `npm run sincronizar -- <carpeta de nativox-app>`, que copia desde la aplicación y escribe `modulos-nativox/SINCRONIZADO_DESDE.md` (commit de origen, fecha y el SHA-256 de cada archivo). `npm run verificar-copia` (parte de `npm run revisar` y de la integración continua) falla si algo se editó, falta o sobra.

Se copia (sin las pruebas, que usan `muestras/` de la aplicación):

- `compartido/`: `contratos`, `distancia-edicion`, `glosario`, `metricas`
- `navegador/modulos/`: `captura-audio`, `cortador-audio`, `evaluar-equipo`, `flujo-subtitulos`, `modelos-compartidos`, `transcripcion`, `traduccion`
- `navegador/interfaz/`: `sistema-diseno`, `subtitulos`

Se importa con el alias `@nativox/…`; los módulos copiados importan `@compartido/…`, que apunta a la copia.
