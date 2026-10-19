import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/require-session";
import { anthropic } from "@/lib/anthropic";
import { verificarYRegistrarUsoIA } from "@/lib/limite-ia";
import type { MessageParam } from "@/lib/anthropic";
import { JURISDICCIONES_DISPONIBLES, CATEGORIAS_LEGALES } from "@/lib/legal-categorias";

interface TurnoRecibido {
  rol: "user" | "assistant";
  texto: string;
}

function construirSystemPromptLegal(jurisdiccionCodigo?: string, categoriaId?: string) {
  const jur = JURISDICCIONES_DISPONIBLES.find((j) => j.codigo === jurisdiccionCodigo) ?? JURISDICCIONES_DISPONIBLES[0];
  const cat = CATEGORIAS_LEGALES.find((c) => c.id === categoriaId);

  return `Eres un Consultor Jurídico Internacional y Asesor Legal de alto nivel en el Portal de Resonancia. Tu misión es brindar orientación e información jurídica estratégica, rigurosa y clara para personas, familias y directores de proyectos con patrimonios o iniciativas de impacto social y humanitario.

Contexto de la consulta:
- Jurisdicción principal: ${jur.nombre} (${jur.codigo})
${cat ? `- Área legal especializada: ${cat.titulo} (${cat.descripcion})` : "- Área: Consulta jurídica general / transversal"}

Pautas de respuesta:
1. Marco Legal y Normas Aplicables: Menciona con precisión las leyes, códigos, reglamentos o figuras jurídicas correspondientes en la jurisdicción seleccionada (o estándares internacionales/comparados si es global o internacional).
2. Análisis Estratégico: Explica las alternativas viables, las mejores prácticas de la industria legal y la forma habitual en que se estructuran estas operaciones (ej. fideicomisos/trusts, pactos de socios, contratos blindados, convenios preventivos).
3. Pasos y Documentación Sugerida: Enumera con claridad qué documentos, cláusulas o trámites preparatorios se requieren.
4. Advertencias Clave: Señala riesgos relevantes, plazos legales, aspectos fiscales conexos o contingencias a prevenir.
5. Descargo informativo: Incluye siempre al final un breve recordatorio: "Nota orientativa: Esta información tiene fines de orientación jurídica asistida por IA y no sustituye el asesoramiento o patrocinio formal de un abogado matriculado en la jurisdicción correspondiente."

Estilo y tono:
- Profesional, docto, sereno y accesible: No abrumes con jerga innecesaria sin explicar su significado e implicación práctica.
- Estructura limpia: Usa subtítulos cortos o viñetas para que la persona comprenda sus opciones de un vistazo.
- Si la persona no especifica su país o circunstancias, pregúntale amablemente qué jurisdicción aplica a su caso para afinar la respuesta.`;
}

export async function POST(req: NextRequest) {
  const { sesion, respuesta } = await requireSession(req, ["miembro"]);
  if (!sesion) return respuesta;
  if (!sesion.personaId) {
    return NextResponse.json({ error: "Sesión inválida." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const mensaje = typeof body?.mensaje === "string" ? body.mensaje.trim() : "";
  const jurisdiccion = typeof body?.jurisdiccion === "string" ? body.jurisdiccion : "GLOBAL";
  const categoria = typeof body?.categoria === "string" ? body.categoria : undefined;
  const historial: TurnoRecibido[] = Array.isArray(body?.historial) ? body.historial : [];

  if (!mensaje) {
    return NextResponse.json({ error: "Falta el mensaje." }, { status: 400 });
  }

  const { permitido } = await verificarYRegistrarUsoIA(sesion.personaId);
  if (!permitido) {
    return NextResponse.json(
      { error: "Llegaste al límite diario de consultas de orientación. Intenta de nuevo mañana." },
      { status: 429 }
    );
  }

  const mensajesParaGroq: MessageParam[] = [
    ...historial.slice(-6).map((t) => ({
      role: t.rol,
      content: t.texto,
    })),
    { role: "user", content: mensaje },
  ];

  try {
    const respuestaGroq = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1200,
      temperature: 0.3,
      system: construirSystemPromptLegal(jurisdiccion, categoria),
      messages: mensajesParaGroq,
    });

    let textoRespuesta = "";
    for (const bloque of respuestaGroq.content) {
      if (bloque.type === "text") textoRespuesta += bloque.text;
    }

    return NextResponse.json({
      ok: true,
      respuesta: textoRespuesta,
    });
  } catch (err) {
    console.error("Error en orientación legal:", err);
    return NextResponse.json(
      { error: "No se pudo procesar la consulta legal. Intenta de nuevo en unos momentos." },
      { status: 502 }
    );
  }
}
