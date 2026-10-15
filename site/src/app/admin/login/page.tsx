"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAdminAuth } from "@/lib/admin-auth-context";

const colors = {
  ivory: "#F2F6F6",
  deepBlue: "#263A63",
  water: "#6FAFC2",
  violet: "#7568A8",
  night: "#17233D",
  gold: "#C7A968",
};

export default function AdminLoginPage() {
  const { login } = useAdminAuth();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    const err = await login(usuario, password);
    setEnviando(false);
    if (err) setError(err);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        padding: 24,
        textAlign: "center",
        color: colors.night,
        background: `
          radial-gradient(circle at 50% 38%, rgba(255,255,255,.96) 0%, rgba(250,248,243,.82) 23%, rgba(220,216,242,.52) 48%, rgba(38,58,99,.16) 100%),
          linear-gradient(135deg, #FAF8F3 0%, #DCD8F2 48%, #6FAFC2 100%)
        `,
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          background:
            "radial-gradient(circle, rgba(255,255,255,.96), rgba(220,216,242,.30))",
        }}
      >
        <div style={{ width: 40, height: 40, position: "relative" }}>
          <Image
            src="/images/brand-mark.png"
            alt=""
            fill
            priority
            sizes="80px"
            style={{ objectFit: "contain" }}
          />
        </div>
      </div>
      <h1
        style={{
          margin: 0,
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontWeight: 400,
          fontSize: 28,
        }}
      >
        Acceso equipo de verificación
      </h1>
      <form
        onSubmit={onSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          width: "100%",
          maxWidth: 340,
          background: "rgba(255,255,255,.55)",
          backdropFilter: "blur(18px)",
          border: "1px solid rgba(255,255,255,.6)",
          borderRadius: 20,
          padding: 24,
          boxShadow: "0 20px 60px rgba(23,35,61,.12)",
        }}
      >
        <input
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          placeholder="Usuario"
          autoComplete="username"
          required
          style={{
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid rgba(23,35,61,.15)",
            fontSize: 15,
            background: "rgba(255,255,255,.8)",
            outline: "none",
            color: colors.night,
          }}
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          type="password"
          autoComplete="current-password"
          required
          style={{
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid rgba(23,35,61,.15)",
            fontSize: 15,
            background: "rgba(255,255,255,.8)",
            outline: "none",
            color: colors.night,
          }}
        />
        {error && (
          <p style={{ color: "#A32D2D", fontSize: 13, margin: 0 }}>{error}</p>
        )}
        <button
          type="submit"
          disabled={enviando}
          style={{
            marginTop: 4,
            padding: "12px 14px",
            borderRadius: 12,
            border: "none",
            fontSize: 15,
            fontWeight: 600,
            color: "#fff",
            cursor: enviando ? "default" : "pointer",
            opacity: enviando ? 0.7 : 1,
            background: `linear-gradient(135deg, ${colors.violet}, ${colors.water})`,
            boxShadow: "0 10px 24px rgba(117,104,168,.35)",
          }}
        >
          {enviando ? "Ingresando…" : "Ingresar →"}
        </button>
      </form>
      <Link
        href="/"
        style={{
          fontSize: 13,
          color: colors.deepBlue,
          textDecoration: "underline",
        }}
      >
        ← Volver al portal de miembros
      </Link>
    </main>
  );
}
