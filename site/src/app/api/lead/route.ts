import { NextRequest, NextResponse } from "next/server"
import { appendLead } from "@/lib/sheets"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  let body: Record<string, string>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }

  const nombre = (body.nombre || "").trim()
  const whatsapp = (body.whatsapp || "").trim()
  const email = (body.email || "").trim()
  const tipoNegocio = (body.tipoNegocio || "").trim()

  if (!nombre || !whatsapp || !email || !tipoNegocio) {
    return NextResponse.json(
      { error: "Nombre, WhatsApp, email y tipo de negocio son requeridos" },
      { status: 400 }
    )
  }

  try {
    await appendLead({
      nombre,
      empresa: (body.empresa || "").trim(),
      whatsapp,
      email,
      tipoNegocio,
      reto: (body.reto || "").trim(),
      agenda: (body.agenda || "").trim(),
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Lead → Sheets error:", err)
    return NextResponse.json({ error: "No se pudo guardar el lead" }, { status: 500 })
  }
}
