"use client";

import { useCallback, useEffect, useState } from "react";
import { useMemberAuth } from "@/lib/member-auth-context";
import MemberBottomNav from "@/components/MemberBottomNav";

const colors = { night: "#17233D", violet: "#7568A8" };

interface Persona {
  telegram: string;
  tiene_bot?: boolean;
  nombre: string;
  apellidos: string | null;
  documento: string | null;
  pasaporte: string | null;
  wallet_trc20: string | null;
  calle: string | null;
  numero: string | null;
  ciudad: string | null;
  provincia_estado: string | null;
  pais: string | null;
  zip_code: string | null;
  telefono: string | null;
  telefono_alternativo: string | null;
  mail: string | null;
  mail_alternativo: string | null;
  signal: string | null;
}

type CampoEditable = Exclude<keyof Persona, "telegram" | "tiene_bot">;

const CAMPOS: { key: CampoEditable; label: string }[] = [
  { key: "nombre", label: "Nombre" },
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
  { key: "zip_code", label: "Código postal" },
];

function inputStyle(): React.CSSProperties {
  return {
    width: "100%",
    padding: "9px 11px",
    borderRadius: 10,
    border: "1px solid rgba(23,35,61,.15)",
    fontSize: 13,
    marginTop: 4,
    background: "#fff",
  };
}

