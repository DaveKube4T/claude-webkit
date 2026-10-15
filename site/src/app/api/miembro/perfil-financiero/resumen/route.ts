import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireSession } from "@/lib/require-session";
import { anthropic } from "@/lib/anthropic";
import { obtenerSeccionPerfilFinanciero } from "@/lib/perfil-financiero-secciones";
import { verificarYRegistrarUsoIA } from "@/lib/limite-ia";

interface Turno {
  rol: "user" | "assistant";
  texto: string;
  en: string;
}

export async function POST(req: NextRequest) {
  const { sesion, respuesta } = await requireSession(req, ["miembro"]);
  if (!sesion) return respuesta;
  if (!sesion.personaId) {
    return NextResponse.json({ error: "Sesión inválida." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const seccionKey = body?.seccion as string | undefined;
  const seccion = seccionKey ? obtenerSeccionPerfilFinanciero(seccionKey) : undefined;
  if (!seccion) {
    return NextResponse.json({ error: "Sección inválida." }, { status: 400 });
  }

  const { data: perfil, error: errorLectura } = await supabaseAdmin
    .from("perfiles_financieros")
    .select(`id, resumenes, ${seccion.key}`)
    .eq("persona_id", sesion.personaId)
    .maybeSingle();

  if (errorLectura) {
    return NextResponse.json({ error: errorLectura.message }, { status: 500 });
  }

  const registro = perfil as Record<string, unknown> | null;
  const resumenesExistentes = (registro?.resumenes as Record<string, string>) ?? {};

  if (resumenesExistentes[seccion.key]) {
    return NextResponse.json({ resumen: resumenesExistentes[seccion.key] });
  }

  const historial: Turno[] = Array.isArray(registro?.[seccion.key])
    ? (registro![seccion.key] as Turno[])
    : [];

  if (historial.length === 0) {
    return NextResponse.json({ resumen: "" });
  }

  const { permitido } = await verificarYRegistrarUsoIA(sesion.personaId);
  if (!permitido) {
    return NextResponse.json(
      { error: "Llegaste al límite de uso de hoy. Probá de nuevo mañana." },
      { status: 429 }
    );
  }

  const transcripcion = historial
    .map((t) => `${t.rol === "user" ? "Persona" : "Guía"}: ${t.texto}`)
    .join("\n");

  let resumen = "";
  try {
    const respuestaClaude = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 512,
      system: `Lee esta conversación de la sección "${seccion.titulo}" de un Perfil Financiero personal y escribe un resumen limpio y organizado de lo que la persona respondió — en viñetas cortas, sin agregar nada que ella no haya dicho, en español sencillo. No repitas las preguntas, solo sus respuestas organizadas.`,
      messages: [{ role: "user", content: transcripcion }],
    });

    for (const bloque of respuestaClaude.content) {
      if (bloque.type === "text") resumen += bloque.text;
    }
  } catch (err) {
    console.error("Error generando resumen:", err);
    return NextResponse.json(
      { error: "No se pudo generar el resumen. Intenta de nuevo." },
      { status: 502 }
    );
  }

  const { error: errorGuardado } = await supabaseAdmin
    .from("perfiles_financieros")
    .update({
      resumenes: { ...resumenesExistentes, [seccion.key]: resumen },
      actualizado_en: new Date().toISOString(),
    })
    .eq("persona_id", sesion.personaId);

  if (errorGuardado) {
    return NextResponse.json({ error: errorGuardado.message }, { status: 500 });
  }

  return NextResponse.json({ resumen });
}
