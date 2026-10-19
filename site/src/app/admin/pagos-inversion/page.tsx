"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/admin-auth-context";
import AdminNav from "@/components/AdminNav";

const colors = { violet: "#7568A8", night: "#17233D" };

interface Pago {
  compraId: string;
  persona_nombre: string | null;
  persona_telegram: string | null;
  paquete: string;
  monto: number;
  nota: string | null;
  registrado_por_nombre: string;
  creado_en: string;
}

export default function AdminPagosInversionPage() {
  const { usuario, cargando, logout, fetchAutenticado } = useAdminAuth();
  const [pagos, setPagos] = useState<Pago[] | null>(null);
  const [total, setTotal] = useState(0);
  const [exportando, setExportando] = useState(false);

  const cargar = useCallback(async () => {
    const res = await fetchAutenticado("/api/admin/pagos-inversion");
    if (res.ok) {
      const data = await res.json();
      setPagos(data.pagos);
      setTotal(data.total);
    }
  }, [fetchAutenticado]);

  useEffect(() => {
    if (usuario) cargar();
  }, [usuario, cargar]);

  async function exportarExcel() {
    setExportando(true);
    const res = await fetchAutenticado("/api/admin/pagos-inversion/exportar");
    setExportando(false);
    if (!res.ok) return;
    const blob = await res.blob();
    const nombre =
      res.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] ??
      "pagos-inversion.csv";
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  if (cargando || !usuario) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <p style={{ color: colors.night, fontFamily: "sans-serif" }}>Cargando…</p>
      </main>
    );
  }

  if (usuario.rol === "verificador") {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <p style={{ color: colors.night, fontFamily: "sans-serif" }}>No tenés permiso para ver esto.</p>
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
          Pagos de inversión
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

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <p style={{ fontSize: 13, color: "rgba(23,35,61,.6)", margin: 0 }}>
            {pagos?.length ?? 0} pagos registrados · Total: ${total.toLocaleString("es-AR")}
          </p>
          <button
            onClick={exportarExcel}
            disabled={exportando}
            style={{
              border: "1px solid rgba(23,35,61,.15)",
              background: "#fff",
              color: colors.violet,
              fontWeight: 700,
              padding: "9px 16px",
              borderRadius: 10,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {exportando ? "Exportando…" : "Exportar a Excel ⬇"}
          </button>
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          {pagos === null && <p style={{ fontSize: 13 }}>Cargando…</p>}
          {pagos !== null && pagos.length === 0 && (
            <p style={{ fontSize: 13, color: "rgba(23,35,61,.55)" }}>
              No hay pagos de inversión registrados todavía.
            </p>
          )}
          {pagos?.map((p, i) => (
            <div
              key={i}
              style={{
                background: "#fff",
                border: "1px solid rgba(23,35,61,.08)",
                borderRadius: 14,
                padding: "12px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>
                  {p.persona_nombre ?? "—"}{" "}
                  <span style={{ fontWeight: 400, color: "rgba(23,35,61,.5)" }}>
                    @{p.persona_telegram}
                  </span>
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(23,35,61,.6)" }}>
                  {p.paquete}
                  {p.nota ? ` · ${p.nota}` : ""} · registrado por {p.registrado_por_nombre}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: colors.violet }}>
                  ${p.monto.toLocaleString("es-AR")}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: "rgba(23,35,61,.5)" }}>
                  {new Date(p.creado_en).toLocaleDateString("es-AR")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
