import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireSession } from "@/lib/require-session";
import { enviarMensajeTelegram } from "@/lib/telegram";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { sesion, respuesta } = await requireSession(req, [
    "superadmin",
    "admin",
    "verificador",
  ]);
  if (!sesion) return respuesta;

  const { id } = await params;

  const { data: compra } = await supabaseAdmin
    .from("compras")
    .select("id, persona_id, paquete")
    .eq("id", id)
    .maybeSingle();

  if (!compra) {
    return NextResponse.json({ error: "Compra no encontrada." }, { status: 404 });
  }

  const { data: persona } = await supabaseAdmin
    .from("personas")
    .select("nombre, telegram_chat_id")
    .eq("id", compra.persona_id)
    .maybeSingle();

  if (!persona?.telegram_chat_id) {
    return NextResponse.json(
      {
        error:
          "Este miembro todavía no inició una conversación con el bot de Telegram. Pedile que le escriba /start al bot primero.",
      },
      { status: 409 }
    );
  }

  const url = `https://resonanciaverificaciones.com/miembro/compra/${id}`;
  const texto = `Hola ${persona.nombre} 👋 Somos el equipo de Resonancia. Necesitamos que nos compartas el comprobante de tu pago para "${compra.paquete}". Podés subirlo acá: ${url}`;

  try {
    await enviarMensajeTelegram(persona.telegram_chat_id, texto);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "No se pudo enviar el mensaje." },
      { status: 502 }
    );
  }

  await supabaseAdmin
    .from("compras")
    .update({ comprobante_solicitado_en: new Date().toISOString() })
    .eq("id", id);

  await supabaseAdmin.from("logs").insert({
    usuario: sesion.usuarioId,
    rol: sesion.rol,
    accion: "pedir_comprobante_telegram",
    target_id: id,
  });

  return NextResponse.json({ ok: true });
}
