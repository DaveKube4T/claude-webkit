import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { crearSesion, hashPassword } from "@/lib/auth";
import { notificarEquipo } from "@/lib/telegram";

function idDePersona(telegram: string) {
  return createHash("sha1").update(`personas:${telegram.toLowerCase()}`).digest("hex");
}

export async function POST(req: NextRequest) {
  const formData = await req.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const nombre = String(formData.get("nombre") ?? "").trim();
  const mail = String(formData.get("mail") ?? "").trim().toLowerCase();
  const telegram = String(formData.get("telegram") ?? "").trim().replace(/^@/, "");
  const password = String(formData.get("password") ?? "");
  const paquete = String(formData.get("paquete") ?? "").trim();
  const lider = String(formData.get("lider") ?? "").trim();
  const hash = String(formData.get("hash") ?? "").trim();
  const archivo = formData.get("comprobante");

  if (!nombre || !telegram || !password || !paquete) {
    return NextResponse.json(
      { error: "Nombre, Telegram, contraseña y paquete son requeridos." },
      { status: 400 }
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 8 caracteres." },
      { status: 400 }
    );
  }
  if (!hash) {
    return NextResponse.json(
      { error: "La referencia de pago o hash es requerida." },
      { status: 400 }
    );
  }
  if (!(archivo instanceof File) || archivo.size === 0) {
    return NextResponse.json(
      { error: "El comprobante es requerido." },
      { status: 400 }
    );
  }

  const personaId = idDePersona(telegram);

  const { data: existente } = await supabaseAdmin
    .from("personas")
    .select("id")
    .eq("id", personaId)
    .maybeSingle();

  if (existente) {
    return NextResponse.json(
      { error: "Ya existe una cuenta con ese usuario de Telegram. Iniciá sesión en vez de registrarte." },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);

  const { error: errorPersona } = await supabaseAdmin.from("personas").insert({
    id: personaId,
    nombre,
    mail: mail || null,
    telegram,
    password_hash: passwordHash,
  });

  if (errorPersona) {
    return NextResponse.json({ error: errorPersona.message }, { status: 500 });
  }

  let voucherUrl: string | null = null;

  if (archivo instanceof File && archivo.size > 0) {
    if (archivo.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "El comprobante supera los 10MB." }, { status: 400 });
    }
    const extension = archivo.name.split(".").pop() || "bin";
    const ruta = `${personaId}/registro/${Date.now()}.${extension}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from("comprobantes")
      .upload(ruta, archivo, { contentType: archivo.type, upsert: false });

    if (!uploadError) {
      const { data: urlData } = supabaseAdmin.storage.from("comprobantes").getPublicUrl(ruta);
      voucherUrl = urlData.publicUrl;
    }
  }

  const { error: errorSolicitud } = await supabaseAdmin.from("solicitudes_compra").insert({
    persona_id: personaId,
    persona_nombre: nombre,
    persona_telegram: telegram,
    paquete,
    lider: lider || null,
    hash: hash || null,
    voucher_url: voucherUrl,
    estado: "pendiente",
  });

  if (errorSolicitud) {
    return NextResponse.json({ error: errorSolicitud.message }, { status: 500 });
  }

  const sesion = await crearSesion({ rol: "miembro", personaId });

  await notificarEquipo(
    `🌱 Nueva persona registrada: ${nombre} (@${telegram}) — solicitó ${paquete}.`
  ).catch(() => null);

  return NextResponse.json({ token: sesion.token, expiraEn: sesion.expiraEn });
}
