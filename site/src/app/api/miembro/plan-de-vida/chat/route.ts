import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireSession } from "@/lib/require-session";
import { anthropic } from "@/lib/anthropic";
import { obtenerSeccion } from "@/lib/plan-de-vida-secciones";
import { verificarYRegistrarUsoIA } from "@/lib/limite-ia";
import type { MessageParam } from "@/lib/anthropic";   
interface Turno {
  rol: "user" | "assistant";
  texto: string;
  en: string;
}

function construirSystemPrompt(titulo: string, guia: string) {
  return `Eres una guía cálida, paciente y clara que ayuda a una persona —muchas veces sin experiencia en temas financieros— a completar la sección "${titulo}" de su Plan de Vida personal y confidencial.

${guia}

Reglas:
- Hazle una sola pregunta a la vez, en español sencillo, sin tecnicismos.
- Mucha gente no va a tener ideas propias todavía — no esperes a que se queden en blanco. Ofrece tú 2-3 ejemplos concretos y variados junto con cada pregunta (como opciones para elegir, inspirarse o decir "ninguna de esas, pero algo parecido a..."), para que nunca sientan la hoja en blanco.
- Si la persona dice "no sé", "no se me ocurre" o similar, no insistas con la misma pregunta — dale ejemplos todavía más simples y concretos, o sugiere que lo deje así por ahora y puede volver después.
- Nunca dés asesoría financiera, legal o de inversión concreta — esto es solo para que ella organice sus propias ideas y valores, no para ejecutar nada.
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

  const seccion = seccionKey ? obtenerSeccion(seccionKey) : undefined;
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

  const { data: planExistente, error: errorLectura } = await supabaseAdmin
    .from("planes_vida")
    .select(`id, ${seccion.key}`)
    .eq("persona_id", sesion.personaId)
    .maybeSingle();

  if (errorLectura) {
    return NextResponse.json({ error: errorLectura.message }, { status: 500 });
  }

  const historialPrevio: Turno[] = Array.isArray(
    (planExistente as Record<string, unknown> | null)?.[seccion.key]
  )
    ? ((planExistente as Record<string, unknown>)[seccion.key] as Turno[])
    : [];

  const nuevoTurnoUsuario: Turno = {
    rol: "user",
    texto: mensaje,
    en: new Date().toISOString(),
  };

const mensajesParaClaude: MessageParam[] = [       ...historialPrevio.map((t) => ({
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
    console.error("Error detallado llamando a Groq (Plan de Vida):", err?.message || err);
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

  const { error: errorGuardado } = await supabaseAdmin.from("planes_vida").upsert(
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
