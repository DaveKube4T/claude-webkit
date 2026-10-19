"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAdminAuth } from "@/lib/admin-auth-context";
import AdminNav from "@/components/AdminNav";

const colors = { violet: "#7568A8", night: "#17233D" };

const ROL_LABEL: Record<string, string> = {
  superadmin: "Admin",
  admin: "Admin",
  verificador: "Verificadora",
};

interface MensajeEquipo {
  id: string;
  autor: string;
  rol: string;
  texto: string;
  creado_en: string;
}

export default function AdminEquipoPage() {
  const { usuario, cargando, logout, fetchAutenticado } = useAdminAuth();
  const [mensajes, setMensajes] = useState<MensajeEquipo[] | null>(null);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const finRef = useRef<HTMLDivElement>(null);

  const cargar = useCallback(async () => {
    const res = await fetchAutenticado("/api/admin/mensajes-equipo");
    if (res.ok) setMensajes((await res.json()).mensajes);
  }, [fetchAutenticado]);

  useEffect(() => {
    if (!usuario) return;
    cargar();
    const intervalo = setInterval(cargar, 8000);
    return () => clearInterval(intervalo);
  }, [usuario, cargar]);

  useEffect(() => {
    finRef.current?.scrollIntoView({ block: "end" });
  }, [mensajes]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!texto.trim()) return;
    setEnviando(true);
    const res = await fetchAutenticado("/api/admin/mensajes-equipo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto: texto.trim() }),
    });
    setEnviando(false);
    if (res.ok) {
      setTexto("");
      cargar();
    }
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
          maxWidth: 720,
          margin: "0 auto 12px",
        }}
      >
        <h1 className="rp-titulo" style={{ margin: 0, fontSize: 22 }}>Chat del equipo</h1>
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

      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <AdminNav rol={usuario.rol} />

        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 16,
            minHeight: 420,
            maxHeight: 560,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ flex: 1, display: "grid", gap: 8, overflowY: "auto", marginBottom: 10 }}>
            {mensajes === null && <p style={{ fontSize: 13 }}>Cargando…</p>}
            {mensajes !== null && mensajes.length === 0 && (
              <p style={{ fontSize: 13, color: "rgba(23,35,61,.55)" }}>
                Todavía no hay mensajes. Escribí el primero.
              </p>
            )}
            {mensajes?.map((m) => {
              const esMio = m.autor === usuario.nombre;
              return (
                <div
                  key={m.id}
                  style={{
                    alignSelf: esMio ? "flex-end" : "flex-start",
                    maxWidth: "80%",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(23,35,61,.55)",
                      marginBottom: 2,
                      textAlign: esMio ? "right" : "left",
                    }}
                  >
                    {m.autor} · {ROL_LABEL[m.rol] ?? m.rol}
                  </div>
                  <div
                    style={{
                      background: esMio ? colors.violet : "#EEE8FF",
                      color: esMio ? "#fff" : colors.night,
                      borderRadius: 10,
                      padding: "6px 10px",
                      fontSize: 13,
                    }}
                  >
                    {m.texto}
                  </div>
                </div>
              );
            })}
            <div ref={finRef} />
          </div>

          <form onSubmit={enviar} style={{ display: "flex", gap: 8 }}>
            <input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Escribí un mensaje al equipo…"
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
                cursor: "pointer",
              }}
            >
              Enviar
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
