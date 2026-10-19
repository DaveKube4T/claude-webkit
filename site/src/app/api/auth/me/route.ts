import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireSession } from "@/lib/require-session";

export async function GET(req: NextRequest) {
  const { sesion, respuesta } = await requireSession(req);
  if (!sesion) return respuesta;

  if (sesion.rol === "miembro") {
    if (!sesion.personaId) {
      return NextResponse.json({ error: "Sesión sin persona." }, { status: 400 });
    }
    const { data: persona } = await supabaseAdmin
      .from("personas")
      .select("nombre, telegram, acepto_disclaimer_en")
      .eq("id", sesion.personaId)
      .maybeSingle();

    if (!persona) {
      return NextResponse.json({ error: "Persona no encontrada." }, { status: 404 });
    }

    return NextResponse.json({
      nombre: persona.nombre,
      usuario: persona.telegram,
      rol: "miembro",
      paquetesAsignados: [],
      aceptoDisclaimer: Boolean(persona.acepto_disclaimer_en),
    });
  }

  if (!sesion.usuarioId) {
    return NextResponse.json({ error: "Sesión sin usuario de equipo." }, { status: 400 });
  }

  const { data: cuenta } = await supabaseAdmin
    .from("usuarios")
    .select("nombre, usuario, rol, paquetes_asignados")
    .eq("id", sesion.usuarioId)
    .maybeSingle();

  if (!cuenta) {
    return NextResponse.json({ error: "Cuenta no encontrada." }, { status: 404 });
  }

  return NextResponse.json({
    nombre: cuenta.nombre,
    usuario: cuenta.usuario,
    rol: cuenta.rol,
    paquetesAsignados: cuenta.paquetes_asignados ?? [],
  });
}
