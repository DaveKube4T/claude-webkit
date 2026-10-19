import { supabaseAdmin } from "@/lib/supabase";

const LIMITE_MENSAJES_DIARIOS = 150;

function fechaHoyUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function verificarYRegistrarUsoIA(
  personaId: string
): Promise<{ permitido: boolean }> {
  const fecha = fechaHoyUTC();

  const { data: existente } = await supabaseAdmin
    .from("uso_ia_diario")
    .select("mensajes")
    .eq("persona_id", personaId)
    .eq("fecha", fecha)
    .maybeSingle();

  const mensajesHoy = existente?.mensajes ?? 0;

  if (mensajesHoy >= LIMITE_MENSAJES_DIARIOS) {
    return { permitido: false };
  }

  await supabaseAdmin
    .from("uso_ia_diario")
    .upsert(
      { persona_id: personaId, fecha, mensajes: mensajesHoy + 1 },
      { onConflict: "persona_id,fecha" }
    );

  return { permitido: true };
}
