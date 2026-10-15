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
  "nota_destacado",
] as const;

export async function GET(
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

  const { data: persona, error } = await supabaseAdmin
    .from("personas")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !persona) {
    return NextResponse.json({ error: "Persona no encontrada." }, { status: 404 });
  }

  const { data: compras } = await supabaseAdmin
    .from("compras")
    .select("id, paquete, estado, creada_en")
    .eq("persona_id", id)
    .order("creada_en", { ascending: false });

  return NextResponse.json({ persona, compras: compras ?? [] });
}

export async function PATCH(
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
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });

  const cambios: Record<string, string | boolean | null> = {};
  for (const campo of CAMPOS_EDITABLES) {
    if (campo in body) {
      const valor = body[campo];
      cambios[campo] = typeof valor === "string" && valor.trim() !== "" ? valor.trim() : null;
    }
  }
  if ("destacado" in body) {
    cambios.destacado = Boolean(body.destacado);
  }

  if (cambios.nombre === null) {
    return NextResponse.json({ error: "El nombre no puede quedar vacío." }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("personas").update(cambios).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabaseAdmin.from("logs").insert({
    usuario: sesion.usuarioId,
    rol: sesion.rol,
    accion: "editar_persona",
    target_id: id,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { sesion, respuesta } = await requireSession(req, ["superadmin"]);
  if (!sesion) return respuesta;

  const { id } = await params;

  // compras, solicitudes_compra, compra_hashes y mensajes_telegram tienen
  // ON DELETE CASCADE sobre persona_id, así que se borran solas.
  const { error } = await supabaseAdmin.from("personas").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabaseAdmin.from("logs").insert({
    usuario: sesion.usuarioId,
    rol: sesion.rol,
    accion: "eliminar_persona",
    target_id: id,
  });

  return NextResponse.json({ ok: true });
}
