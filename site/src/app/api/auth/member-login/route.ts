import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { crearSesion, verificarPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const identificadorRaw =
    typeof body?.identificador === "string" ? body.identificador.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const identificador = identificadorRaw.replace(/^@/, "");

  if (!identificador || !password) {
    return NextResponse.json(
      { error: "Usuario o Telegram y contraseña son requeridos." },
      { status: 400 }
    );
  }

  const { data: persona, error } = await supabaseAdmin
    .from("personas")
    .select("id, nombre, telegram, password_hash, acepto_disclaimer_en")
    .ilike("telegram", identificador)
    .maybeSingle();

  if (error || !persona) {
    return NextResponse.json(
      { error: "No encontramos una cuenta con ese usuario o Telegram." },
      { status: 401 }
    );
  }

  if (!persona.password_hash) {
    return NextResponse.json(
      {
        error: "Todavía no configuraste una contraseña.",
        codigo: "SIN_PASSWORD",
      },
      { status: 401 }
    );
  }

  const passwordOk = await verificarPassword(password, persona.password_hash);
  if (!passwordOk) {
    return NextResponse.json(
      { error: "Usuario o Telegram y contraseña no coinciden." },
      { status: 401 }
    );
  }

  const sesion = await crearSesion({ rol: "miembro", personaId: persona.id });

  return NextResponse.json({
    token: sesion.token,
    expiraEn: sesion.expiraEn,
    nombre: persona.nombre,
    aceptoDisclaimer: Boolean(persona.acepto_disclaimer_en),
  });
}
