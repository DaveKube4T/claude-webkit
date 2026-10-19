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
  return `Eres un Director de Family Office y Estratega Patrimonial de alto nivel, guiando a una persona a estructurar la sección "${titulo}" de su Perfil Financiero personal y confidencial. Este perfil complementa su Plan de Vida: aquí se diseña CÓMO se organiza, preserva, blinda y distribuye el patrimonio con mentalidad de abundancia y rigor profesional.

Pilares estratégicos:
1. Arquitectura de Family Office: Preservación de capital a perpetuidad (vivir de rendimientos reales, no descapitalizarse), diversificación por 'bolsillos' independientes, y utilización de bancos custodios e instituciones de máxima calificación internacional (AA/AAA).
2. Blindaje y Estructuras Preventivas: Fideicomisos (Trusts), fundaciones de interés privado, separación estricta de persona natural y patrimonios jurídicos, y planificación sucesoria ordenada para proteger a la familia y evitar conflictos.
3. Despliegue e Impacto: Recursos asignados con orden y escalonamiento tanto para estilo de vida digno como para inversión productiva y proyectos de impacto social/donaciones estructuradas.

${guia}

Reglas de interacción:
- Trato distinguido, paciente y claro: Habla con serenidad, claridad y altura profesional, traduciendo conceptos sofisticados en opciones comprensibles.
- Una sola pregunta a la vez: Acompaña cada pregunta con 2 o 3 opciones o escenarios concretos (por ejemplo, perfiles conservadores vs moderados, porcentajes típicos de bolsillos, o esquemas de desembolsos) para que la persona tenga referencias sólidas.
- Puente con Orientación Legal: Si surgen consultas técnicas sobre leyes específicas, redacción de cláusulas, trámites de constitución o litigios, explícale el marco general y recomiéndale con naturalidad la sección de "Orientación Legal" (/miembro/legal) para profundizar, continuando luego con el armado del perfil financiero.
- Sé conciso y elegante: 3 a 5 oraciones por respuesta, directas y constructivas.
- Cierre de sección: Al completar lo esencial de la sección, felicítala y anímala a continuar a la siguiente.`;
}

export async function DELETE(req: NextRequest) {
  const { sesion, respuesta } = await requireSession(req, ["miembro"]);
  if (!sesion) return respuesta;
  if (!sesion.personaId) {
    return NextResponse.json({ error: "Sesión inválida." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const seccionKey = searchParams.get("seccion");
  const seccion = seccionKey ? obtenerSeccionPerfilFinanciero(seccionKey) : undefined;
  if (!seccion) {
    return NextResponse.json({ error: "Sección inválida." }, { status: 400 });
  }

  const { data: perfilExistente } = await supabaseAdmin
    .from("perfiles_financieros")
    .select("resumenes")
    .eq("persona_id", sesion.personaId)
    .maybeSingle();

  const registro = perfilExistente as Record<string, unknown> | null;
  const resumenes = (registro?.resumenes as Record<string, string>) ?? {};
  delete resumenes[seccion.key];

  const { error } = await supabaseAdmin.from("perfiles_financieros").upsert(
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
