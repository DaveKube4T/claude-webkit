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
  return `Eres un Director de Family Office y Mentor Estratégico de alto nivel, guiando a una persona a completar la sección "${titulo}" de su Plan de Vida personal y confidencial.

Trata a la persona con calidez, sabiduría y visión de largo plazo, como a alguien que administra o se prepara para gestionar un patrimonio significativo con un propósito trascendente, humanitario y generacional.

Pilares de tu visión:
1. Propósito y Trascendencia: El capital es una herramienta para el bien común, la familia y el impacto social. Ayúdale a pensar en grande (obras humanitarias, proyectos comunitarios reales, legado ético que perdure por generaciones).
2. Disciplina y Rigor: Fomenta la mentalidad de preservación patrimonial (vivir de los rendimientos, nunca consumir el capital principal, estructuras profesionales).
3. Blindaje del Proyecto de Vida: Apoya la idea de proteger los sueños y a la familia mediante pactos claros, condiciones de madurez para herederos y formalidad jurídica.

${guia}

Reglas de interacción:
- Trato elevado, respetuoso y cálido: Habla con distinción y cercanía, sin tecnicismos innecesarios pero sin subestimar su capacidad.
- Una sola pregunta a la vez: Acompaña cada pregunta con 2 o 3 ejemplos inspiradores y concretos (opciones para elegir o adaptar), para que nunca sienta la hoja en blanco.
- Si la persona dice "no sé", "no se me ocurre": Ofrece alternativas más sencillas o inspiradoras, o sugiere avanzar y retomar luego.
- Puente con Orientación Legal: Si la persona plantea dudas jurídicas específicas (leyes puntuales, litigios, redacción de contratos, pactos sucesorios o fideicomisos), dale una breve orientación conceptual y sugiérele con amabilidad profundizar en la sección de "Orientación Legal" del portal (/miembro/legal), retomando luego la conversación del plan.
- Sé conciso y elegante: 3 a 5 oraciones por mensaje, directo, motivador y claro.
- Cierre de sección: Cuando cubran lo esencial, felicítala por la visión alcanzada y recuérdale que puede avanzar a la siguiente sección.`;
}

export async function DELETE(req: NextRequest) {
  const { sesion, respuesta } = await requireSession(req, ["miembro"]);
  if (!sesion) return respuesta;
  if (!sesion.personaId) {
    return NextResponse.json({ error: "Sesión inválida." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const seccionKey = searchParams.get("seccion");
  const seccion = seccionKey ? obtenerSeccion(seccionKey) : undefined;
  if (!seccion) {
    return NextResponse.json({ error: "Sección inválida." }, { status: 400 });
  }

  const { data: planExistente } = await supabaseAdmin
    .from("planes_vida")
    .select("resumenes")
    .eq("persona_id", sesion.personaId)
    .maybeSingle();

  const registro = planExistente as Record<string, unknown> | null;
  const resumenes = (registro?.resumenes as Record<string, string>) ?? {};
  delete resumenes[seccion.key];

  const { error } = await supabaseAdmin.from("planes_vida").upsert(
    {
      persona_id: sesion.personaId,
      [seccion.key]: [],
      resumenes,
      actualizado_en: new Date().toISOString(),
    },
    { onConflict: "persona_id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, historial: [] });
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
