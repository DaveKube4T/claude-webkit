import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireSession } from "@/lib/require-session";

export async function GET(req: NextRequest) {
  const { sesion, respuesta } = await requireSession(req, [
    "superadmin",
    "admin",
    "verificador",
  ]);
  if (!sesion) return respuesta;

  const { data, error } = await supabaseAdmin
    .from("personas")
    .select(
      "id, nombre, telegram, telegram_chat_id, apellidos, signal, documento, pasaporte, mail, mail_alternativo, telefono, telefono_alternativo, wallet_trc20, ciudad, provincia_estado, pais"
    )
    .order("nombre", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Mismos campos que se muestran/editan en /miembro/perfil — "N/A" escrito a
  // propósito cuenta como completo, solo lo vacío/null falta.
  const CAMPOS: { key: keyof NonNullable<typeof data>[number]; label: string }[] = [
    { key: "apellidos", label: "Apellidos" },
    { key: "signal", label: "Usuario de Signal" },
    { key: "documento", label: "Documento" },
    { key: "pasaporte", label: "Pasaporte" },
    { key: "mail", label: "Mail" },
    { key: "mail_alternativo", label: "Mail alternativo" },
    { key: "telefono", label: "Teléfono" },
    { key: "telefono_alternativo", label: "Teléfono alternativo" },
    { key: "wallet_trc20", label: "Wallet TRC20" },
    { key: "ciudad", label: "Ciudad" },
    { key: "provincia_estado", label: "Provincia / Estado" },
    { key: "pais", label: "País" },
  ];

  const incompletas = (data ?? [])
    .map((p) => {
      const faltantes = CAMPOS.filter((c) => {
        const valor = p[c.key];
        return typeof valor !== "string" || valor.trim() === "";
      }).map((c) => c.label);
      return {
        id: p.id,
        nombre: p.nombre,
        telegram: p.telegram,
        tieneBot: Boolean(p.telegram_chat_id),
        faltantes,
      };
    })
    .filter((p) => p.faltantes.length > 0);

  return NextResponse.json({
    incompletas,
    totalPersonas: data?.length ?? 0,
    totalIncompletas: incompletas.length,
  });
}
