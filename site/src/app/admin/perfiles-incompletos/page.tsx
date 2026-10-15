"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/admin-auth-context";
import AdminNav from "@/components/AdminNav";

const colors = { violet: "#7568A8", night: "#17233D" };

interface PersonaIncompleta {
  id: string;
  nombre: string;
  telegram: string | null;
  tieneBot: boolean;
  faltantes: string[];
}

export default function AdminPerfilesIncompletosPage() {
  const { usuario, cargando, logout, fetchAutenticado } = useAdminAuth();
  const [personas, setPersonas] = useState<PersonaIncompleta[] | null>(null);
  const [totales, setTotales] = useState({ total: 0, incompletas: 0 });
  const [enviando, setEnviando] = useState<string | null>(null);
  const [avisos, setAvisos] = useState<Record<string, string>>({});

  const cargar = useCallback(async () => {
    const res = await fetchAutenticado("/api/admin/perfiles-incompletos");
    if (res.ok) {
      const data = await res.json();
      setPersonas(data.incompletas);
      setTotales({ total: data.totalPersonas, incompletas: data.totalIncompletas });
    }
  }, [fetchAutenticado]);

  useEffect(() => {
    if (usuario) cargar();
  }, [usuario, cargar]);

  async function recordar(id: string) {
    setEnviando(id);
    setAvisos((a) => ({ ...a, [id]: "" }));
    const res = await fetchAutenticado(`/api/admin/personas/${id}/recordar-perfil`, {
      method: "POST",
    });
    const data = await res.json().catch(() => ({}));
    setEnviando(null);
    setAvisos((a) => ({
      ...a,
      [id]: res.ok ? "Mensaje enviado ✓" : data.error ?? "No se pudo enviar.",
    }));
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
          Perfiles incompletos
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

        <p style={{ fontSize: 13, color: "rgba(23,35,61,.6)", marginBottom: 16 }}>
          {totales.incompletas} de {totales.total} personas tienen al menos un dato sin
          completar en su perfil. "N/A" escrito a propósito cuenta como completo — solo
          cuenta lo que está vacío.
        </p>

        <div style={{ display: "grid", gap: 10 }}>
          {personas === null && <p style={{ fontSize: 13 }}>Cargando…</p>}
          {personas !== null && personas.length === 0 && (
            <p style={{ fontSize: 13, color: "rgba(23,35,61,.55)" }}>
              ¡Todas las personas tienen su perfil completo!
            </p>
          )}
          {personas?.map((p) => (
            <div
              key={p.id}
              style={{
                background: "#fff",
                border: "1px solid rgba(23,35,61,.08)",
                borderRadius: 14,
                padding: "14px 16px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>
                    {p.nombre}{" "}
                    <span style={{ fontWeight: 400, color: "rgba(23,35,61,.5)" }}>
                      @{p.telegram}
                    </span>
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(23,35,61,.6)" }}>
                    Falta: {p.faltantes.join(", ")}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <button
                    onClick={() => recordar(p.id)}
                    disabled={enviando === p.id}
                    className="rp-boton"
                    style={{
                      borderRadius: 10,
                      padding: "8px 14px",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: enviando === p.id ? "default" : "pointer",
                      opacity: enviando === p.id ? 0.7 : 1,
                    }}
                  >
                    {enviando === p.id ? "Enviando…" : "Recordar por Telegram"}
                  </button>
                  {avisos[p.id] && (
                    <p style={{ margin: "6px 0 0", fontSize: 11, color: "rgba(23,35,61,.6)", maxWidth: 220 }}>
                      {avisos[p.id]}
                    </p>
                  )}
                  {!p.tieneBot && !avisos[p.id] && (
                    <p style={{ margin: "6px 0 0", fontSize: 11, color: "#854F0B" }}>
                      No activó el bot todavía
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
