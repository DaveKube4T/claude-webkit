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

  const { data: persona } = await supabaseAdmin
    .from("personas")
    .select("nombre, telegram_chat_id")
    .eq("id", id)
    .maybeSingle();

  if (!persona) {
    return NextResponse.json({ error: "Persona no encontrada." }, { status: 404 });
  }

  if (!persona.telegram_chat_id) {
    return NextResponse.json(
      {
        error:
          "Esta persona todavía no inició una conversación con el bot de Telegram. Pedile que le escriba /start al bot primero.",
      },
      { status: 409 }
    );
  }

  const url = "https://resonancia-portal.vercel.app/miembro/perfil";
  const texto = `Hola ${persona.nombre} 👋 Somos el equipo de Resonancia. Nos falta completar algunos datos de tu perfil. ¿Nos ayudás a completarlos acá? ${url}`;

  try {
    await enviarMensajeTelegram(persona.telegram_chat_id, texto);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "No se pudo enviar el mensaje." },
      { status: 502 }
    );
  }

  await supabaseAdmin.from("logs").insert({
    usuario: sesion.usuarioId,
    rol: sesion.rol,
    accion: "recordar_perfil_telegram",
    target_id: id,
  });

  return NextResponse.json({ ok: true });
}
