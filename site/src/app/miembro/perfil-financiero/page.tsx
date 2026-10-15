"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useMemberAuth } from "@/lib/member-auth-context";
import MemberBottomNav from "@/components/MemberBottomNav";
import { SECCIONES_PERFIL_FINANCIERO } from "@/lib/perfil-financiero-secciones";

const colors = { night: "#17233D", violet: "#7568A8" };

interface Turno {
  rol: "user" | "assistant";
  texto: string;
  en: string;
}

type Perfil = Record<string, Turno[] | boolean | string | null> | null;

export default function PerfilFinancieroPage() {
  const { miembro, cargando, fetchAutenticado } = useMemberAuth();
  const [perfil, setPerfil] = useState<Perfil>(null);
  const [seccionActiva, setSeccionActiva] = useState(SECCIONES_PERFIL_FINANCIERO[0].key);
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const finChatRef = useRef<HTMLDivElement>(null);

  const cargar = useCallback(async () => {
    const res = await fetchAutenticado("/api/miembro/perfil-financiero");
    if (res.ok) {
      const data = await res.json();
      setPerfil(data.perfil);
    }
  }, [fetchAutenticado]);

  useEffect(() => {
    if (miembro) cargar();
  }, [miembro, cargar]);

  const seccion = SECCIONES_PERFIL_FINANCIERO.find((s) => s.key === seccionActiva)!;
  const historial: Turno[] = Array.isArray(perfil?.[seccion.key])
    ? (perfil![seccion.key] as Turno[])
    : [];

  useEffect(() => {
    finChatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [historial.length, seccionActiva]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const texto = mensaje.trim();
    if (!texto || enviando) return;
    setEnviando(true);
    setError(null);

    const historialOptimista = [
      ...historial,
      { rol: "user" as const, texto, en: new Date().toISOString() },
    ];
    setPerfil((p) => ({ ...(p ?? {}), [seccion.key]: historialOptimista }));
    setMensaje("");

    const res = await fetchAutenticado("/api/miembro/perfil-financiero/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seccion: seccion.key, mensaje: texto }),
    });

    setEnviando(false);

    if (res.ok) {
      const data = await res.json();
      setPerfil((p) => ({ ...(p ?? {}), [seccion.key]: data.historial }));
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo enviar el mensaje.");
      setPerfil((p) => ({ ...(p ?? {}), [seccion.key]: historial }));
    }
  }

  const seccionesConAvance = SECCIONES_PERFIL_FINANCIERO.filter(
    (s) => Array.isArray(perfil?.[s.key]) && (perfil![s.key] as Turno[]).length > 0
  ).length;

  if (cargando || !miembro) {
    return (
      <main className="rp-bg-clean" style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <p style={{ color: colors.night, fontFamily: "sans-serif" }}>Cargando…</p>
      </main>
    );
  }

  return (
    <main
      className="rp-bg-clean"
      style={{
        minHeight: "100vh",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: colors.night,
        padding: "28px 18px 110px",
      }}
    >
      <style>{`
        .rp-pf-layout { display: flex; gap: 10px; align-items: flex-start; }
        .rp-pf-main { flex: 1; min-width: 0; }
        @media (min-width: 860px) {
          .rp-pf-container { max-width: 760px !important; }
          .rp-pf-layout { gap: 22px; }
          .rp-pf-sidebar { width: 200px !important; }
          .rp-pf-sidebar-btn { font-size: 12px !important; padding: 9px 12px !important; }
          .rp-pf-form { flex-direction: row !important; }
          .rp-pf-send-btn { width: auto !important; }
        }
      `}</style>
      <div className="rp-pf-container" style={{ maxWidth: 520, margin: "0 auto" }}>
        <div style={{ marginBottom: 6 }}>
          <h1 className="rp-titulo" style={{ margin: 0, fontSize: 20 }}>Mi Perfil Financiero</h1>
          <p style={{ fontSize: 12, color: "rgba(23,35,61,.55)", margin: "4px 0 0" }}>
            Cómo organizar y proteger tu patrimonio, con una guía de IA, privada — no la ven
            otros miembros.
          </p>
        </div>

        <div
          style={{
            background: "rgba(186,117,23,.1)",
            border: "1px solid rgba(186,117,23,.25)",
            borderRadius: 12,
            padding: "9px 12px",
            margin: "10px 0 4px",
          }}
        >
          <p style={{ fontSize: 11.5, color: "#854F0B", margin: 0, lineHeight: 1.5 }}>
            No escribas números de cuenta, contraseñas, documentos de identidad ni datos así de
            sensibles — usa ideas generales. Esta guía es para organizar tus pensamientos, no para
            guardar esos datos exactos.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            margin: "14px 0 10px",
          }}
        >
          <span style={{ fontSize: 11, color: "rgba(23,35,61,.5)" }}>
            {seccionesConAvance} de {SECCIONES_PERFIL_FINANCIERO.length} secciones iniciadas
          </span>
          <Link
            href="/miembro/perfil-financiero/imprimir"
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: colors.violet,
              textDecoration: "none",
            }}
          >
            Imprimir / Guardar PDF →
          </Link>
        </div>

        <div className="rp-pf-layout">
          <div className="rp-pf-sidebar" style={{ display: "flex", flexDirection: "column", gap: 4, width: 108, flexShrink: 0 }}>
            {SECCIONES_PERFIL_FINANCIERO.map((s) => {
              const activa = s.key === seccionActiva;
              const tieneAvance = Array.isArray(perfil?.[s.key]) && (perfil![s.key] as Turno[]).length > 0;
              return (
                <button
                  key={s.key}
                  className="rp-pf-sidebar-btn"
                  onClick={() => setSeccionActiva(s.key)}
                  style={{
                    textAlign: "left",
                    padding: "7px 8px",
                    borderRadius: 10,
                    border: "1px solid rgba(23,35,61,.12)",
                    background: activa ? colors.violet : "rgba(255,255,255,.7)",
                    color: activa ? "#fff" : colors.night,
                    fontSize: 10.5,
                    lineHeight: 1.3,
                    fontWeight: 700,
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  {s.numero}. {s.titulo}
                  {tieneAvance && !activa && (
                    <span
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: colors.violet,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="rp-pf-main">
          <div
            style={{
              background: "rgba(255,255,255,.8)",
              borderRadius: 18,
              padding: 14,
              display: "flex",
              flexDirection: "column",
              minHeight: 340,
            }}
          >
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, marginBottom: 10 }}>
            {historial.length === 0 && (
              <p style={{ fontSize: 13, color: "rgba(23,35,61,.6)", lineHeight: 1.5 }}>
                Vamos a hablar sobre <strong>{seccion.titulo.toLowerCase()}</strong>. Escribe
                lo que quieras compartir, o simplemente &quot;hola&quot; para empezar.
              </p>
            )}
            {historial.map((t, i) => (
              <div
                key={i}
                style={{
                  alignSelf: t.rol === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  background: t.rol === "user" ? colors.violet : "rgba(23,35,61,.06)",
                  color: t.rol === "user" ? "#fff" : colors.night,
                  padding: "9px 12px",
                  borderRadius: 14,
                  borderBottomRightRadius: t.rol === "user" ? 4 : 14,
                  borderBottomLeftRadius: t.rol === "assistant" ? 4 : 14,
                  fontSize: 13,
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                }}
              >
                {t.texto}
              </div>
            ))}
            {enviando && (
              <div
                style={{
                  alignSelf: "flex-start",
                  fontSize: 12,
                  color: "rgba(23,35,61,.5)",
                  padding: "4px 6px",
                }}
              >
                Escribiendo…
              </div>
            )}
            <div ref={finChatRef} />
          </div>

          {error && (
            <p style={{ fontSize: 12, color: "#B3261E", margin: "0 0 8px" }}>{error}</p>
          )}

          <form onSubmit={enviar} className="rp-pf-form" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Escribe tu respuesta…"
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(23,35,61,.15)",
                fontSize: 13,
                background: "#fff",
                boxSizing: "border-box",
              }}
            />
            <button
              type="submit"
              disabled={enviando || !mensaje.trim()}
              className="rp-boton rp-pf-send-btn"
              style={{
                width: "100%",
                padding: "10px 16px",
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 700,
                cursor: enviando ? "default" : "pointer",
                opacity: enviando || !mensaje.trim() ? 0.6 : 1,
              }}
            >
              Enviar
            </button>
          </form>
          </div>
          </div>
        </div>
      </div>
      <MemberBottomNav />
    </main>
  );
}
