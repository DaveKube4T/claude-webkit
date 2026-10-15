import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireSession } from "@/lib/require-session";

export async function GET(req: NextRequest) {
  const { sesion, respuesta } = await requireSession(req, [
    "superadmin",
    "admin",
    "verificador",
  ]);
  if (!sesion) return respuesta;

  const soloAbiertas = new URL(req.url).searchParams.get("resuelto") === "false";

  let query = supabaseAdmin
    .from("mensajes_telegram")
    .select(
      "id, persona_nombre, persona_telegram, mensajes, resuelto, estado_conversacion, creado_en, actualizado_en"
    )
    .order("actualizado_en", { ascending: false })
    .limit(100);

  if (soloAbiertas) query = query.eq("resuelto", false);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ conversaciones: data ?? [] });
}
