"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/admin-auth-context";
import AdminNav from "@/components/AdminNav";

const colors = { ivory: "#F2F6F6", violet: "#7568A8", night: "#17233D" };

const ESTADO_ESTILO: Record<string, { color: string; fondo: string; label: string }> = {
  pendiente: { color: "#854F0B", fondo: "#FAEEDA", label: "Pendiente" },
  aprobada: { color: "#3B6D11", fondo: "#EAF3DE", label: "Aprobada" },
  rechazada: { color: "#A32D2D", fondo: "#FCEBEB", label: "Rechazada" },
};

interface Solicitud {
  id: string;
  persona_nombre: string | null;
  persona_telegram: string | null;
  paquete: string;
  lider: string | null;
  comentario: string | null;
  hash: string | null;
  voucher_url: string | null;
  estado: string;
  creada_en: string;
}

export default function AdminSolicitudesPage() {
  const { usuario, cargando, logout, fetchAutenticado } = useAdminAuth();
  const [solicitudes, setSolicitudes] = useState<Solicitud[] | null>(null);
  const [filtroEstado, setFiltroEstado] = useState("pendiente");
  const [procesando, setProcesando] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    const params = new URLSearchParams();
    if (filtroEstado) params.set("estado", filtroEstado);
    const res = await fetchAutenticado(`/api/admin/solicitudes?${params.toString()}`);
    if (res.ok) setSolicitudes((await res.json()).solicitudes);
  }, [fetchAutenticado, filtroEstado]);

  useEffect(() => {
    if (usuario) cargar();
  }, [usuario, cargar]);

  async function revisar(id: string, accion: "aprobar" | "rechazar") {
    setProcesando(id);
    setAviso(null);
    const res = await fetchAutenticado(`/api/admin/solicitudes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion }),
    });
    setProcesando(null);
    if (res.ok) {
      cargar();
    } else {
      setAviso((await res.json()).error ?? "No se pudo procesar.");
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
          maxWidth: 960,
          margin: "0 auto 12px",
        }}
      >
        <h1 className="rp-titulo" style={{ margin: 0, fontSize: 22 }}>Solicitudes</h1>
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

        <p
          style={{
            fontSize: 12,
            color: "#854F0B",
            background: "#FAEEDA",
            borderRadius: 10,
            padding: "8px 12px",
            marginBottom: 14,
            maxWidth: 560,
          }}
        >
          ⚠ Acá llegan avisos de miembros sobre aportes que{" "}
          <strong>ya hicieron</strong> y no aparecían registrados — no son pedidos de
          aportes nuevos. Al aprobar, se crea o actualiza la compra correspondiente.
        </p>

        <div style={{ marginBottom: 16 }}>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            style={{
              padding: "9px 12px",
              borderRadius: 10,
              border: "1px solid rgba(23,35,61,.15)",
              fontSize: 13,
              background: "#fff",
            }}
          >
            <option value="pendiente">Pendientes</option>
            <option value="aprobada">Aprobadas</option>
            <option value="rechazada">Rechazadas</option>
            <option value="">Todas</option>
          </select>
        </div>

        {aviso && (
          <p style={{ fontSize: 12, color: "#A32D2D", marginBottom: 10 }}>{aviso}</p>
        )}

        {solicitudes === null && <p style={{ fontSize: 13 }}>Cargando…</p>}
        {solicitudes !== null && solicitudes.length === 0 && (
          <p style={{ fontSize: 13, color: "rgba(23,35,61,.55)" }}>
            No hay solicitudes acá.
          </p>
        )}

        <div style={{ display: "grid", gap: 8 }}>
          {solicitudes?.map((s) => (
            <div
              key={s.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                background: "#fff",
                border: "1px solid rgba(23,35,61,.08)",
                borderRadius: 14,
                padding: "12px 14px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>
                  {s.persona_nombre ?? "—"}{" "}
                  <span style={{ fontWeight: 400, color: "rgba(23,35,61,.5)" }}>
                    @{s.persona_telegram}
                  </span>
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(23,35,61,.6)" }}>
                  {s.paquete} {s.lider ? `· ${s.lider}` : ""}
                </p>
                {s.comentario && (
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: 12,
                      color: "rgba(23,35,61,.75)",
                      fontStyle: "italic",
                      maxWidth: 360,
                    }}
                  >
                    💬 {s.comentario}
                  </p>
                )}
                {s.hash && (
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: 11,
                      color: "rgba(23,35,61,.55)",
                      wordBreak: "break-all",
                      maxWidth: 360,
                    }}
                  >
                    Hash: {s.hash}
                  </p>
                )}
                {s.voucher_url && (
                  <a
                    href={s.voucher_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "inline-block", marginTop: 4, fontSize: 11, color: colors.violet }}
                  >
                    Ver comprobante →
                  </a>
                )}
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {s.estado === "pendiente" ? (
                  <>
                    <button
                      disabled={procesando === s.id}
                      onClick={() => revisar(s.id, "aprobar")}
                      style={{
                        border: "1px solid #3B6D11",
                        color: "#3B6D11",
                        background: "#fff",
                        borderRadius: 10,
                        padding: "6px 12px",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      ✓ Aprobar
                    </button>
                    <button
                      disabled={procesando === s.id}
                      onClick={() => revisar(s.id, "rechazar")}
                      style={{
                        border: "1px solid #A32D2D",
                        color: "#A32D2D",
                        background: "#fff",
                        borderRadius: 10,
                        padding: "6px 12px",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      ✕ Rechazar
                    </button>
                  </>
                ) : (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: ESTADO_ESTILO[s.estado].color,
                      background: ESTADO_ESTILO[s.estado].fondo,
                      padding: "4px 10px",
                      borderRadius: 999,
                    }}
                  >
                    {ESTADO_ESTILO[s.estado].label}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
