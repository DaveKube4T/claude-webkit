import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { crearSesion, hashCodigoOtp, hashPassword } from "@/lib/auth";

// Segundo paso del login de primera vez: valida el código recibido por mail
// y crea la sesión. La contraseña nueva es SUGERIDA, no obligatoria (ver
// PROYECTO-RESONANCIA.md) — si no viene, queda sin setear y la próxima vez
// hay que volver a pedir un código.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const identificadorRaw =
    typeof body?.identificador === "string" ? body.identificador.trim() : "";
  const identificador = identificadorRaw.replace(/^@/, "");
  const codigo = typeof body?.codigo === "string" ? body.codigo.trim() : "";
  const nuevaPassword =
    typeof body?.nuevaPassword === "string" ? body.nuevaPassword : "";

  if (!identificador || !codigo) {
    return NextResponse.json(
      { error: "Ingresá el código que te enviamos." },
      { status: 400 }
    );
  }

  if (nuevaPassword && nuevaPassword.length < 8) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 8 caracteres." },
      { status: 400 }
    );
  }

  const { data: persona, error } = await supabaseAdmin
    .from("personas")
    .select(
      "id, nombre, codigo_recuperacion, codigo_recuperacion_exp, acepto_disclaimer_en"
    )
    .ilike("telegram", identificador)
    .maybeSingle();

  if (error || !persona) {
    return NextResponse.json(
      { error: "No encontramos una cuenta con ese usuario de Telegram." },
      { status: 404 }
    );
  }

  if (!persona.codigo_recuperacion || !persona.codigo_recuperacion_exp) {
    return NextResponse.json(
      { error: "Pedí un código nuevo." },
      { status: 400 }
    );
  }

  if (new Date(persona.codigo_recuperacion_exp).getTime() < Date.now()) {
    return NextResponse.json(
      { error: "El código venció. Pedí uno nuevo." },
      { status: 400 }
    );
  }

  if (hashCodigoOtp(codigo) !== persona.codigo_recuperacion) {
    return NextResponse.json(
      { error: "El código no es correcto." },
      { status: 400 }
    );
  }

  const actualizacion: Record<string, unknown> = {
    codigo_recuperacion: null,
    codigo_recuperacion_exp: null,
  };
  if (nuevaPassword) {
    actualizacion.password_hash = await hashPassword(nuevaPassword);
  }

  const { error: updateError } = await supabaseAdmin
    .from("personas")
    .update(actualizacion)
    .eq("id", persona.id);

  if (updateError) {
    return NextResponse.json(
      { error: "No pudimos completar el ingreso. Intentá de nuevo." },
      { status: 500 }
    );
  }

  const sesion = await crearSesion({ rol: "miembro", personaId: persona.id });

  return NextResponse.json({
    token: sesion.token,
    expiraEn: sesion.expiraEn,
    nombre: persona.nombre,
    aceptoDisclaimer: Boolean(persona.acepto_disclaimer_en),
  });
}
