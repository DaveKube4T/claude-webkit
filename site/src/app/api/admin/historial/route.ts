import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireSession } from "@/lib/require-session";

export async function GET(req: NextRequest) {
  const { sesion, respuesta } = await requireSession(req, ["superadmin", "admin"]);
  if (!sesion) return respuesta;

  let query = supabaseAdmin
    .from("logs")
    .select("id, usuario, rol, accion, target_id, detalle, fecha")
    .order("fecha", { ascending: false })
    .limit(200);

  // El rol "admin" nunca ve lo que hizo superadmin (regla de confidencialidad
  // de PROYECTO-RESONANCIA.md) — el resto del equipo sí es visible para admin.
  if (sesion.rol === "admin") {
    query = query.neq("rol", "superadmin");
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const idsUsuarios = [...new Set((data ?? []).map((l) => l.usuario).filter(Boolean))];
  const nombresPorId = new Map<string, string>();
  if (idsUsuarios.length > 0) {
    const { data: usuarios } = await supabaseAdmin
      .from("usuarios")
      .select("id, nombre")
      .in("id", idsUsuarios);
    for (const u of usuarios ?? []) nombresPorId.set(u.id, u.nombre);
  }

  const historial = (data ?? []).map((l) => ({
    ...l,
    usuario_nombre: (l.usuario && nombresPorId.get(l.usuario)) || l.usuario || "Sistema",
  }));

  return NextResponse.json({ historial });
}
