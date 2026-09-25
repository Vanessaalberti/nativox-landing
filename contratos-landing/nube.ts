import * as v from "valibot";

// Lo que cruza entre la portada y el Worker de la landing. Se valida en los dos lados.

export const esquemaCupos = v.object({
  restantes: v.pipe(v.number(), v.integer(), v.minValue(0)),
  reintentarEnSegundos: v.pipe(v.number(), v.minValue(0)),
});

export const esquemaRespuestaTranscripcion = v.variant("ok", [
  v.object({ ok: v.literal(true), texto: v.string(), restantes: v.number() }),
  v.object({
    ok: v.literal(false),
    codigo: v.picklist(["sin-cupo", "audio-invalido", "fallo-del-modelo", "pedido-invalido"]),
    mensaje: v.string(),
    reintentarEnSegundos: v.number(),
  }),
]);

export type Cupos = v.InferOutput<typeof esquemaCupos>;
export type RespuestaTranscripcion = v.InferOutput<typeof esquemaRespuestaTranscripcion>;
