import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireSession } from "@/lib/require-session";

const ROLES: Array<"superadmin" | "admin" | "verificador"> = ["superadmin", "admin", "verificador"];

export async function GET(req: NextRequest) {
  const { sesion, respuesta } = await requireSession(req, ROLES);
  if (!sesion) return respuesta;

  const { data, error } = await supabaseAdmin
    .from("mensajes_equipo")
    .select("id, autor, rol, texto, creado_en")
    .is("destinatario", null)
    .order("creado_en", { ascending: true })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ mensajes: data ?? [] });
}

export async function POST(req: NextRequest) {
  const { sesion, respuesta } = await requireSession(req, ROLES);
  if (!sesion) return respuesta;

  const body = await req.json().catch(() => null);
  const texto = typeof body?.texto === "string" ? body.texto.trim() : "";
  if (!texto) {
    return NextResponse.json({ error: "Escribí un mensaje." }, { status: 400 });
  }

  const { data: usuario } = await supabaseAdmin
    .from("usuarios")
    .select("nombre")
    .eq("id", sesion.usuarioId)
    .maybeSingle();

  const { error } = await supabaseAdmin.from("mensajes_equipo").insert({
    autor: usuario?.nombre ?? "Equipo",
    rol: sesion.rol,
    texto,
    destinatario: null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
