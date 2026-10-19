import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireSession } from "@/lib/require-session";

// Exporta la lista de compras (con los mismos filtros que /api/admin/compras)
// como CSV — sin dependencias externas, Excel/Sheets lo abren directo.
function celda(valor: unknown): string {
  const texto = valor === null || valor === undefined ? "" : String(valor);
  if (/[",\n]/.test(texto)) {
    return `"${texto.replace(/"/g, '""')}"`;
  }
  return texto;
}

export async function GET(req: NextRequest) {
  const { sesion, respuesta } = await requireSession(req, [
    "superadmin",
    "admin",
    "verificador",
  ]);
  if (!sesion) return respuesta;

  const { searchParams } = new URL(req.url);
  const persona = searchParams.get("persona");
  const paquete = searchParams.get("paquete");
  const estado = searchParams.get("estado");

  let query = supabaseAdmin
    .from("compras")
    .select(
      "persona_nombre, persona_telegram, paquete, lider, participaciones, hash, estado, creada_en"
    )
    .order("creada_en", { ascending: false });

  if (persona) {
    query = query.or(
      `persona_nombre.ilike.%${persona}%,persona_telegram.ilike.%${persona}%`
    );
  }
  if (paquete) query = query.eq("paquete", paquete);
  if (estado) query = query.eq("estado", estado);

  if (sesion.rol === "verificador" && sesion.usuarioId) {
    const { data: cuenta } = await supabaseAdmin
      .from("usuarios")
      .select("paquetes_asignados")
      .eq("id", sesion.usuarioId)
      .maybeSingle();
    const asignados: string[] = cuenta?.paquetes_asignados ?? [];
    if (asignados.length > 0) query = query.in("paquete", asignados);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const encabezados = [
    "Nombre",
    "Telegram",
    "Paquete",
    "Colaboradora",
    "Participaciones",
    "Hash",
    "Estado",
    "Fecha",
  ];

  const filas = (data ?? []).map((c) =>
    [
      c.persona_nombre,
      c.persona_telegram,
      c.paquete,
      c.lider,
      c.participaciones,
      c.hash,
      c.estado,
      new Date(c.creada_en).toLocaleDateString("es-AR"),
    ]
      .map(celda)
      .join(",")
  );

  // BOM al inicio para que Excel detecte UTF-8 y muestre tildes/ñ bien.
  const csv = "﻿" + [encabezados.join(","), ...filas].join("\r\n");

  const nombreArchivo = `compras${paquete ? `-${paquete}` : ""}-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nombreArchivo}"`,
    },
  });
}