export default function PerfilPage() {
  const { miembro, cargando, logout, fetchAutenticado } = useMemberAuth();
  const [persona, setPersona] = useState<Persona | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    const res = await fetchAutenticado("/api/miembro/perfil");
    if (res.ok) {
      const data = await res.json();
      setPersona(data.persona);
    }
  }, [fetchAutenticado]);

  useEffect(() => {
    if (miembro) cargar();
  }, [miembro, cargar]);

  function actualizarCampo(key: keyof Persona, valor: string) {
    setPersona((p) => (p ? { ...p, [key]: valor } : p));
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!persona) return;
    setGuardando(true);
    setAviso(null);
    const { telegram: _telegram, tiene_bot: _tiene_bot, ...cambios } = persona;
    void _telegram;
    void _tiene_bot;
    const res = await fetchAutenticado("/api/miembro/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cambios),
    });
    setGuardando(false);
    if (res.ok) {
      setAviso("Datos guardados.");
      cargar();
    } else {
      const data = await res.json();
      setAviso(data.error ?? "No se pudo guardar.");
    }
  }

  if (cargando || !miembro || !persona) {
    return (
      <main className="rp-bg-clean" style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <p style={{ color: colors.night, fontFamily: "sans-serif" }}>Cargando…</p>
      </main>
    );
  }

  const completados = CAMPOS.filter((c) => (persona[c.key] ?? "").toString().trim()).length;
  const totalCampos = CAMPOS.length;
  const faltanCampos = totalCampos - completados;

  return (
    <main
      className="rp-bg-clean"
      style={{
        minHeight: "100vh",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: colors.night,
        padding: "28px 18px 100px",
      }}
    >
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div>
            <h1 className="rp-titulo" style={{ margin: 0, fontSize: 20 }}>Mi perfil</h1>
          </div>
          <button
            onClick={logout}
            style={{
              border: "1px solid rgba(23,35,61,.15)",
              background: "rgba(255,255,255,.7)",
              borderRadius: 10,
              padding: "8px 14px",
              fontSize: 12,
              cursor: "pointer",
              color: colors.night,
            }}
          >
            Cerrar sesión
          </button>
        </div>

        <p style={{ fontSize: 12, color: "rgba(23,35,61,.55)", marginBottom: 10 }}>
          Completá todos los campos. Si no tenés un dato, escribí N/A.
        </p>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11.5,
            fontWeight: 700,
            padding: "6px 10px",
            borderRadius: 999,
            marginBottom: 14,
            color: faltanCampos > 0 ? "#854F0B" : "#3B6D11",
            background: faltanCampos > 0 ? "#FAEEDA" : "#EAF3DE",
          }}
        >
          {faltanCampos > 0 ? `⚠ Completitud: ${completados}/${totalCampos}` : `✓ Completitud: ${totalCampos}/${totalCampos}`}
        </div>

        {persona.tiene_bot ? (
          <div
            style={{
              background: "#EAF3DE",
              border: "1px solid #C0DD9D",
              borderRadius: 14,
              padding: "10px 14px",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>✅</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#27500A" }}>
                  Bot de Telegram vinculado
                </div>
                <div style={{ fontSize: 11, color: "#3B6D11" }}>
                  Recibís avisos de compras y respuestas del equipo en tu Telegram.
                </div>
              </div>
            </div>
            <a
              href="https://t.me/VerificacionesResonanciaBot"
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#27500A",
                textDecoration: "underline",
                whiteSpace: "nowrap",
              }}
            >
              Abrir bot
            </a>
          </div>
        ) : (
          <div
            style={{
              background: "linear-gradient(135deg, rgba(117,104,168,.12), rgba(38,58,99,.08))",
              border: "1px solid rgba(117,104,168,.3)",
              borderRadius: 14,
              padding: "12px 14px",
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 18 }}>🤖</span>
              <strong style={{ fontSize: 13, color: colors.night }}>
                Activá las notificaciones en Telegram
              </strong>
            </div>
            <p style={{ fontSize: 12, color: "rgba(23,35,61,.75)", margin: "0 0 10px", lineHeight: 1.4 }}>
              Para recibir avisos cuando se verifiquen tus paquetes o cuando el equipo te responda consultas, enlazá tu cuenta con nuestro Bot oficial:
            </p>
            <a
              href="https://t.me/VerificacionesResonanciaBot"
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "#2AABEE",
                color: "#fff",
                padding: "8px 14px",
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <span>👉 Abrir @VerificacionesResonanciaBot y tocar "Iniciar"</span>
            </a>
          </div>
        )}

        <form
          onSubmit={guardar}
          style={{
            background: "rgba(255,255,255,.8)",
            borderRadius: 18,
            padding: "16px",
            display: "grid",
            gap: 12,
          }}
        >
          <label style={{ fontSize: 12, fontWeight: 600 }}>
            Nombre{!persona.nombre?.trim() && <span style={{ color: "#C7881B" }}> ⚠</span>}
            <input
              value={persona.nombre}
              onChange={(e) => actualizarCampo("nombre", e.target.value)}
              required
              style={inputStyle()}
            />
          </label>
          <label style={{ fontSize: 12, fontWeight: 600 }}>
            Apellidos{!persona.apellidos?.trim() && <span style={{ color: "#C7881B" }}> ⚠</span>}
            <input
              value={persona.apellidos ?? ""}
              onChange={(e) => actualizarCampo("apellidos", e.target.value)}
              required
              style={inputStyle()}
            />
          </label>
          <label style={{ fontSize: 12, fontWeight: 600 }}>
            Usuario de Telegram
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
              <input
                value={`@${persona.telegram}`}
                disabled
                style={{ ...inputStyle(), marginTop: 0, opacity: 0.6, cursor: "not-allowed", flex: 1 }}
              />
              <a
                href="https://t.me/VerificacionesResonanciaBot"
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: persona.tiene_bot ? "#3B6D11" : "#2AABEE",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: persona.tiene_bot ? "1px solid #C0DD9D" : "1px solid #2AABEE",
                  background: persona.tiene_bot ? "#EAF3DE" : "rgba(42,171,238,.08)",
                }}
              >
                {persona.tiene_bot ? "✓ Vinculado" : "Conectar bot"}
              </a>
            </div>
          </label>

          {CAMPOS.filter((c) => c.key !== "nombre" && c.key !== "apellidos").map((c) => (
            <label key={c.key} style={{ fontSize: 12, fontWeight: 600 }}>
              {c.label}{!(persona[c.key] ?? "").toString().trim() && <span style={{ color: "#C7881B" }}> ⚠</span>}
              <input
                value={persona[c.key] ?? ""}
                onChange={(e) => actualizarCampo(c.key, e.target.value)}
                required
                style={inputStyle()}
              />
            </label>
          ))}

          {aviso && <p style={{ margin: 0, fontSize: 12, color: colors.violet }}>{aviso}</p>}

          <button
            type="submit"
            disabled={guardando}
            className="rp-boton"
            style={{
              marginTop: 4,
              padding: "12px 14px",
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 700,
              cursor: guardando ? "default" : "pointer",
              opacity: guardando ? 0.7 : 1,
            }}
          >
            {guardando ? "Guardando…" : "Guardar cambios"}
          </button>
        </form>
      </div>
      <MemberBottomNav />
    </main>
  );
}
