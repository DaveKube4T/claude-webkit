"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useMemberAuth } from "@/lib/member-auth-context";
import { SECCIONES_PERFIL_FINANCIERO } from "@/lib/perfil-financiero-secciones";

const colors = { night: "#17233D", violet: "#7568A8" };

interface Turno {
  rol: "user" | "assistant";
  texto: string;
  en: string;
}

type Perfil = Record<string, Turno[] | boolean | string | null> | null;

export default function ImprimirPerfilFinancieroPage() {
  const { miembro, cargando, fetchAutenticado } = useMemberAuth();
  const [perfil, setPerfil] = useState<Perfil>(null);
  const [resumenes, setResumenes] = useState<Record<string, string>>({});
  const [generando, setGenerando] = useState<Record<string, boolean>>({});

  const cargar = useCallback(async () => {
    const res = await fetchAutenticado("/api/miembro/perfil-financiero");
    if (res.ok) {
      const data = await res.json();
      setPerfil(data.perfil);
      setResumenes(data.perfil?.resumenes ?? {});
    }
  }, [fetchAutenticado]);

  useEffect(() => {
    if (miembro) cargar();
  }, [miembro, cargar]);

  const generarResumen = useCallback(
    async (seccionKey: string) => {
      setGenerando((g) => ({ ...g, [seccionKey]: true }));
      const res = await fetchAutenticado("/api/miembro/perfil-financiero/resumen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seccion: seccionKey }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.resumen) {
          setResumenes((r) => ({ ...r, [seccionKey]: data.resumen }));
        }
      }
      setGenerando((g) => ({ ...g, [seccionKey]: false }));
    },
    [fetchAutenticado]
  );

  useEffect(() => {
    if (!perfil) return;
    for (const s of SECCIONES_PERFIL_FINANCIERO) {
      const historial = Array.isArray(perfil[s.key]) ? (perfil[s.key] as Turno[]) : [];
      if (historial.length > 0 && !resumenes[s.key] && !generando[s.key]) {
        generarResumen(s.key);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perfil]);

  if (cargando || !miembro) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <p style={{ color: colors.night, fontFamily: "sans-serif" }}>Cargando…</p>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#fff",
        color: colors.night,
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding: "28px 18px 60px",
      }}
    >
      <div className="no-imprimir" style={{ maxWidth: 680, margin: "0 auto 18px", display: "flex", justifyContent: "space-between" }}>
        <Link href="/miembro/perfil-financiero" style={{ fontSize: 12, color: colors.violet, textDecoration: "none" }}>
          ← Volver al chat
        </Link>
        <button
          onClick={() => window.print()}
          className="rp-boton"
          style={{ padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
        >
          Imprimir / Guardar PDF
        </button>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <h1 style={{ fontSize: 24, margin: "0 0 2px" }}>Mi Perfil Financiero</h1>
        <p style={{ fontSize: 12, color: "rgba(23,35,61,.55)", margin: "0 0 24px" }}>
          {miembro?.nombre ? `${miembro.nombre} — ` : ""}
          Documento personal y confidencial. Generado el {new Date().toLocaleDateString("es")}.
        </p>

        {SECCIONES_PERFIL_FINANCIERO.map((s) => {
          const historial: Turno[] = Array.isArray(perfil?.[s.key]) ? (perfil![s.key] as Turno[]) : [];
          const resumen = resumenes[s.key];
          return (
            <section key={s.key} style={{ marginBottom: 26, breakInside: "avoid" }}>
              <h2 style={{ fontSize: 15, margin: "0 0 8px", color: colors.violet }}>
                {s.numero}. {s.titulo}
              </h2>
              {historial.length === 0 ? (
                <p style={{ fontSize: 12, color: "rgba(23,35,61,.4)", fontStyle: "italic" }}>
                  Sección sin completar todavía.
                </p>
              ) : resumen ? (
                <p style={{ fontSize: 12.5, lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>
                  {resumen}
                </p>
              ) : (
                <p style={{ fontSize: 12, color: "rgba(23,35,61,.4)", fontStyle: "italic" }}>
                  Generando resumen…
                </p>
              )}
            </section>
          );
        })}
      </div>

      <style jsx global>{`
        @media print {
          .no-imprimir {
            display: none !important;
          }
          body {
            background: #fff !important;
          }
        }
      `}</style>
    </main>
  );
}
