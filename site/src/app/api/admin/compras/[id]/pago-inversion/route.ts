import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireSession } from "@/lib/require-session";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { sesion, respuesta } = await requireSession(req, ["superadmin", "admin"]);
  if (!sesion) return respuesta;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const monto = Number(body?.monto);
  if (!monto || monto <= 0) {
    return NextResponse.json({ error: "Monto inválido." }, { status: 400 });
  }
  const nota = typeof body?.nota === "string" ? body.nota.trim() || null : null;

  const { data: compra } = await supabaseAdmin
    .from("compras")
    .select("pago_inversion")
    .eq("id", id)
    .maybeSingle();

  if (!compra) return NextResponse.json({ error: "Compra no encontrada." }, { status: 404 });

  const { data: usuarioFila } = await supabaseAdmin
    .from("usuarios")
    .select("nombre")
    .eq("id", sesion.usuarioId)
    .maybeSingle();

  const pagos = Array.isArray(compra.pago_inversion) ? compra.pago_inversion : [];
  pagos.push({
    monto,
    nota,
    registrado_por_nombre: usuarioFila?.nombre ?? "Equipo",
    creado_en: new Date().toISOString(),
  });

  const { error } = await supabaseAdmin
    .from("compras")
    .update({ pago_inversion: pagos, actualizada_en: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabaseAdmin.from("logs").insert({
    usuario: sesion.usuarioId,
    rol: sesion.rol,
    accion: "registrar_pago_inversion",
    target_id: id,
    detalle: `$${monto}${nota ? " — " + nota : ""}`,
  });

  return NextResponse.json({ ok: true });
}
