import * as v from "valibot";

// Lo que cruza entre la portada y el Worker de la landing. Se valida en los dos lados.

export const esquemaCupos = v.object({
  // Pruebas que le quedan a este dispositivo (el servidor las cuenta: recargar no las reinicia).
  pruebas: v.pipe(v.number(), v.integer(), v.minValue(0)),
  reintentarEnSegundos: v.pipe(v.number(), v.minValue(0)),
});

export const esquemaRespuestaTranscripcion = v.variant("ok", [
  v.object({
    ok: v.literal(true),
    texto: v.string(),
    palabras: v.array(v.object({ palabra: v.string(), inicio: v.number(), fin: v.number() })),
    pruebas: v.pipe(v.number(), v.integer(), v.minValue(0)),
  }),
  v.object({
    ok: v.literal(false),
    codigo: v.picklist(["sin-cupo", "audio-invalido", "fallo-del-modelo", "pedido-invalido"]),
    mensaje: v.string(),
    reintentarEnSegundos: v.number(),
  }),
]);

export type Cupos = v.InferOutput<typeof esquemaCupos>;
export type RespuestaTranscripcion = v.InferOutput<typeof esquemaRespuestaTranscripcion>;

// Cada prueba de la portada dura hasta 15 s de grabación. Con la pasada provisoria (que vuelve a
// mandar lo que se viene diciendo) cada segundo hablado factura ~3 a 5 s de audio en Workers AI:
// además del conteo de pruebas, el servidor tiene un tope de audio facturado (90 s por prueba) como
// red de seguridad de costos.
export const SEGUNDOS_POR_PRUEBA = 15;
export const CUPO_POR_PRUEBA = 90;
export const PRUEBAS_POR_DISPOSITIVO = 3;
