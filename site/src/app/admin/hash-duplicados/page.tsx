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

interface CompraDeGrupo {
  id: string;
  persona_nombre: string | null;
  persona_telegram: string | null;
  paquete: string;
  estado: string;
  creada_en: string;
}

interface Grupo {
  hash: string;
  compras: CompraDeGrupo[];
}

export default function AdminHashDuplicadosPage() {
  const { usuario, cargando, logout, fetchAutenticado } = useAdminAuth();
  const [grupos, setGrupos] = useState<Grupo[] | null>(null);

  const cargar = useCallback(async () => {
    const res = await fetchAutenticado("/api/admin/hash-duplicados");
    if (res.ok) setGrupos((await res.json()).grupos);
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
        <h1 className="rp-titulo" style={{ margin: 0, fontSize: 22 }}>
          Hash duplicados
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
          Grupos de compras que comparten el mismo hash/referencia de pago.
        </p>

        <div style={{ display: "grid", gap: 14 }}>
          {grupos === null && <p style={{ fontSize: 13 }}>Cargando…</p>}
          {grupos !== null && grupos.length === 0 && (
            <p style={{ fontSize: 13, color: "rgba(23,35,61,.55)" }}>
              No hay hashes duplicados por el momento.
            </p>
          )}
          {grupos?.map((g) => (
            <div
              key={g.hash}
              style={{
                background: "#fff",
                border: "1px solid rgba(23,35,61,.08)",
                borderRadius: 14,
                padding: "14px 16px",
              }}
            >
              <p
                style={{
                  margin: "0 0 10px",
                  fontSize: 12,
                  fontFamily: "ui-monospace, monospace",
                  color: "rgba(23,35,61,.6)",
                  wordBreak: "break-all",
                }}
              >
                {g.hash} · {g.compras.length} compras
              </p>
              <div style={{ display: "grid", gap: 8 }}>
                {g.compras.map((c) => {
                  const estilo = ESTADO_ESTILO[c.estado] ?? ESTADO_ESTILO.pendiente;
                  return (
                    <div
                      key={c.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 10px",
                        background: "rgba(23,35,61,.03)",
                        borderRadius: 10,
                      }}
                    >
                      <div>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>
                          {c.persona_nombre ?? "—"}{" "}
                          <span style={{ fontWeight: 400, color: "rgba(23,35,61,.5)" }}>
                            @{c.persona_telegram}
                          </span>
                        </p>
                        <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(23,35,61,.55)" }}>
                          {c.paquete}
                        </p>
                      </div>
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
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
