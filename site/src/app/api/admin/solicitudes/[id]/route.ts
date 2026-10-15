import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireSession } from "@/lib/require-session";
import { notificarPersona } from "@/lib/telegram";

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
  const accion = body?.accion;

  if (accion !== "aprobar" && accion !== "rechazar") {
    return NextResponse.json({ error: "Acción inválida." }, { status: 400 });
  }

  const { data: solicitud } = await supabaseAdmin
    .from("solicitudes_compra")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!solicitud || solicitud.estado !== "pendiente") {
    return NextResponse.json(
      { error: "La solicitud no existe o ya fue revisada." },
      { status: 404 }
    );
  }

  if (accion === "rechazar") {
    const { error } = await supabaseAdmin
      .from("solicitudes_compra")
      .update({
        estado: "rechazada",
        revisado_por: sesion.usuarioId,
        revisado_en: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    notificarPersona(
      solicitud.persona_id,
      `🌙 Tu solicitud de "${solicitud.paquete}" fue rechazada. Si crees que es un error, contactá al equipo.`
    ).catch(() => null);
    return NextResponse.json({ ok: true });
  }

  // Aprobar: si la persona ya tiene ese paquete, actualiza esa compra en vez
  // de crear una duplicada (regla explícita del proyecto).
  const { data: compraExistente } = await supabaseAdmin
    .from("compras")
    .select("id")
    .eq("persona_id", solicitud.persona_id)
    .eq("paquete", solicitud.paquete)
    .maybeSingle();

  if (compraExistente) {
    await supabaseAdmin
      .from("compras")
      .update({
        lider: solicitud.lider,
        participaciones: solicitud.participaciones,
        hash: solicitud.hash,
        voucher_url: solicitud.voucher_url,
        actualizada_en: new Date().toISOString(),
      })
      .eq("id", compraExistente.id);
  } else {
    await supabaseAdmin.from("compras").insert({
      persona_id: solicitud.persona_id,
      persona_nombre: solicitud.persona_nombre,
      persona_telegram: solicitud.persona_telegram,
      paquete: solicitud.paquete,
      lider: solicitud.lider,
      participaciones: solicitud.participaciones,
      hash: solicitud.hash,
      voucher_url: solicitud.voucher_url,
      estado: "pendiente",
      creada_por: sesion.usuarioId,
      creada_por_rol: sesion.rol,
    });
  }

  const { error } = await supabaseAdmin
    .from("solicitudes_compra")
    .update({
      estado: "aprobada",
      revisado_por: sesion.usuarioId,
      revisado_en: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabaseAdmin.from("logs").insert({
    usuario: sesion.usuarioId,
    rol: sesion.rol,
    accion: "aprobar_solicitud",
    target_id: id,
    detalle: `${solicitud.paquete} para ${solicitud.persona_nombre}`,
  });

  notificarPersona(
    solicitud.persona_id,
    `🕊️ Tu solicitud de "${solicitud.paquete}" fue aprobada.`
  ).catch(() => null);

  return NextResponse.json({ ok: true });
}
