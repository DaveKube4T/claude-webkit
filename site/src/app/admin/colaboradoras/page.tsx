"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/admin-auth-context";
import AdminNav from "@/components/AdminNav";

const colors = { violet: "#7568A8", night: "#17233D" };

interface Colaboradora {
  nombre: string;
  total: number;
  verificadas: number;
  porcentaje: number;
}

export default function AdminColaboradorasPage() {
  const { usuario, cargando, logout, fetchAutenticado } = useAdminAuth();
  const [colaboradoras, setColaboradoras] = useState<Colaboradora[] | null>(null);
  const [sinColaboradora, setSinColaboradora] = useState(0);

  const cargar = useCallback(async () => {
    const res = await fetchAutenticado("/api/admin/analytics-colaboradoras");
    if (res.ok) {
      const data = await res.json();
      setColaboradoras(data.colaboradoras);
      setSinColaboradora(data.sinColaboradora);
    }
  }, [fetchAutenticado]);

  useEffect(() => {
    if (usuario) cargar();
  }, [usuario, cargar]);

  if (cargando || !usuario) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <p style={{ color: colors.night, fontFamily: "sans-serif" }}>Cargando…</p>
      </main>
    );
  }

  const max = colaboradoras?.[0]?.total ?? 1;

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
          Colaboradoras
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
          % de compras por colaboradora, de más a menos activa.
          {sinColaboradora > 0 && ` (${sinColaboradora} compras sin colaboradora asignada, no se cuentan acá.)`}
        </p>

        <div style={{ display: "grid", gap: 10 }}>
          {colaboradoras === null && <p style={{ fontSize: 13 }}>Cargando…</p>}
          {colaboradoras !== null && colaboradoras.length === 0 && (
            <p style={{ fontSize: 13, color: "rgba(23,35,61,.55)" }}>
              Todavía no hay compras con colaboradora asignada.
            </p>
          )}
          {colaboradoras?.map((c) => (
            <div
              key={c.nombre}
              style={{
                background: "#fff",
                border: "1px solid rgba(23,35,61,.08)",
                borderRadius: 14,
                padding: "14px 16px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{c.nombre}</p>
                <p style={{ margin: 0, fontSize: 13, color: "rgba(23,35,61,.6)" }}>
                  {c.total} compras · {c.porcentaje}%
                </p>
              </div>
              <div
                style={{
                  marginTop: 8,
                  height: 8,
                  borderRadius: 999,
                  background: "rgba(23,35,61,.06)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.max(4, (c.total / max) * 100)}%`,
                    borderRadius: 999,
                    background: `linear-gradient(90deg, ${colors.violet}, #6FAFC2)`,
                  }}
                />
              </div>
              <p style={{ margin: "6px 0 0", fontSize: 11, color: "rgba(23,35,61,.5)" }}>
                {c.verificadas} verificadas
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
