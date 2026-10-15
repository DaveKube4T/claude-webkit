"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAdminAuth } from "@/lib/admin-auth-context";
import AdminNav from "@/components/AdminNav";

const colors = {
  ivory: "#F2F6F6",
  deepBlue: "#263A63",
  water: "#6FAFC2",
  violet: "#7568A8",
  night: "#17233D",
  gold: "#C7A968",
};

interface Stats {
  totalPersonas: number;
  totalCompras: number;
  pendientes: number;
  verificadas: number;
  rechazadas: number;
  errores: number;
}

const ROL_LABEL: Record<string, string> = {
  superadmin: "Admin", // nunca se muestra "superadmin" en pantalla, ver PROYECTO-RESONANCIA.md
  admin: "Admin",
  verificador: "Verificadora",
};

export default function AdminDashboardPage() {
  const { usuario, cargando, logout, fetchAutenticado } = useAdminAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [cargandoStats, setCargandoStats] = useState(true);

  const cargarStats = useCallback(async () => {
    setCargandoStats(true);
    const res = await fetchAutenticado("/api/admin/stats");
    if (res.ok) setStats(await res.json());
    setCargandoStats(false);
  }, [fetchAutenticado]);

  useEffect(() => {
    if (usuario) cargarStats();
  }, [usuario, cargarStats]);

  if (cargando || !usuario) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <p style={{ color: colors.night, fontFamily: "sans-serif" }}>Cargando…</p>
      </main>
    );
  }

  const tarjetas: { label: string; valor: number | null; color: string; href: string }[] = [
    { label: "Personas", valor: stats?.totalPersonas ?? null, color: colors.deepBlue, href: "/admin/personas" },
    { label: "Compras totales", valor: stats?.totalCompras ?? null, color: colors.violet, href: "/admin/compras" },
    { label: "Pendientes", valor: stats?.pendientes ?? null, color: "#854F0B", href: "/admin/compras?estado=pendiente" },
    { label: "Verificadas", valor: stats?.verificadas ?? null, color: "#3B6D11", href: "/admin/compras?estado=verificada" },
    { label: "Rechazadas", valor: stats?.rechazadas ?? null, color: "#A32D2D", href: "/admin/compras?estado=rechazada" },
    { label: "Con error reportado", valor: stats?.errores ?? null, color: "#A32D2D", href: "/admin/compras?estado=error_reportado" },
  ];

  const accesos = [
    { label: "Actividad del equipo", href: "/admin/historial", soloEquipo: true },
    { label: "Chat del equipo", href: "/admin/equipo", soloEquipo: false },
    { label: "Condiciones especiales", href: "/admin/condiciones", soloEquipo: false },
    { label: "Hash duplicados", href: "/admin/hash-duplicados", soloEquipo: false },
    { label: "Colaboradoras", href: "/admin/colaboradoras", soloEquipo: false },
    { label: "Perfiles incompletos", href: "/admin/perfiles-incompletos", soloEquipo: false },
    { label: "Mensajes sin registrar", href: "/admin/mensajes-sin-registrar", soloEquipo: false },
    { label: "Pagos de inversión", href: "/admin/pagos-inversion", soloEquipo: true },
  ].filter((a) => !a.soloEquipo || usuario.rol === "superadmin" || usuario.rol === "admin");

  return (
    <main
      className="admin-ui"
      style={{
        minHeight: "100vh",
        background: colors.ivory,
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
          margin: "0 auto 32px",
        }}
      >
        <div>
          <p style={{ margin: 0, fontSize: 13, color: "rgba(23,35,61,.6)" }}>
            Portal de Verificación — {ROL_LABEL[usuario.rol] ?? usuario.rol}
          </p>
          <h1 className="rp-titulo" style={{ margin: "2px 0 0", fontSize: 22 }}>
            Hola, {usuario.nombre}
          </h1>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={cargarStats}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: `1px solid rgba(23,35,61,.15)`,
              background: "#fff",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            ↻ Actualizar
          </button>
          <button
            onClick={logout}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: "none",
              background: colors.night,
              color: "#fff",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <AdminNav rol={usuario.rol} />
      </div>

      <section
        style={{
          maxWidth: 960,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 14,
        }}
      >
        {tarjetas.map((t) => (
          <Link
            key={t.label}
            href={t.href}
            style={{
              display: "block",
              background: "#fff",
              borderRadius: 16,
              padding: "18px 16px",
              boxShadow: "0 8px 24px rgba(23,35,61,.06)",
              textDecoration: "none",
              color: "inherit",
              cursor: "pointer",
            }}
          >
            <p style={{ margin: 0, fontSize: 13, color: "rgba(23,35,61,.6)" }}>
              {t.label}
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 30,
                fontWeight: 700,
                color: t.color,
              }}
            >
              {cargandoStats ? "…" : t.valor}
            </p>
          </Link>
        ))}
      </section>

      <section
        style={{
          maxWidth: 960,
          margin: "14px auto 0",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 14,
        }}
      >
        {accesos.map((a) => (
          <Link
            key={a.label}
            href={a.href}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#fff",
              borderRadius: 16,
              padding: "16px",
              boxShadow: "0 8px 24px rgba(23,35,61,.06)",
              textDecoration: "none",
              color: colors.night,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {a.label}
            <span style={{ color: "rgba(23,35,61,.4)" }}>→</span>
          </Link>
        ))}
      </section>
    </main>
  );
}
