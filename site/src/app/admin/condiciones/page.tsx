"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/admin-auth-context";
import AdminNav from "@/components/AdminNav";

const colors = { violet: "#7568A8", night: "#17233D" };

const ESTADO_ESTILO: Record<string, { color: string; fondo: string; label: string }> = {
  pendiente: { color: "#854F0B", fondo: "#FAEEDA", label: "Pendiente" },
  verificada: { color: "#3B6D11", fondo: "#EAF3DE", label: "Verificada" },
  rechazada: { color: "#A32D2D", fondo: "#FCEBEB", label: "Rechazada" },
  error_reportado: { color: "#A32D2D", fondo: "#FCEBEB", label: "Error reportado" },
};

interface CompraConCondicion {
  id: string;
  persona_nombre: string | null;
  persona_telegram: string | null;
  paquete: string;
  estado: string;
  condicion_especial: string;
  creada_en: string;
}

export default function AdminCondicionesPage() {
  const { usuario, cargando, logout, fetchAutenticado } = useAdminAuth();
  const [compras, setCompras] = useState<CompraConCondicion[] | null>(null);
  const [busqueda, setBusqueda] = useState("");

  const cargar = useCallback(async () => {
    const params = busqueda ? `?q=${encodeURIComponent(busqueda)}` : "";
    const res = await fetchAutenticado(`/api/admin/condiciones-especiales${params}`);
    if (res.ok) setCompras((await res.json()).compras);
  }, [fetchAutenticado, busqueda]);

  useEffect(() => {
    if (!usuario) return;
    const t = setTimeout(cargar, 300);
    return () => clearTimeout(t);
  }, [usuario, cargar]);

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
          Condiciones especiales
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

        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por persona, Telegram o texto de la condición…"
          style={{
            width: "100%",
            maxWidth: 420,
            marginBottom: 16,
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid rgba(23,35,61,.15)",
            fontSize: 13,
            background: "#fff",
          }}
        />

        <div style={{ display: "grid", gap: 10 }}>
          {compras === null && <p style={{ fontSize: 13 }}>Cargando…</p>}
          {compras !== null && compras.length === 0 && (
            <p style={{ fontSize: 13, color: "rgba(23,35,61,.55)" }}>
              No hay compras con condición especial cargada.
            </p>
          )}
          {compras?.map((c) => {
            const estilo = ESTADO_ESTILO[c.estado] ?? ESTADO_ESTILO.pendiente;
            return (
              <div
                key={c.id}
                style={{
                  background: "#fff",
                  border: "1px solid rgba(23,35,61,.08)",
                  borderRadius: 14,
                  padding: "14px 16px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>
                    {c.persona_nombre ?? "—"}{" "}
                    <span style={{ fontWeight: 400, color: "rgba(23,35,61,.5)" }}>
                      @{c.persona_telegram}
                    </span>
                  </p>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: estilo.color,
                      background: estilo.fondo,
                      padding: "4px 10px",
                      borderRadius: 999,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {estilo.label}
                  </span>
                </div>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(23,35,61,.6)" }}>
                  {c.paquete}
                </p>
                <p style={{ margin: "8px 0 0", fontSize: 13, lineHeight: 1.5 }}>
                  {c.condicion_especial}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
