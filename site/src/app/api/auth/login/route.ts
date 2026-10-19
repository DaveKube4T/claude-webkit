import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { crearSesion, verificarPassword } from "@/lib/auth";

// Login de equipo (superadmin / admin / verificador).
// El login de miembros (telegram + password/código) se implementa aparte.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const usuario = typeof body?.usuario === "string" ? body.usuario.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!usuario || !password) {
    return NextResponse.json(
      { error: "Usuario y contraseña son requeridos." },
      { status: 400 }
    );
  }

  const { data: cuenta, error } = await supabaseAdmin
    .from("usuarios")
    .select("id, nombre, usuario, password_hash, rol, paquetes_asignados")
    .ilike("usuario", usuario)
    .maybeSingle();

  if (error || !cuenta) {
    return NextResponse.json(
      { error: "Usuario o contraseña incorrectos." },
      { status: 401 }
    );
  }

  const passwordOk = await verificarPassword(password, cuenta.password_hash);
  if (!passwordOk) {
    return NextResponse.json(
      { error: "Usuario o contraseña incorrectos." },
      { status: 401 }
    );
  }

  const sesion = await crearSesion({
    rol: cuenta.rol,
    usuarioId: cuenta.id,
  });

  return NextResponse.json({
    token: sesion.token,
    expiraEn: sesion.expiraEn,
    nombre: cuenta.nombre,
    rol: cuenta.rol,
    paquetesAsignados: cuenta.paquetes_asignados ?? [],
  });
}
