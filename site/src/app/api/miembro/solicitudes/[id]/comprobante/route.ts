import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireSession } from "@/lib/require-session";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { sesion, respuesta } = await requireSession(req, ["miembro"]);
  if (!sesion) return respuesta;
  if (!sesion.personaId) {
    return NextResponse.json({ error: "Sesión inválida." }, { status: 401 });
  }

  const { id } = await params;

  const { data: solicitud } = await supabaseAdmin
    .from("solicitudes_compra")
    .select("id, persona_id")
    .eq("id", id)
    .maybeSingle();

  if (!solicitud || solicitud.persona_id !== sesion.personaId) {
    return NextResponse.json({ error: "Solicitud no encontrada." }, { status: 404 });
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
  const ruta = `${sesion.personaId}/solicitudes/${id}/${Date.now()}.${extension}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("comprobantes")
    .upload(ruta, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: urlData } = supabaseAdmin.storage.from("comprobantes").getPublicUrl(ruta);

  const { error: updateError } = await supabaseAdmin
    .from("solicitudes_compra")
    .update({ voucher_url: urlData.publicUrl })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, voucherUrl: urlData.publicUrl });
}
