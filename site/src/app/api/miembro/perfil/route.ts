import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireSession } from "@/lib/require-session";

const CAMPOS_EDITABLES = [
  "nombre",
  "apellidos",
  "documento",
  "pasaporte",
  "wallet_trc20",
  "calle",
  "numero",
  "ciudad",
  "provincia_estado",
  "pais",
  "zip_code",
  "telefono",
  "telefono_alternativo",
  "mail",
  "mail_alternativo",
  "signal",
] as const;

export async function GET(req: NextRequest) {
  const { sesion, respuesta } = await requireSession(req, ["miembro"]);
  if (!sesion) return respuesta;
  if (!sesion.personaId) {
    return NextResponse.json({ error: "Sesión inválida." }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("personas")
    .select(
      "telegram, telegram_chat_id, " + CAMPOS_EDITABLES.join(", ")
    )
    .eq("id", sesion.personaId)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Persona no encontrada." }, { status: 404 });
  }

  const fila = data as unknown as Record<string, unknown>;
  const { telegram_chat_id, ...resto } = fila;
  return NextResponse.json({
    persona: {
      ...resto,
      tiene_bot: Boolean(telegram_chat_id),
    },
  });
}

export async function PATCH(req: NextRequest) {
  const { sesion, respuesta } = await requireSession(req, ["miembro"]);
  if (!sesion) return respuesta;
  if (!sesion.personaId) {
    return NextResponse.json({ error: "Sesión inválida." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const cambios: Record<string, string | null> = {};
  for (const campo of CAMPOS_EDITABLES) {
    if (campo in body) {
      const valor = body[campo];
      cambios[campo] = typeof valor === "string" && valor.trim() !== "" ? valor.trim() : null;
    }
  }

  if (cambios.nombre === null) {
    return NextResponse.json({ error: "El nombre no puede quedar vacío." }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("personas")
    .update(cambios)
    .eq("id", sesion.personaId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
