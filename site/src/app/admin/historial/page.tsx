"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/admin-auth-context";
import AdminNav from "@/components/AdminNav";

const colors = { ivory: "#F2F6F6", violet: "#7568A8", night: "#17233D" };

const ROL_LABEL: Record<string, string> = {
  superadmin: "Admin", // nunca se muestra "superadmin" en pantalla
  admin: "Admin",
  verificador: "Verificadora",
};

interface Entrada {
  id: string;
  usuario_nombre: string;
  rol: string;
  accion: string;
  target_id: string | null;
  detalle: string | null;
  fecha: string;
}

export default function AdminHistorialPage() {
  const { usuario, cargando, logout, fetchAutenticado } = useAdminAuth();
  const [historial, setHistorial] = useState<Entrada[] | null>(null);

  const cargar = useCallback(async () => {
    const res = await fetchAutenticado("/api/admin/historial");
    if (res.ok) setHistorial((await res.json()).historial);
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
        <h1 className="rp-titulo" style={{ margin: 0, fontSize: 22 }}>Historial</h1>
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

        <p style={{ fontSize: 12, color: "rgba(23,35,61,.55)", marginBottom: 14 }}>
          Últimas {historial?.length ?? "…"} acciones del equipo.
        </p>

        {historial === null && <p>Cargando…</p>}
        {historial?.length === 0 && <p>Sin actividad registrada todavía.</p>}

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {historial?.map((h) => (
            <div
              key={h.id}
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: "12px 16px",
                boxShadow: "0 4px 14px rgba(23,35,61,.05)",
                fontSize: 13,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <strong>{h.usuario_nombre}</strong>
                <span style={{ color: "rgba(23,35,61,.5)", fontSize: 11, whiteSpace: "nowrap" }}>
                  {new Date(h.fecha).toLocaleString("es-AR")}
                </span>
              </div>
              <p style={{ margin: "2px 0 0", color: "rgba(23,35,61,.65)" }}>
                {ROL_LABEL[h.rol] ?? h.rol} · {h.accion}
                {h.detalle ? ` — ${h.detalle}` : ""}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
