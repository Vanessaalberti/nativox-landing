// Cada dispositivo se reconoce con una cookie que pone el servidor (HttpOnly: la página no la
// puede leer ni cambiar). Si se borra, el tope por IP sigue cortando.
const NOMBRE = "nativox_dispositivo";
const UN_ANIO = 365 * 24 * 60 * 60;
const FORMATO_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export function leerDispositivo(pedido: Request): { id: string; cookieNueva: string | null } {
  const cookies = pedido.headers.get("Cookie") ?? "";
  const guardado = cookies
    .split(";")
    .map((parte) => parte.trim().split("="))
    .find(([nombre]) => nombre === NOMBRE)?.[1];
  if (guardado && FORMATO_UUID.test(guardado)) return { id: guardado, cookieNueva: null };

  const id = crypto.randomUUID();
  return {
    id,
    cookieNueva: `${NOMBRE}=${id}; Path=/api; Max-Age=${String(UN_ANIO)}; HttpOnly; Secure; SameSite=Strict`,
  };
}
