import { google } from "googleapis"

export interface LeadRow {
  nombre: string
  empresa: string
  whatsapp: string
  email: string
  tipoNegocio: string
  reto: string
  agenda: string
}

/**
 * Autenticación con Service Account de Google.
 * Credenciales vienen de variables de entorno (nunca hardcodeadas).
 * GOOGLE_PRIVATE_KEY trae los saltos de línea escapados (\n) → se restauran.
 */
function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")

  if (!email || !key) {
    throw new Error(
      "Faltan credenciales de Google: GOOGLE_SERVICE_ACCOUNT_EMAIL y/o GOOGLE_PRIVATE_KEY"
    )
  }

  return new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  })
}

/**
 * Agrega un lead como nueva fila al Google Sheet.
 * Orden de columnas: Fecha | Nombre | Empresa | WhatsApp | Email | Tipo negocio | Reto principal | Agenda
 */
export async function appendLead(lead: LeadRow): Promise<void> {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID
  const tab = process.env.GOOGLE_SHEET_TAB || "Leads"

  if (!spreadsheetId) {
    throw new Error("Falta GOOGLE_SHEET_ID")
  }

  const sheets = google.sheets({ version: "v4", auth: getAuth() })
  const fecha = new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" })

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${tab}!A:H`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [
        [
          fecha,
          lead.nombre,
          lead.empresa,
          lead.whatsapp,
          lead.email,
          lead.tipoNegocio,
          lead.reto,
          lead.agenda,
        ],
      ],
    },
  })
}
