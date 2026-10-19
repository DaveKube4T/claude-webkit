import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generarCodigoOtp, hashCodigoOtp, ocultarEmail } from "@/lib/auth";
import { enviarCodigoLogin } from "@/lib/email";
import { enviarMensajeTelegram } from "@/lib/telegram";

// Login de primera vez Y recuperación de contraseña, ver
// PROYECTO-RESONANCIA.md sección "Login, recuperación y representantes":
// SIEMPRE se identifica por Telegram, nunca buscando por mail (un mismo mail
// puede pertenecer a un representante con varias cuentas) — el mail es solo
// un canal de envío posible, no la identificación.
// - Sin contraseña todavía (primera vez): código por EMAIL.
// - Con contraseña ya seteada (recuperación): código por TELEGRAM, porque
//   asumimos que ya interactuó con el bot al menos una vez.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const identificadorRaw =
    typeof body?.identificador === "string" ? body.identificador.trim() : "";
  const identificador = identificadorRaw.replace(/^@/, "");

  if (!identificador) {
    return NextResponse.json(
      { error: "Ingresá tu usuario de Telegram." },
      { status: 400 }
    );
  }

  const { data: persona, error } = await supabaseAdmin
    .from("personas")
    .select("id, mail, password_hash, telegram_chat_id")
    .ilike("telegram", identificador)
    .maybeSingle();

  if (error || !persona) {
    return NextResponse.json(
      { error: "No encontramos una cuenta con ese usuario de Telegram." },
      { status: 404 }
    );
  }

  const esRecuperacion = Boolean(persona.password_hash);

  if (esRecuperacion && !persona.telegram_chat_id) {
    return NextResponse.json(
      {
        error:
          'Todavía no iniciaste una conversación con nuestro bot de Telegram. Escribile "Hola" a @VerificacionesResonanciaBot y volvé a intentar.',
      },
      { status: 400 }
    );
  }

  if (!esRecuperacion && !persona.mail) {
    return NextResponse.json(
      {
        error:
          "Todavía no tenés un email registrado en tu cuenta. Contactate con el equipo.",
      },
      { status: 400 }
    );
  }

  const codigo = generarCodigoOtp();
  const codigoHash = hashCodigoOtp(codigo);
  const expira = new Date(Date.now() + 10 * 60 * 1000);

  const { error: updateError } = await supabaseAdmin
    .from("personas")
    .update({
      codigo_recuperacion: codigoHash,
      codigo_recuperacion_exp: expira.toISOString(),
    })
    .eq("id", persona.id);

  if (updateError) {
    return NextResponse.json(
      { error: "No pudimos generar el código. Intentá de nuevo." },
      { status: 500 }
    );
  }

  // Priorizar envío por email si la persona tiene mail registrado
  if (persona.mail) {
    try {
      await enviarCodigoLogin(persona.mail as string, codigo);
    } catch {
      return NextResponse.json(
        {
          error:
            "No pudimos enviar el código por email. Contactate con el equipo.",
        },
        { status: 500 }
      );
    }
    return NextResponse.json({
      ok: true,
      canal: "email" as const,
      mailOculto: ocultarEmail(persona.mail as string),
    });
  }

  // Si no tiene mail, intentar Telegram como alternativa
  if (persona.telegram_chat_id) {
    try {
      await enviarMensajeTelegram(
        persona.telegram_chat_id as string,
        `🔑 Tu código para acceder al Portal de Verificación es: ${codigo}\n\nVale por 10 minutos. Si no lo pediste vos, ignorá este mensaje.`
      );
    } catch {
      return NextResponse.json(
        {
          error:
            "No pudimos enviar el código por Telegram. Contactate con el equipo.",
        },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true, canal: "telegram" as const });
  }

  return NextResponse.json(
    {
      error:
        "No tenés un email ni Telegram configurado para recibir el código. Contactate con el equipo.",
    },
    { status: 400 }
  );
}
