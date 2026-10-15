import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireSession } from "@/lib/require-session";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { sesion, respuesta } = await requireSession(req, ["superadmin", "admin"]);
  if (!sesion) return respuesta;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const url = typeof body?.url === "string" ? body.url : "";

  if (!url) {
    return NextResponse.json({ error: "Falta la URL del comprobante." }, { status: 400 });
  }

  const { data: compra } = await supabaseAdmin
    .from("compras")
    .select("vouchers")
    .eq("id", id)
    .maybeSingle();

  if (!compra) {
    return NextResponse.json({ error: "Compra no encontrada." }, { status: 404 });
  }

  const vouchersActuales: { url: string }[] = Array.isArray(compra.vouchers)
    ? compra.vouchers
    : [];
  const vouchersNuevos = vouchersActuales.filter((v) => v.url !== url);

  const { error } = await supabaseAdmin
    .from("compras")
    .update({ vouchers: vouchersNuevos, actualizada_en: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabaseAdmin.from("logs").insert({
    usuario: sesion.usuarioId,
    rol: sesion.rol,
    accion: "eliminar_comprobante",
    target_id: id,
    detalle: url,
  });

  return NextResponse.json({ ok: true });
}
