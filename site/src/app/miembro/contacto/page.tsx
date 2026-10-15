"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMemberAuth } from "@/lib/member-auth-context";
import MemberBottomNav from "@/components/MemberBottomNav";

const colors = { night: "#17233D", violet: "#7568A8" };

interface Mensaje {
  autor: "miembro" | "equipo";
  texto: string;
  fecha: string;
}

interface Conversacion {
  id: string;
  mensajes: Mensaje[];
  resuelto: boolean;
}

export default function ContactoPage() {
  const { miembro, cargando, fetchAutenticado } = useMemberAuth();
  const [conversacion, setConversacion] = useState<Conversacion | null>(null);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const finRef = useRef<HTMLDivElement>(null);

  const cargar = useCallback(async () => {
    const res = await fetchAutenticado("/api/miembro/mensajes");
    if (res.ok) setConversacion((await res.json()).conversacion);
  }, [fetchAutenticado]);

  useEffect(() => {
    if (miembro) cargar();
  }, [miembro, cargar]);

  useEffect(() => {
    finRef.current?.scrollIntoView({ block: "nearest" });
  }, [conversacion]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!texto.trim()) return;
    setEnviando(true);
    const res = await fetchAutenticado("/api/miembro/mensajes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto: texto.trim() }),
    });
    setEnviando(false);
    if (res.ok) {
      setTexto("");
      cargar();
    }
  }

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
        padding: "28px 18px 100px",
      }}
    >
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <h1 className="rp-titulo" style={{ fontSize: 20, marginBottom: 4 }}>Contactate con el equipo</h1>
        <p style={{ fontSize: 13, color: "rgba(23,35,61,.6)", marginBottom: 18 }}>
          Escribinos tu consulta acá, te respondemos a la brevedad.
        </p>

        <div
          style={{
            background: "rgba(255,255,255,.8)",
            borderRadius: 18,
            padding: "14px",
            minHeight: 200,
            maxHeight: 420,
            overflowY: "auto",
            display: "grid",
            gap: 8,
            marginBottom: 14,
          }}
        >
          {(!conversacion || conversacion.mensajes.length === 0) && (
            <p style={{ fontSize: 13, color: "rgba(23,35,61,.5)", textAlign: "center" }}>
              Todavía no escribiste ningún mensaje.
            </p>
          )}
          {conversacion?.mensajes.map((m, i) => (
            <div
              key={i}
              style={{
                alignSelf: m.autor === "miembro" ? "flex-end" : "flex-start",
                background: m.autor === "miembro" ? colors.violet : "#EEE8FF",
                color: m.autor === "miembro" ? "#fff" : colors.night,
                borderRadius: 12,
                padding: "8px 12px",
                fontSize: 13,
                maxWidth: "80%",
              }}
            >
              {m.texto}
            </div>
          ))}
          <div ref={finRef} />
        </div>

        <form onSubmit={enviar} style={{ display: "flex", gap: 8 }}>
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribí tu mensaje…"
            style={{
              flex: 1,
              padding: "11px 14px",
              borderRadius: 12,
              border: "1px solid rgba(23,35,61,.15)",
              fontSize: 13,
              background: "#fff",
            }}
          />
          <button
            type="submit"
            disabled={enviando}
            className="rp-boton"
            style={{
              borderRadius: 12,
              padding: "0 18px",
              fontSize: 13,
              fontWeight: 700,
              cursor: enviando ? "default" : "pointer",
            }}
          >
            Enviar
          </button>
        </form>
      </div>
      <MemberBottomNav />
    </main>
  );
}
