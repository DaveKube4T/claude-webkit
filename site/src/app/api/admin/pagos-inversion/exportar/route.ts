import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireSession } from "@/lib/require-session";

function celda(valor: unknown): string {
  const texto = valor === null || valor === undefined ? "" : String(valor);
  if (/[",\n]/.test(texto)) {
    return `"${texto.replace(/"/g, '""')}"`;
  }
  return texto;
}

export async function GET(req: NextRequest) {
  const { sesion, respuesta } = await requireSession(req, ["superadmin", "admin"]);
  if (!sesion) return respuesta;

  const { data, error } = await supabaseAdmin
    .from("compras")
    .select("persona_nombre, persona_telegram, paquete, pago_inversion")
    .not("pago_inversion", "eq", "[]");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  interface Pago {
    monto: number;
    nota: string | null;
    registrado_por_nombre: string;
    creado_en: string;
  }

  const pagos = (data ?? [])
    .flatMap((c) =>
      (Array.isArray(c.pago_inversion) ? (c.pago_inversion as Pago[]) : []).map((p) => ({
        persona_nombre: c.persona_nombre,
        persona_telegram: c.persona_telegram,
        paquete: c.paquete,
        monto: p.monto,
        nota: p.nota,
        registrado_por_nombre: p.registrado_por_nombre,
        creado_en: p.creado_en,
      }))
    )
    .sort((a, b) => new Date(b.creado_en).getTime() - new Date(a.creado_en).getTime());

  const encabezados = ["Nombre", "Telegram", "Paquete", "Monto", "Nota", "Registrado por", "Fecha"];

  const filas = pagos.map((p) =>
    [
      p.persona_nombre,
      p.persona_telegram,
      p.paquete,
      p.monto,
      p.nota,
      p.registrado_por_nombre,
      new Date(p.creado_en).toLocaleDateString("es-AR"),
    ]
      .map(celda)
      .join(",")
  );

  const csv = "﻿" + [encabezados.join(","), ...filas].join("\r\n");

  const nombreArchivo = `pagos-inversion-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nombreArchivo}"`,
    },
  });
}
