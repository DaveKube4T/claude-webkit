import { NextRequest, NextResponse } from "next/server";
import { verificarSesion, Rol } from "./auth";

export async function requireSession(
  req: NextRequest,
  rolesPermitidos?: Rol[]
) {
  const token = req.headers.get("x-session-token");
  const sesion = await verificarSesion(token);

  if (!sesion) {
    return {
      sesion: null,
      respuesta: NextResponse.json(
        { error: "Sesión inválida o expirada." },
        { status: 401 }
      ),
    };
  }

  if (rolesPermitidos && !rolesPermitidos.includes(sesion.rol)) {
    return {
      sesion: null,
      respuesta: NextResponse.json(
        { error: "No tenés permiso para esto." },
        { status: 403 }
      ),
    };
  }

  return { sesion, respuesta: null };
}
