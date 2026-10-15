import { randomBytes, randomInt, createHash } from "crypto";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "./supabase";

export type Rol = "superadmin" | "admin" | "verificador" | "miembro";

export interface SesionValida {
  rol: Rol;
  usuarioId: string | null;
  personaId: string | null;
}

const SESSION_TTL_HORAS = 24 * 7; // 7 días

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verificarPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function generarToken() {
  return randomBytes(32).toString("hex");
}

// Código de un solo uso (login de primera vez por mail, ver PROYECTO-RESONANCIA.md
// sección "Login, recuperación y representantes"). Se guarda hasheado en
// personas.codigo_recuperacion, nunca en texto plano.
export function generarCodigoOtp() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function hashCodigoOtp(codigo: string) {
  return createHash("sha256").update(codigo).digest("hex");
}

export function ocultarEmail(mail: string) {
  const [usuario, dominio] = mail.split("@");
  if (!dominio) return mail;
  const visible = usuario.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(usuario.length - 2, 2))}@${dominio}`;
}

export async function crearSesion(params: {
  rol: Rol;
  usuarioId?: string;
  personaId?: string;
}) {
  const token = generarToken();
  const expiraEn = new Date(Date.now() + SESSION_TTL_HORAS * 60 * 60 * 1000);

  const { error } = await supabaseAdmin.from("sesiones").insert({
    token,
    rol: params.rol,
    usuario_id: params.usuarioId ?? null,
    persona_id: params.personaId ?? null,
    expira_en: expiraEn.toISOString(),
  });

  if (error) throw error;

  return { token, expiraEn };
}

export async function verificarSesion(
  token: string | null
): Promise<SesionValida | null> {
  if (!token) return null;

  const { data, error } = await supabaseAdmin
    .from("sesiones")
    .select("rol, usuario_id, persona_id, expira_en")
    .eq("token", token)
    .single();

  if (error || !data) return null;
  if (new Date(data.expira_en).getTime() < Date.now()) return null;

  return {
    rol: data.rol as Rol,
    usuarioId: data.usuario_id,
    personaId: data.persona_id,
  };
}
