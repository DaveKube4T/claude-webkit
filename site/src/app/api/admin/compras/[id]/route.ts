import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireSession } from "@/lib/require-session";
import { notificarPersona } from "@/lib/telegram";

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

  const { data: compra, error } = await supabaseAdmin
    .from("compras")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !compra) {
    return NextResponse.json({ error: "Compra no encontrada." }, { status: 404 });
  }

  const { data: hashesExtra } = await supabaseAdmin
    .from("compra_hashes")
    .select("id, hash, creado_en")
    .eq("compra_id", id)
    .order("creado_en", { ascending: true });

  // Detección de posibles duplicados: mismo hash en otra compra.
  let duplicados: { id: string; persona_nombre: string | null; paquete: string }[] = [];
  if (compra.hash) {
    const { data } = await supabaseAdmin
      .from("compras")
      .select("id, persona_nombre, paquete")
      .eq("hash", compra.hash)
      .neq("id", id);
    duplicados = data ?? [];
  }

  return NextResponse.json({
    compra,
    hashesExtra: hashesExtra ?? [],
    duplicados,
    puedeVerPagoInterno: sesion.rol === "superadmin" || sesion.rol === "admin",
    puedeEliminarComprobantes: sesion.rol === "superadmin" || sesion.rol === "admin",
    puedeEditarLider: sesion.rol === "superadmin" || sesion.rol === "admin",
    puedeEliminarCompra: sesion.rol === "superadmin" || sesion.rol === "admin",
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { sesion, respuesta } = await requireSession(req, ["superadmin", "admin"]);
  if (!sesion) return respuesta;

  const { id } = await params;

  const { data: compra } = await supabaseAdmin
    .from("compras")
    .select("persona_nombre, paquete")
    .eq("id", id)
    .maybeSingle();

  await supabaseAdmin.from("compra_hashes").delete().eq("compra_id", id);

  const { error } = await supabaseAdmin.from("compras").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabaseAdmin.from("logs").insert({
    usuario: sesion.usuarioId,
    rol: sesion.rol,
    accion: "eliminar_compra",
    target_id: id,
    detalle: JSON.stringify(compra ?? {}),
  });

  return NextResponse.json({ ok: true });
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

  const cambios: Record<string, unknown> = {};

  if (typeof body.paquete === "string") cambios.paquete = body.paquete.trim();
  if (typeof body.participaciones === "number" || body.participaciones === null) {
    cambios.participaciones = body.participaciones;
  }
  if (typeof body.condicion_especial === "string") {
    cambios.condicion_especial = body.condicion_especial.trim() || null;
  }
  if (typeof body.nota_miembro === "string") {
    cambios.nota_miembro = body.nota_miembro.trim() || null;
  }
  if (typeof body.hash === "string" || body.hash === null) {
    cambios.hash = typeof body.hash === "string" ? body.hash.trim() || null : null;
  }
  if (typeof body.posible_duplicado === "boolean") {
    cambios.posible_duplicado = body.posible_duplicado;
  }

  // "Líder"/colaboradora: superadmin y admin pueden cambiarlo (verificador no).
  if (typeof body.lider === "string") {
    if (sesion.rol !== "superadmin" && sesion.rol !== "admin") {
      return NextResponse.json(
        { error: "Solo superadmin o admin pueden cambiar la colaboradora." },
        { status: 403 }
      );
    }
    cambios.lider = body.lider.trim() || null;
  }

  // Aprobar / rechazar / volver a pendiente / solucionar error reportado.
  if (typeof body.estado === "string") {
    const estadosValidos = ["pendiente", "verificada", "rechazada", "error_reportado"];
    if (!estadosValidos.includes(body.estado)) {
      return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
    }
    cambios.estado = body.estado;
    if (body.estado === "verificada") cambios.aprobado_por = sesion.usuarioId;
  }

  if (Object.keys(cambios).length === 0) {
    return NextResponse.json({ error: "Nada para actualizar." }, { status: 400 });
  }

  cambios.actualizada_en = new Date().toISOString();

  const { error } = await supabaseAdmin.from("compras").update(cambios).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabaseAdmin.from("logs").insert({
    usuario: sesion.usuarioId,
    rol: sesion.rol,
    accion: "editar_compra",
    target_id: id,
    detalle: JSON.stringify(cambios),
  });

  if (cambios.estado === "verificada" || cambios.estado === "rechazada") {
    const { data: compraActualizada } = await supabaseAdmin
      .from("compras")
      .select("persona_id, paquete")
      .eq("id", id)
      .maybeSingle();

    if (compraActualizada) {
      const texto =
        cambios.estado === "verificada"
          ? `🪷 Tu compra de "${compraActualizada.paquete}" fue verificada. ¡Gracias!`
          : `🌙 Tu compra de "${compraActualizada.paquete}" fue rechazada. Si crees que es un error, contactá al equipo.`;
      notificarPersona(compraActualizada.persona_id, texto).catch(() => null);
    }
  }

  return NextResponse.json({ ok: true });
}
