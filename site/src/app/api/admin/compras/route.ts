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

  const { searchParams } = new URL(req.url);
  const persona = searchParams.get("persona");
  const paquete = searchParams.get("paquete");
  const estado = searchParams.get("estado");

  let query = supabaseAdmin
    .from("compras")
    .select(
      "id, persona_id, persona_nombre, persona_telegram, paquete, lider, participaciones, monto, moneda, hash, vouchers, estado, creada_en, condicion_especial"
    )
    .order("creada_en", { ascending: false })
    .limit(1000);

  if (persona) {
    query = query.or(
      `persona_nombre.ilike.%${persona}%,persona_telegram.ilike.%${persona}%`
    );
  }
  if (paquete) query = query.eq("paquete", paquete);
  if (estado) query = query.eq("estado", estado);

  if (sesion.rol === "verificador" && sesion.usuarioId) {
    const { data: cuenta } = await supabaseAdmin
      .from("usuarios")
      .select("paquetes_asignados")
      .eq("id", sesion.usuarioId)
      .maybeSingle();
    const asignados: string[] = cuenta?.paquetes_asignados ?? [];
    if (asignados.length > 0) query = query.in("paquete", asignados);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ compras: data ?? [] });
}

export async function POST(req: NextRequest) {
  const { sesion, respuesta } = await requireSession(req, [
    "superadmin",
    "admin",
    "verificador",
  ]);
  if (!sesion) return respuesta;

  const body = await req.json().catch(() => null);
  const personaId = typeof body?.personaId === "string" ? body.personaId : "";
  const paquete = typeof body?.paquete === "string" ? body.paquete.trim() : "";
  const lider = typeof body?.lider === "string" ? body.lider.trim() : "";
  const participaciones =
    typeof body?.participaciones === "number" ? body.participaciones : null;
  const hash = typeof body?.hash === "string" ? body.hash.trim() : "";

  if (!personaId || !paquete) {
    return NextResponse.json(
      { error: "Falta la persona o el paquete." },
      { status: 400 }
    );
  }

  const { data: persona } = await supabaseAdmin
    .from("personas")
    .select("nombre, telegram")
    .eq("id", personaId)
    .maybeSingle();

  if (!persona) {
    return NextResponse.json({ error: "Persona no encontrada." }, { status: 404 });
  }

  const { data, error } = await supabaseAdmin
    .from("compras")
    .insert({
      persona_id: personaId,
      persona_nombre: persona.nombre,
      persona_telegram: persona.telegram,
      paquete,
      lider: lider || null,
      participaciones,
      hash: hash || null,
      estado: "pendiente",
      creada_por: sesion.usuarioId,
      creada_por_rol: sesion.rol,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabaseAdmin.from("logs").insert({
    usuario: sesion.usuarioId,
    rol: sesion.rol,
    accion: "crear_compra",
    target_id: data.id,
    detalle: `${paquete} para ${persona.nombre}`,
  });

  return NextResponse.json({ ok: true, id: data.id });
}
