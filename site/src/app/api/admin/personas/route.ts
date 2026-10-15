import { createHash } from "crypto";
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

  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";

  let query = supabaseAdmin
    .from("personas")
    .select("id, nombre, telegram, mail, telefono, destacado, creada_en")
    .order("creada_en", { ascending: false })
    .limit(200);

  if (q) query = query.or(`nombre.ilike.%${q}%,telegram.ilike.%${q}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ personas: data ?? [] });
}

export async function POST(req: NextRequest) {
  const { sesion, respuesta } = await requireSession(req, [
    "superadmin",
    "admin",
    "verificador",
  ]);
  if (!sesion) return respuesta;

  const body = await req.json().catch(() => null);
  const nombre = typeof body?.nombre === "string" ? body.nombre.trim() : "";
  const telegram = typeof body?.telegram === "string" ? body.telegram.trim() : "";
  const mail = typeof body?.mail === "string" ? body.mail.trim() : "";

  if (!nombre || !telegram) {
    return NextResponse.json(
      { error: "Nombre y Telegram son requeridos." },
      { status: 400 }
    );
  }

  // ID determinístico por hash del telegram (evita duplicados al crear personas).
  const id = createHash("sha1")
    .update("personas:" + telegram.toLowerCase())
    .digest("hex");

  const { error } = await supabaseAdmin
    .from("personas")
    .upsert({ id, nombre, telegram, mail: mail || null }, { onConflict: "id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ id, nombre, telegram });
}
