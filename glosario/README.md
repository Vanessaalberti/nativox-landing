# glosario

`tecnico.txt` es el glosario técnico general que la portada carga en la transcripción en vivo. Formato (una entrada por línea): `Término`, `Término ~ variante mal escrita, otra` y `término => en: … | pt: …`. **El orden es la prioridad:** los primeros ~50 términos entran en el prompt de Whisper y todos sirven para corregir y para proteger el término al traducir.

**Por qué está en el repositorio y es público:** la corrección y la traducción corren en el navegador de quien visita, así que el glosario viaja en el sitio de todos modos (y el prompt se ve en la red). Además es la misma función que cada organizador usa para su evento (glosario precargado por charla); un glosario general de tecnología no está armado para las frases de una demo. Ocultarlo no se podría y daría más motivos de sospecha que mostrarlo.

**Cómo agregar términos sin romper nada:** la corrección tolera 1 o 2 letras de diferencia, así que un término parecido a una palabra común corrige palabras bien dichas ("transformers" cambiaba "transformar"; "bundler", "bundle"). Reglas: nada que sea palabra común de español, inglés o portugués; ninguna variante que sea una palabra bien escrita ni el plural del término; sin C++ ni C#. Después de tocar el archivo, corré `npm run probar`: `contratos-landing/glosario-tecnico.test.ts` prueba frases comunes que no pueden cambiar (sumá las tuyas).
