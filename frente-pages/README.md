# frente-pages

Un proyecto de Cloudflare Pages de una sola función que reenvía todos los pedidos al Worker `nativox-landing`.

**Para qué:** usar un dominio propio cuando el proveedor de DNS solo deja crear **un registro CNAME** (sin servidores de nombres NS). Un Worker no acepta un dominio así (exige que el dominio esté en Cloudflare); Pages sí acepta un subdominio con CNAME a `<proyecto>.pages.dev`. El sitio de verdad sigue siendo el Worker: acá no hay contenido.

**Cómo se arma** (una vez, desde el panel de Cloudflare):

1. *Workers y Pages → Crear → Pages → Conectar con Git* → repositorio `nativox-landing`. Nombre del proyecto: `nativox-frente`. Rama: `main`.
2. **Directorio raíz:** `frente-pages`. **Comando de compilación:** vacío. **Directorio de salida:** `publico`.
3. Después del primer deploy: *Settings → Bindings → Add → Service binding*: variable `LANDING`, servicio `nativox-landing`. Volvé a desplegar (*Deployments → Retry*). (Si el `wrangler.jsonc` de esta carpeta ya lo trae, Cloudflare lo toma solo.)
4. *Custom domains → Set up a domain* → `nativox.dev.ar`. Cloudflare te muestra a qué apuntar: en el panel de DNS ponés **CNAME** `nativox.dev.ar` → `nativox-frente.pages.dev`. Hay que agregar el dominio en Pages **antes** de crear el CNAME (si no, da error 522).

**Qué verificar:** que el sitio cargue en el dominio, que `/api/cupos` responda y que las pruebas de la portada sigan contando aparte por dispositivo. Los cupos por IP dependen de que el Worker reciba `CF-Connecting-IP` a través del enlace de servicio: si todas las visitas figuraran con la misma IP, avisar.

**Qué cambia:** cada visita cuenta dos ejecuciones (Pages y Worker) y suma un salto de pocos milisegundos. Conviene apagar la URL `workers.dev` del Worker (*Settings → Domains & Routes*) para que no haya dos orígenes con contadores separados.
