import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireSession } from "@/lib/require-session";

export async function GET(req: NextRequest) {
  const { sesion, respuesta } = await requireSession(req, ["superadmin", "admin"]);
  if (!sesion) return respuesta;

  const { data, error } = await supabaseAdmin
    .from("compras")
    .select("id, persona_nombre, persona_telegram, paquete, pago_inversion")
    .not("pago_inversion", "eq", "[]");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const pagos = (data ?? [])
    .flatMap((c) =>
      (Array.isArray(c.pago_inversion) ? c.pago_inversion : []).map(
        (p: { monto: number; nota: string | null; registrado_por_nombre: string; creado_en: string }) => ({
          compraId: c.id,
          persona_nombre: c.persona_nombre,
          persona_telegram: c.persona_telegram,
          paquete: c.paquete,
          monto: p.monto,
          nota: p.nota,
          registrado_por_nombre: p.registrado_por_nombre,
          creado_en: p.creado_en,
        })
      )
    )
    .sort((a, b) => new Date(b.creado_en).getTime() - new Date(a.creado_en).getTime());

  const total = pagos.reduce((acc, p) => acc + p.monto, 0);

  return NextResponse.json({ pagos, total });
}
