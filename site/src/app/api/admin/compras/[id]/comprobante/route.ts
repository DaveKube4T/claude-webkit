import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireSession } from "@/lib/require-session";

// Subida de comprobante desde el admin (ej. al cargar una compra histórica
// que ya trae su comprobante, como las de la migración de JotForm/Google).
// Mismo bucket y misma estructura de ruta que la subida del lado miembro.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { sesion, respuesta } = await requireSession(req, ["superadmin", "admin"]);
  if (!sesion) return respuesta;

  const { id } = await params;

  const { data: compra } = await supabaseAdmin
    .from("compras")
    .select("id, persona_id, vouchers")
    .eq("id", id)
    .maybeSingle();

  if (!compra) {
    return NextResponse.json({ error: "Compra no encontrada." }, { status: 404 });
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("archivo");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No se recibió ningún archivo." }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "El archivo supera los 10MB." }, { status: 400 });
  }

  const extension = file.name.split(".").pop() || "bin";
  const ruta = `${compra.persona_id}/${id}/${Date.now()}.${extension}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("comprobantes")
    .upload(ruta, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: urlData } = supabaseAdmin.storage.from("comprobantes").getPublicUrl(ruta);
  const nuevoVoucher = { url: urlData.publicUrl, subido_en: new Date().toISOString() };
  const vouchersActuales = Array.isArray(compra.vouchers) ? compra.vouchers : [];

  const { error: updateError } = await supabaseAdmin
    .from("compras")
    .update({
      vouchers: [...vouchersActuales, nuevoVoucher],
      voucher_url: urlData.publicUrl,
      actualizada_en: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await supabaseAdmin.from("logs").insert({
    usuario: sesion.usuarioId,
    rol: sesion.rol,
    accion: "subir_comprobante",
    target_id: id,
    detalle: urlData.publicUrl,
  });

  return NextResponse.json({ ok: true, voucher: nuevoVoucher });
}
