import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireSession } from "@/lib/require-session";
import { anthropic } from "@/lib/anthropic";
import { obtenerSeccionPerfilFinanciero } from "@/lib/perfil-financiero-secciones";
import { verificarYRegistrarUsoIA } from "@/lib/limite-ia";
import type { MessageParam } from "@/lib/anthropic";   
interface Turno {
  rol: "user" | "assistant";
  texto: string;
  en: string;
}

function construirSystemPrompt(titulo: string, guia: string) {
  return `Eres una guía cálida, paciente y clara que ayuda a una persona —muchas veces sin experiencia en temas financieros— a completar la sección "${titulo}" de su Perfil Financiero personal y confidencial. Este perfil complementa su Plan de Vida: aquí se piensa CÓMO se organiza y protege el dinero, no los valores de fondo.

${guia}

Reglas:
- Hazle una sola pregunta a la vez, en español sencillo, sin tecnicismos financieros o legales sin explicar.
- Mucha gente no va a tener ideas propias todavía — no esperes a que se queden en blanco. Ofrece tú 2-3 ejemplos concretos junto con cada pregunta, para que nunca sientan la hoja en blanco.
- Si la persona dice "no sé" o similar, dale ejemplos todavía más simples, o sugiere que lo deje así por ahora y puede volver después.
- Nunca dés asesoría financiera, legal o de inversión concreta ni recomiendes productos específicos — esto es solo para que ella organice sus ideas antes de hablar con un asesor real y licenciado.
- Sé breve: 2-4 oraciones por mensaje, nunca un párrafo largo.
- Cuando sientas que ya cubrieron lo esencial de esta sección, dile con cariño que puede pasar a la siguiente sección cuando quiera.`;
}

export async function POST(req: NextRequest) {
  const { sesion, respuesta } = await requireSession(req, ["miembro"]);
  if (!sesion) return respuesta;
  if (!sesion.personaId) {
    return NextResponse.json({ error: "Sesión inválida." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const seccionKey = body?.seccion as string | undefined;
  const mensaje = typeof body?.mensaje === "string" ? body.mensaje.trim() : "";

  const seccion = seccionKey ? obtenerSeccionPerfilFinanciero(seccionKey) : undefined;
  if (!seccion) {
    return NextResponse.json({ error: "Sección inválida." }, { status: 400 });
  }
  if (!mensaje) {
    return NextResponse.json({ error: "Falta el mensaje." }, { status: 400 });
  }

  const { permitido } = await verificarYRegistrarUsoIA(sesion.personaId);
  if (!permitido) {
    return NextResponse.json(
      { error: "Llegaste al límite de mensajes de hoy para esta guía. Probá de nuevo mañana." },
      { status: 429 }
    );
  }

  const { data: perfilExistente, error: errorLectura } = await supabaseAdmin
    .from("perfiles_financieros")
    .select(`id, ${seccion.key}`)
    .eq("persona_id", sesion.personaId)
    .maybeSingle();

  if (errorLectura) {
    return NextResponse.json({ error: errorLectura.message }, { status: 500 });
  }

  const historialPrevio: Turno[] = Array.isArray(
    (perfilExistente as Record<string, unknown> | null)?.[seccion.key]
  )
    ? ((perfilExistente as Record<string, unknown>)[seccion.key] as Turno[])
    : [];

  const nuevoTurnoUsuario: Turno = {
    rol: "user",
    texto: mensaje,
    en: new Date().toISOString(),
  };

  const mensajesParaClaude: MessageParam[]    = [
    ...historialPrevio.map((t) => ({
      role: t.rol,
      content: t.texto,
    })),
    { role: "user", content: mensaje },
  ];

  let textoRespuesta = "";
  try {
    const respuestaClaude = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system: construirSystemPrompt(seccion.titulo, seccion.guia),
      messages: mensajesParaClaude,
    });

    for (const bloque of respuestaClaude.content) {
      if (bloque.type === "text") {
        textoRespuesta += bloque.text;
      }
    }
  } catch (err: any) {
    console.error("Error detallado llamando a Groq (Perfil Financiero):", err?.message || err);
    return NextResponse.json(
      { error: `Error de IA: ${err?.message || "Desconocido"}` },
      { status: 502 }
    );
  }

  const nuevoTurnoAsistente: Turno = {
    rol: "assistant",
    texto: textoRespuesta || "No tengo una respuesta en este momento, ¿puedes reformular?",
    en: new Date().toISOString(),
  };

  const historialActualizado = [...historialPrevio, nuevoTurnoUsuario, nuevoTurnoAsistente];

  const { error: errorGuardado } = await supabaseAdmin.from("perfiles_financieros").upsert(
    {
      persona_id: sesion.personaId,
      [seccion.key]: historialActualizado,
      actualizado_en: new Date().toISOString(),
    },
    { onConflict: "persona_id" }
  );

  if (errorGuardado) {
    return NextResponse.json({ error: errorGuardado.message }, { status: 500 });
  }

  return NextResponse.json({ historial: historialActualizado });
}
