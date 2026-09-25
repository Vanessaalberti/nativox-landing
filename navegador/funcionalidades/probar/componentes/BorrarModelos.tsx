import { useEffect, useState } from "react";
import type { Idioma } from "@nativox/compartido/contratos";
import { borrarGuardados, medirGuardados } from "@nativox/navegador/modulos/modelos-compartidos";
import { TEXTOS_PROBAR } from "../textos";

const megas = (bytes: number) => `${String(Math.round(bytes / 1e6))} MB`;

// Libera lo que "Probar" descargó en este navegador (Whisper, Bergamot, ONNX Runtime).
export function BorrarModelos({
  idioma,
  deshabilitado,
}: {
  idioma: Idioma;
  deshabilitado: boolean;
}) {
  const textos = TEXTOS_PROBAR[idioma];
  const [ocupado, setOcupado] = useState<number | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  useEffect(() => {
    void medirGuardados().then(setOcupado);
  }, []);

  const borrar = async () => {
    if (!window.confirm(textos.borrarConfirmar)) return;
    const resultado = await borrarGuardados();
    setMensaje(
      resultado.ok ? textos.borrarListo(megas(resultado.valor.bytesLiberados)) : resultado.motivo,
    );
    setOcupado(await medirGuardados());
  };

  return (
    <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-ink/60">
      <button
        type="button"
        disabled={deshabilitado || ocupado === 0}
        onClick={() => void borrar()}
        className="underline decoration-ink/30 underline-offset-4 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
      >
        {textos.borrar}
        {ocupado !== null ? ` (${megas(ocupado)})` : ""}
      </button>
      {mensaje && <span role="status">{mensaje}</span>}
    </div>
  );
}
