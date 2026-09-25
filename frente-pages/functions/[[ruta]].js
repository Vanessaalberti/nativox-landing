// Reenvía todo pedido al Worker `nativox-landing` (el sitio de verdad, con sus cupos y Workers AI).
// Existe solo para poder usar un dominio con un único registro CNAME: Pages lo acepta y Workers no.
export function onRequest(contexto) {
  return contexto.env.LANDING.fetch(contexto.request);
}
