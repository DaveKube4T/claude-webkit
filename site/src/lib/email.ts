import { Resend } from "resend";

const FROM_DEFAULT = "Resonancia Global <codigo@resonanciaverificaciones.com>";

let cliente: Resend | null = null;

function getCliente() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY no está configurada todavía en .env.local."
    );
  }
  if (!cliente) cliente = new Resend(apiKey);
  return cliente;
}

export async function enviarCodigoLogin(destinatario: string, codigo: string) {
  const resend = getCliente();
  const from = process.env.RESEND_FROM_EMAIL || FROM_DEFAULT;

  const { error } = await resend.emails.send({
    from,
    to: destinatario,
    subject: "Tu código de acceso — Resonancia Global",
    html: `
      <div style="font-family: Georgia, 'Times New Roman', serif; color: #17233D; max-width: 420px; margin: 0 auto; padding: 24px;">
        <p style="font-size: 13px; letter-spacing: .18em; color: #7568A8; font-weight: bold;">RESONANCIA GLOBAL</p>
        <h1 style="font-size: 20px; font-weight: 400;">Tu código de acceso</h1>
        <p style="font-size: 14px; line-height: 1.5;">Usá este código para entrar al Portal de Verificación. Vale por 10 minutos.</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: .12em; color: #263A63; margin: 20px 0;">${codigo}</p>
        <p style="font-size: 12px; color: rgba(23,35,61,.6);">Si no pediste este código, podés ignorar este mensaje.</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Resend no pudo enviar el email: ${error.message}`);
  }
}
