import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { name, email, phone, company, service, message } = await req.json()

  if (!email || !name) {
    return NextResponse.json({ error: "Nombre y email requeridos" }, { status: 400 })
  }

  const apiKey = process.env.HUBSPOT_API_KEY
  if (!apiKey) {
    console.error("HUBSPOT_API_KEY no configurada")
    return NextResponse.json({ error: "Config error" }, { status: 500 })
  }

  const [firstname, ...rest] = name.trim().split(" ")
  const lastname = rest.join(" ") || ""

  // Concatenamos service+message en message si HubSpot no tiene la propiedad service custom
  const composedMessage = service
    ? `[${service}]\n\n${message || ""}`.trim()
    : message || ""

  const hsHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  }
  const properties = {
    firstname,
    lastname,
    email,
    phone: phone || "",
    company: company || "",
    message: composedMessage,
  }

  // HubSpot v3 CRM API — intenta crear; si email ya existe (409) actualiza
  let res = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
    method: "POST",
    headers: hsHeaders,
    body: JSON.stringify({ properties }),
  })

  if (res.status === 409) {
    const conflict = await res.json().catch(() => ({}))
    const existingId = conflict?.message?.match(/Existing ID:\s*(\d+)/)?.[1]
    if (existingId) {
      res = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${existingId}`, {
        method: "PATCH",
        headers: hsHeaders,
        body: JSON.stringify({ properties }),
      })
    }
  }

  const body = await res.json().catch(() => ({}))

  if (!res.ok) {
    console.error("HubSpot error:", res.status, JSON.stringify(body))
    return NextResponse.json({ error: "Error CRM", detail: body }, { status: 500 })
  }

  console.log("HubSpot contact upserted:", body.id || body.vid)
  return NextResponse.json({ ok: true })
}
