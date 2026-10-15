"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/admin-auth-context";
import AdminNav from "@/components/AdminNav";

const colors = { violet: "#7568A8", night: "#17233D" };

interface Mensaje {
  autor: "visitante" | "equipo";
  texto: string;
  fecha: string;
}

interface Conversacion {
  id: string;
  telegram: string;
  mensajes: Mensaje[];
  resuelto: boolean;
}

export default function AdminMensajesSinRegistrarPage() {
  const { usuario, cargando, logout, fetchAutenticado } = useAdminAuth();
  const [conversaciones, setConversaciones] = useState<Conversacion[] | null>(null);
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const [soloAbiertas, setSoloAbiertas] = useState(true);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);

  const cargar = useCallback(async () => {
    const params = soloAbiertas ? "?resuelto=false" : "";
    const res = await fetchAutenticado(`/api/admin/mensajes-sin-registrar${params}`);
    if (res.ok) setConversaciones((await res.json()).conversaciones);
  }, [fetchAutenticado, soloAbiertas]);

  useEffect(() => {
    if (usuario) cargar();
  }, [usuario, cargar]);

  const activa = conversaciones?.find((c) => c.id === seleccionada) ?? null;

  async function responder(e: React.FormEvent) {
    e.preventDefault();
    if (!seleccionada || !texto.trim()) return;
    setEnviando(true);
    const res = await fetchAutenticado(`/api/admin/mensajes-sin-registrar/${seleccionada}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto: texto.trim() }),
    });
    setEnviando(false);
    if (res.ok) {
      setTexto("");
      cargar();
    }
  }

  async function marcarResuelta(resuelto: boolean) {
    if (!seleccionada) return;
    await fetchAutenticado(`/api/admin/mensajes-sin-registrar/${seleccionada}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resuelto }),
    });
    cargar();
  }

  if (cargando || !usuario) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <p style={{ color: colors.night, fontFamily: "sans-serif" }}>Cargando…</p>
      </main>
    );
  }

  return (
    <main
      className="rp-bg-clean admin-ui"
      style={{
        minHeight: "100vh",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: colors.night,
        padding: "24px 20px 60px",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          maxWidth: 960,
          margin: "0 auto 12px",
        }}
      >
        <h1 className="rp-titulo" style={{ margin: 0, fontSize: 22 }}>
          Mensajes sin registrar
        </h1>
        <button
          onClick={logout}
          style={{
            padding: "8px 14px",
            borderRadius: 10,
            border: "none",
            background: colors.night,
            color: "#fff",
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          Cerrar sesión
        </button>
      </header>

      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <AdminNav rol={usuario.rol} />

        <p style={{ fontSize: 13, color: "rgba(23,35,61,.6)", marginBottom: 14 }}>
          Mensajes de gente que le escribió al bot pero todavía no está registrada.
        </p>

        <label style={{ fontSize: 12, display: "flex", gap: 6, alignItems: "center", marginBottom: 14 }}>
          <input
            type="checkbox"
            checked={soloAbiertas}
            onChange={(e) => setSoloAbiertas(e.target.checked)}
          />
          Solo abiertas
        </label>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 260px", display: "grid", gap: 8, alignContent: "start" }}>
            {conversaciones === null && <p style={{ fontSize: 13 }}>Cargando…</p>}
            {conversaciones !== null && conversaciones.length === 0 && (
              <p style={{ fontSize: 13, color: "rgba(23,35,61,.55)" }}>No hay mensajes.</p>
            )}
            {conversaciones?.map((c) => (
              <button
                key={c.id}
                onClick={() => setSeleccionada(c.id)}
                style={{
                  textAlign: "left",
                  background: c.id === seleccionada ? colors.violet : "#fff",
                  color: c.id === seleccionada ? "#fff" : colors.night,
                  border: "1px solid rgba(23,35,61,.08)",
                  borderRadius: 12,
                  padding: "10px 12px",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                <strong>@{c.telegram}</strong>
                <div style={{ fontSize: 11, opacity: 0.8 }}>{c.resuelto ? "resuelta" : "abierta"}</div>
              </button>
            ))}
          </div>

          <div
            style={{
              flex: "2 1 380px",
              background: "#fff",
              borderRadius: 16,
              padding: 16,
              minHeight: 300,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {!activa ? (
              <p style={{ fontSize: 13, color: "rgba(23,35,61,.5)" }}>
                Elegí una conversación de la izquierda.
              </p>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <strong style={{ fontSize: 14 }}>@{activa.telegram}</strong>
                  <button
                    onClick={() => marcarResuelta(!activa.resuelto)}
                    style={{
                      border: "1px solid rgba(23,35,61,.15)",
                      background: "transparent",
                      borderRadius: 8,
                      padding: "4px 10px",
                      fontSize: 11,
                      cursor: "pointer",
                    }}
                  >
                    {activa.resuelto ? "Reabrir" : "Marcar resuelta"}
                  </button>
                </div>

                <div style={{ flex: 1, display: "grid", gap: 8, overflowY: "auto", marginBottom: 10 }}>
                  {activa.mensajes.map((m, i) => (
                    <div
                      key={i}
                      style={{
                        alignSelf: m.autor === "equipo" ? "flex-end" : "flex-start",
                        background: m.autor === "equipo" ? colors.violet : "#EEE8FF",
                        color: m.autor === "equipo" ? "#fff" : colors.night,
                        borderRadius: 10,
                        padding: "6px 10px",
                        fontSize: 13,
                        maxWidth: "75%",
                      }}
                    >
                      {m.texto}
                    </div>
                  ))}
                </div>

                <form onSubmit={responder} style={{ display: "flex", gap: 8 }}>
                  <input
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    placeholder="Responder…"
                    style={{
                      flex: 1,
                      padding: "9px 12px",
                      borderRadius: 10,
                      border: "1px solid rgba(23,35,61,.15)",
                      fontSize: 13,
                    }}
                  />
                  <button
                    type="submit"
                    disabled={enviando}
                    className="rp-boton"
                    style={{
                      borderRadius: 10,
                      padding: "0 16px",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: enviando ? "default" : "pointer",
                    }}
                  >
                    Enviar
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
