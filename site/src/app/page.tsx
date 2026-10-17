"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useMemberAuth } from "@/lib/member-auth-context";

const colors = {
  ivory: "#F2F6F6",
  night: "#17233D",
  blue: "#263A63",
  water: "#6FAFC2",
  lavender: "#DCD8F2",
  violet: "#7568A8",
  gold: "#C7A968",
};

// Nota: "compra" se evita en todo el copy visible — son aportes/donaciones, no
// compras comerciales (ver PROYECTO-RESONANCIA.md).
const SUBTITLE_PHRASES = [
  "Cada aporte, en su lugar.",
  "Consultá. Verificá. Tené claridad.",
  "Toda la información de tus aportes, más clara y accesible.",
  "Un espacio para consultar el estado de tus aportes.",
  "Tus comprobantes, tus solicitudes, tu información.",
  "La claridad también forma parte del proceso.",
  "Verificar es saber dónde estamos.",
  "Encontrá aquí la información de tus aportes.",
  "Un espacio simple para consultar y verificar.",
  "Que cada operación tenga su registro.",
  "Información clara para cada etapa del proceso.",
  "Tu información, organizada para que puedas consultarla.",
  "Donde cada aporte puede ser revisado y verificado.",
  "Un paso más hacia una información clara.",
  "Consultá tus aportes. Revisá tus comprobantes.",
];

function EyeIcon({ off }: { off: boolean }) {
  const common = {
    width: 17,
    height: 17,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (off) {
    return (
      <svg {...common}>
        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C5 20 1.7 14 1 12c.42-1.2 1.6-3.4 3.7-5.2M9.9 4.24A10.9 10.9 0 0 1 12 4c7 0 10.3 6 11 8-.31.9-1.03 2.4-2.24 3.87M14.12 14.12a3 3 0 1 1-4.24-4.24" />
        <path d="M1 1l22 22" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function BrandMark() {
  return (
    <div style={{ width: 41, height: 41, position: "relative" }}>
      <Image src="/images/brand-mark.png" alt="" fill priority sizes="88px" style={{ objectFit: "contain" }} />
    </div>
  );
}

function SacredCircle() {
  return (
    <div
      aria-hidden="true"
      className="rp-halo-breathe"
      style={{
        width: 54,
        height: 54,
        margin: "0 auto 10px",
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        background:
          "radial-gradient(circle, rgba(255,255,255,.96), rgba(220,216,242,.30))",
      }}
    >
      <div style={{ width: 40, height: 40, position: "relative" }}>
        <Image src="/images/brand-mark.png" alt="" fill priority sizes="108px" style={{ objectFit: "contain" }} />
      </div>
    </div>
  );
}

function esErrorNoEncontrado(mensaje: string | null) {
  return mensaje?.includes("No encontramos una cuenta") ?? false;
}

function esErrorSinBot(mensaje: string | null) {
  return mensaje?.includes("no iniciaste una conversación") ?? false;
}

export default function LoginPage() {
  const [subtitleIndex, setSubtitleIndex] = useState(0);
  const [subtitleVisible, setSubtitleVisible] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const { login, solicitarCodigo, verificarCodigo } = useMemberAuth();
  const [identificador, setIdentificador] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Login de primera vez (sin contraseña, ver PROYECTO-RESONANCIA.md): se
  // identifica siempre por Telegram y se manda un código de un solo uso al
  // mail de esa cuenta. La contraseña nueva es sugerida, no obligatoria.
  const [modo, setModo] = useState<"password" | "pedir-codigo" | "verificar-codigo">(
    "password"
  );
  const [mailOculto, setMailOculto] = useState<string | null>(null);
  const [canalCodigo, setCanalCodigo] = useState<"email" | "telegram" | null>(null);
  const [codigo, setCodigo] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");

  async function onSubmitLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    setEnviando(true);
    const err = await login(identificador, password);
    setEnviando(false);
    if (err === "SIN_PASSWORD") {
      setModo("pedir-codigo");
      return;
    }
    if (err) setLoginError(err);
  }

  async function onPedirCodigo() {
    if (!identificador.trim()) {
      setLoginError("Escribí tu usuario de Telegram arriba.");
      return;
    }
    setLoginError(null);
    setEnviando(true);
    const resultado = await solicitarCodigo(identificador);
    setEnviando(false);
    if (!resultado.ok) {
      setLoginError(resultado.error);
      return;
    }
    setCanalCodigo(resultado.canal);
    setMailOculto(resultado.canal === "email" ? resultado.mailOculto : null);
    setModo("verificar-codigo");
  }

  async function onVerificarCodigo(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    if (canalCodigo === "telegram" && !nuevaPassword) {
      setLoginError("Elegí una contraseña nueva para poder entrar.");
      return;
    }
    if (nuevaPassword && nuevaPassword !== confirmarPassword) {
      setLoginError("Las contraseñas no coinciden.");
      return;
    }
    setEnviando(true);
    const err = await verificarCodigo(identificador, codigo, nuevaPassword);
    setEnviando(false);
    if (err) setLoginError(err);
  }

  function volverAPassword() {
    setModo("password");
    setLoginError(null);
    setCodigo("");
    setNuevaPassword("");
    setConfirmarPassword("");
    setCanalCodigo(null);
    setMailOculto(null);
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setSubtitleVisible(false);
      setTimeout(() => {
        setSubtitleIndex((prev) => {
          if (SUBTITLE_PHRASES.length <= 1) return prev;
          let next = Math.floor(Math.random() * SUBTITLE_PHRASES.length);
          while (next === prev) {
            next = Math.floor(Math.random() * SUBTITLE_PHRASES.length);
          }
          return next;
        });
        setSubtitleVisible(true);
      }, 500);
    }, 5500);
    return () => clearInterval(interval);
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        position: "relative",
        color: colors.night,
        display: "flex",
        flexDirection: "column",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
      className="rp-bg"
    >
      {/* Velo parejo sobre la foto: garantiza legibilidad del texto en cualquier
          punto de la pantalla, sin depender de dónde caigan las flores/montañas */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          background: "rgba(250,248,243,.22)",
        }}
      />

      {/* Header */}
      <header
        style={{
          position: "relative",
          zIndex: 5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "18px clamp(22px, 5vw, 74px)",
        }}
        className="rp-topbar"
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <BrandMark />
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: ".22em",
                color: colors.blue,
              }}
              className="rp-brand-name"
            >
              RESONANCIA GLOBAL
            </div>
            <div
              style={{
                marginTop: 3,
                fontSize: 9,
                letterSpacing: ".17em",
                color: "rgba(23,35,61,.55)",
              }}
            >
              PORTAL DE VERIFICACIÓN
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontSize: 11,
            letterSpacing: ".04em",
            color: "rgba(23,35,61,.56)",
          }}
          className="rp-secure-status"
        >
          <span>Claridad</span>
          <span style={{ color: "rgba(23,35,61,.3)" }}>·</span>
          <span>Contribución</span>
          <span style={{ color: "rgba(23,35,61,.3)" }}>·</span>
          <span>Verificación</span>
        </div>
      </header>

      {/* Contenido */}
      <section
        style={{
          position: "relative",
          zIndex: 3,
          flex: 1,
          display: "grid",
          alignItems: "center",
          justifyItems: "center",
          padding: "clamp(4px, 1.2vh, 14px) 20px 10px",
        }}
      >
        <div
          style={{
            width: "min(680px, 100%)",
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "clamp(8px, 1.6vh, 18px)",
            justifyItems: "center",
          }}
          className="rp-grid"
        >
          {/* Lado editorial */}
          <div style={{ maxWidth: 560, position: "relative", textAlign: "center" }} className="rp-intro">
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: "-24px -32px",
                borderRadius: 40,
                background:
                  "radial-gradient(ellipse at 30% 40%, rgba(255,255,255,.55) 0%, rgba(255,255,255,.22) 55%, transparent 78%)",
                filter: "blur(18px)",
                pointerEvents: "none",
                zIndex: -1,
              }}
            />
            <h1
              style={{
                margin: "0 auto 8px",
                maxWidth: 480,
                color: colors.night,
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: "clamp(19px, 1.9vw, 25px)",
                fontWeight: 400,
                lineHeight: 1.15,
                letterSpacing: "-.03em",
                textShadow:
                  "0 2px 24px rgba(255,255,255,.85), 0 1px 3px rgba(255,255,255,.9)",
              }}
            >
              La verificación también es una{" "}
              <span style={{ color: colors.violet }}>forma de cuidado.</span>
            </h1>

            <p
              style={{
                maxWidth: 400,
                minHeight: "2.2em",
                margin: "0 auto",
                color: "rgba(23,35,61,.8)",
                fontSize: 13,
                lineHeight: 1.5,
                textShadow: "0 1px 12px rgba(255,255,255,.85)",
                opacity: subtitleVisible ? 1 : 0,
                transition: "opacity .5s ease",
              }}
              className="rp-intro-copy"
            >
              {SUBTITLE_PHRASES[subtitleIndex]}
            </p>
          </div>

          {/* Login (centro real de la composición) */}
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 300,
              justifySelf: "center",
              marginTop: "clamp(0px, 1.5vh, 14px)",
            }}
            className="rp-portal-wrap rp-card-appear"
          >
            {/* Destello único: cuando el panel termina de aparecer, se ilumina
                por un instante entero, como si lo tocara la luz del centro. */}
            <div aria-hidden="true" className="rp-panel-flash" />
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: "-15% -12%",
                borderRadius: 60,
                background:
                  "radial-gradient(circle at 50% 40%, rgba(255,255,255,.90) 0%, rgba(111,175,194,.20) 43%, transparent 72%)",
                filter: "blur(35px)",
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                position: "relative",
                padding: "clamp(14px, 2vw, 18px)",
                borderRadius: 31,
                border: "1px solid rgba(255,255,255,.77)",
                background: "rgba(255,255,255,.57)",
                backdropFilter: "blur(25px)",
                WebkitBackdropFilter: "blur(25px)",
                boxShadow:
                  "0 38px 95px rgba(38,58,99,.16), 0 8px 35px rgba(255,255,255,.38) inset",
              }}
              className="rp-login-card"
            >
              <div style={{ textAlign: "center" }}>
                <SacredCircle />

                <div
                  style={{
                    color: colors.violet,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: ".20em",
                  }}
                >
                  BIENVENIDO
                </div>

                <h2
                  style={{
                    margin: "6px 0 5px",
                    color: colors.night,
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    fontSize: 21,
                    fontWeight: 400,
                  }}
                >
                  Entrá a tu espacio
                </h2>

                <p
                  style={{
                    maxWidth: 300,
                    margin: "0 auto",
                    color: "rgba(23,35,61,.57)",
                    fontSize: 12,
                    lineHeight: 1.5,
                  }}
                >
                  Accedé a tus aportes, comprobantes y solicitudes.
                </p>
              </div>

              {modo === "password" && (
              <form onSubmit={onSubmitLogin} style={{ marginTop: 10 }}>
                <label
                  style={{
                    display: "block",
                    margin: "0 0 5px",
                    color: colors.blue,
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  Usuario o Telegram
                </label>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: 15,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "rgba(23,35,61,.4)",
                      fontSize: 13,
                      pointerEvents: "none",
                    }}
                  >
                    @
                  </span>
                  <input
                    placeholder="usuario"
                    value={identificador}
                    onChange={(e) => setIdentificador(e.target.value)}
                    autoComplete="username"
                    required
                    style={{
                      width: "100%",
                      height: 38,
                      padding: "0 15px 0 27px",
                      boxSizing: "border-box",
                      border: "1px solid rgba(38,58,99,.12)",
                      borderRadius: 14,
                      outline: "none",
                      background: "rgba(255,255,255,.65)",
                      color: colors.night,
                      fontSize: 13,
                    }}
                  />
                </div>

                <label
                  style={{
                    display: "block",
                    margin: "7px 0 4px",
                    color: colors.blue,
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  Contraseña
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    style={{
                      width: "100%",
                      height: 38,
                      padding: "0 42px 0 15px",
                      boxSizing: "border-box",
                      border: "1px solid rgba(38,58,99,.12)",
                      borderRadius: 14,
                      outline: "none",
                      background: "rgba(255,255,255,.65)",
                      color: colors.night,
                      fontSize: 13,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    style={{
                      position: "absolute",
                      right: 0,
                      top: 0,
                      height: 38,
                      width: 40,
                      display: "grid",
                      placeItems: "center",
                      border: 0,
                      background: "transparent",
                      color: "rgba(23,35,61,.45)",
                      cursor: "pointer",
                    }}
                  >
                    <EyeIcon off={showPassword} />
                  </button>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 9,
                    fontSize: 10,
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      color: "rgba(23,35,61,.56)",
                    }}
                  >
                    <input type="checkbox" style={{ accentColor: colors.violet }} />
                    Recordarme
                  </label>

                  <button
                    type="button"
                    onClick={onPedirCodigo}
                    style={{
                      border: 0,
                      padding: 0,
                      background: "transparent",
                      color: colors.violet,
                      cursor: "pointer",
                      fontSize: 10,
                    }}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                <p
                  style={{
                    margin: "9px 0 0",
                    textAlign: "center",
                    fontSize: 10,
                    color: "rgba(23,35,61,.56)",
                  }}
                >
                  ¿Todavía no tenés cuenta?{" "}
                  <Link href="/unite" style={{ color: colors.violet, fontWeight: 700 }}>
                    Unite acá
                  </Link>
                </p>

                {loginError && (
                  <p
                    style={{
                      margin: "10px 0 0",
                      color: "#A32D2D",
                      fontSize: 11,
                      lineHeight: 1.4,
                    }}
                  >
                    {loginError}{" "}
                    {esErrorNoEncontrado(loginError) && (
                      <Link href="/unite" style={{ color: colors.violet, fontWeight: 700 }}>
                        Unite acá
                      </Link>
                    )}
                  </p>
                )}

                <div style={{ position: "relative", marginTop: 14 }}>
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      left: "18%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      width: 70,
                      height: 70,
                      borderRadius: "50%",
                      background:
                        "radial-gradient(circle, rgba(255,255,255,.95) 0%, rgba(253,233,184,.5) 45%, transparent 75%)",
                      filter: "blur(6px)",
                      pointerEvents: "none",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={enviando}
                    style={{
                      position: "relative",
                      width: "100%",
                      height: 40,
                      border: 0,
                      borderRadius: 15,
                      background: `linear-gradient(110deg, rgba(255,255,255,.9), ${colors.violet} 32%, ${colors.water})`,
                      color: "#fff",
                      cursor: enviando ? "default" : "pointer",
                      opacity: enviando ? 0.75 : 1,
                      fontSize: 13,
                      fontWeight: 700,
                      boxShadow:
                        "0 15px 32px rgba(117,104,168,.24), 0 0 26px rgba(111,175,194,.13), 0 0 20px 2px rgba(255,247,220,.5)",
                    }}
                  >
                    {enviando ? "Ingresando…" : "Ingresar"}{" "}
                    {!enviando && <span style={{ marginLeft: 7 }}>→</span>}
                  </button>
                </div>

              </form>
              )}

              {modo === "pedir-codigo" && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ textAlign: "center" }}>
                    <h2
                      style={{
                        margin: "0 0 5px",
                        color: colors.night,
                        fontFamily: 'Georgia, "Times New Roman", serif',
                        fontSize: 17,
                        fontWeight: 400,
                      }}
                    >
                      Ingresá con un código
                    </h2>
                    <p
                      style={{
                        maxWidth: 280,
                        margin: "0 auto",
                        color: "rgba(23,35,61,.6)",
                        fontSize: 12,
                        lineHeight: 1.5,
                      }}
                    >
                      Te vamos a enviar un código de un solo uso para que
                      puedas entrar — por email si es tu primera vez, o por
                      Telegram si ya tenés una contraseña creada.
                    </p>
                  </div>

                  <label
                    style={{
                      display: "block",
                      margin: "12px 0 5px",
                      color: colors.blue,
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    Usuario de Telegram
                  </label>
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: 15,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "rgba(23,35,61,.4)",
                        fontSize: 13,
                        pointerEvents: "none",
                      }}
                    >
                      @
                    </span>
                    <input
                      placeholder="usuario"
                      value={identificador}
                      onChange={(e) => setIdentificador(e.target.value)}
                      autoComplete="username"
                      style={{
                        width: "100%",
                        height: 38,
                        padding: "0 15px 0 27px",
                        boxSizing: "border-box",
                        border: "1px solid rgba(38,58,99,.12)",
                        borderRadius: 14,
                        outline: "none",
                        background: "rgba(255,255,255,.65)",
                        color: colors.night,
                        fontSize: 13,
                      }}
                    />
                  </div>

                  {loginError && (
                    <p
                      style={{
                        margin: "10px 0 0",
                        color: "#A32D2D",
                        fontSize: 11,
                        lineHeight: 1.4,
                      }}
                    >
                      {loginError}{" "}
                      {esErrorNoEncontrado(loginError) && (
                        <Link href="/unite" style={{ color: colors.violet, fontWeight: 700 }}>
                          Unite acá
                        </Link>
                      )}
                      {esErrorSinBot(loginError) && (
                        <a
                          href="https://t.me/VerificacionesResonanciaBot"
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: colors.violet, fontWeight: 700 }}
                        >
                          Abrir bot →
                        </a>
                      )}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={onPedirCodigo}
                    disabled={enviando}
                    style={{
                      width: "100%",
                      height: 40,
                      marginTop: 14,
                      border: 0,
                      borderRadius: 15,
                      background: `linear-gradient(110deg, rgba(255,255,255,.9), ${colors.violet} 32%, ${colors.water})`,
                      color: "#fff",
                      cursor: enviando ? "default" : "pointer",
                      opacity: enviando ? 0.75 : 1,
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {enviando ? "Enviando…" : "Enviar código"}
                  </button>

                  <button
                    type="button"
                    onClick={volverAPassword}
                    style={{
                      display: "block",
                      margin: "10px auto 0",
                      border: 0,
                      padding: 0,
                      background: "transparent",
                      color: colors.violet,
                      cursor: "pointer",
                      fontSize: 11,
                    }}
                  >
                    ← Volver
                  </button>
                </div>
              )}

              {modo === "verificar-codigo" && (
                <form onSubmit={onVerificarCodigo} style={{ marginTop: 10 }}>
                  <div style={{ textAlign: "center" }}>
                    <h2
                      style={{
                        margin: "0 0 5px",
                        color: colors.night,
                        fontFamily: 'Georgia, "Times New Roman", serif',
                        fontSize: 17,
                        fontWeight: 400,
                      }}
                    >
                      Ingresá el código
                    </h2>
                    <p
                      style={{
                        maxWidth: 280,
                        margin: "0 auto",
                        color: "rgba(23,35,61,.6)",
                        fontSize: 12,
                        lineHeight: 1.5,
                      }}
                    >
                      {canalCodigo === "telegram"
                        ? "Te lo enviamos por Telegram."
                        : `Te lo enviamos a ${mailOculto ?? "tu email"}.`}{" "}
                      Vale por 10 minutos.
                    </p>
                  </div>

                  <label
                    style={{
                      display: "block",
                      margin: "12px 0 5px",
                      color: colors.blue,
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    Código
                  </label>
                  <input
                    placeholder="000000"
                    value={codigo}
                    onChange={(e) =>
                      setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                    style={{
                      width: "100%",
                      height: 38,
                      padding: "0 15px",
                      boxSizing: "border-box",
                      border: "1px solid rgba(38,58,99,.12)",
                      borderRadius: 14,
                      outline: "none",
                      background: "rgba(255,255,255,.65)",
                      color: colors.night,
                      fontSize: 15,
                      letterSpacing: ".2em",
                      textAlign: "center",
                    }}
                  />

                  <label
                    style={{
                      display: "block",
                      margin: "9px 0 4px",
                      color: colors.blue,
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {canalCodigo === "telegram"
                      ? "Elegí tu nueva contraseña"
                      : "Creá una contraseña para futuros ingresos (opcional)"}
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={nuevaPassword}
                    onChange={(e) => setNuevaPassword(e.target.value)}
                    required={canalCodigo === "telegram"}
                    autoComplete="new-password"
                    style={{
                      width: "100%",
                      height: 38,
                      padding: "0 15px",
                      boxSizing: "border-box",
                      border: "1px solid rgba(38,58,99,.12)",
                      borderRadius: 14,
                      outline: "none",
                      background: "rgba(255,255,255,.65)",
                      color: colors.night,
                      fontSize: 13,
                    }}
                  />

                  {nuevaPassword && (
                    <input
                      type="password"
                      placeholder="Repetí la contraseña"
                      value={confirmarPassword}
                      onChange={(e) => setConfirmarPassword(e.target.value)}
                      autoComplete="new-password"
                      style={{
                        width: "100%",
                        height: 38,
                        marginTop: 7,
                        padding: "0 15px",
                        boxSizing: "border-box",
                        border: "1px solid rgba(38,58,99,.12)",
                        borderRadius: 14,
                        outline: "none",
                        background: "rgba(255,255,255,.65)",
                        color: colors.night,
                        fontSize: 13,
                      }}
                    />
                  )}

                  {loginError && (
                    <p
                      style={{
                        margin: "10px 0 0",
                        color: "#A32D2D",
                        fontSize: 11,
                        lineHeight: 1.4,
                      }}
                    >
                      {loginError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={enviando}
                    style={{
                      width: "100%",
                      height: 40,
                      marginTop: 14,
                      border: 0,
                      borderRadius: 15,
                      background: `linear-gradient(110deg, rgba(255,255,255,.9), ${colors.violet} 32%, ${colors.water})`,
                      color: "#fff",
                      cursor: enviando ? "default" : "pointer",
                      opacity: enviando ? 0.75 : 1,
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {enviando
                      ? "Verificando…"
                      : nuevaPassword
                      ? "Guardar y entrar"
                      : "Entrar con el código recibido"}
                  </button>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: 10,
                    }}
                  >
                    <button
                      type="button"
                      onClick={volverAPassword}
                      style={{
                        border: 0,
                        padding: 0,
                        background: "transparent",
                        color: colors.violet,
                        cursor: "pointer",
                        fontSize: 11,
                      }}
                    >
                      ← Volver
                    </button>
                    <button
                      type="button"
                      onClick={onPedirCodigo}
                      disabled={enviando}
                      style={{
                        border: 0,
                        padding: 0,
                        background: "transparent",
                        color: colors.violet,
                        cursor: enviando ? "default" : "pointer",
                        fontSize: 11,
                      }}
                    >
                      Reenviar código
                    </button>
                  </div>
                </form>
              )}

              <div style={{ textAlign: "center", marginTop: 12, display: "grid", gap: 16 }}>
                <a
                  href="https://t.me/VerificacionesResonanciaBot"
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: 11, color: "rgba(23,35,61,.5)", textDecoration: "none" }}
                >
                  ¿Necesitás ayuda? Contactate con el equipo.
                </a>
                <Link
                  href="/admin/login"
                  style={{
                    fontSize: 11,
                    color: colors.blue,
                    textDecoration: "none",
                    borderBottom: "1px solid rgba(38,58,99,.25)",
                    paddingBottom: 1,
                    justifySelf: "center",
                  }}
                >
                  ¿Sos parte del equipo de verificación? Ingresá acá →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer / RGPD */}
      <footer
        style={{
          position: "relative",
          zIndex: 3,
          textAlign: "center",
          padding: "10px 20px",
          margin: "4px auto 0",
          maxWidth: 480,
          fontSize: 11,
          color: "rgba(23,35,61,.85)",
          background: "rgba(255,255,255,.65)",
          backdropFilter: "blur(10px)",
          borderRadius: 12,
        }}
      >
        Tus datos personales se usan únicamente para verificar tus aportes. La
        participación y el aporte de datos son voluntarios.{" "}
        <Link href="/privacidad" style={{ color: colors.blue, textDecoration: "underline" }}>
          Más información
        </Link>
      </footer>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes rp-halo-breathe {
          0%, 100% {
            box-shadow: 0 0 0 8px rgba(255,255,255,.10), 0 0 40px rgba(199,169,104,.16);
          }
          50% {
            box-shadow: 0 0 0 13px rgba(255,255,255,.16), 0 0 58px rgba(199,169,104,.30);
          }
        }
        .rp-halo-breathe { animation: rp-halo-breathe 3.6s ease-in-out infinite; }
        @keyframes rp-card-appear {
          0% { opacity: 0; transform: scale(.97) translateY(26px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .rp-card-appear {
          opacity: 0;
          animation: rp-card-appear 1.8s cubic-bezier(0.23, 1, 0.32, 1) 2.5s forwards;
        }
        .rp-panel-flash {
          position: absolute;
          inset: 0;
          z-index: 5;
          border-radius: 31px;
          background: radial-gradient(circle at 50% 38%, rgba(255,255,255,.9) 0%, rgba(255,250,235,.35) 45%, transparent 75%);
          opacity: 0;
          pointer-events: none;
          animation: rp-panel-flash-anim 1.1s ease-out 4.1s 1;
        }
        @keyframes rp-panel-flash-anim {
          0% { opacity: 0; }
          30% { opacity: .85; }
          100% { opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .rp-card-appear { opacity: 1; animation: none; }
          .rp-panel-flash { animation: none; opacity: 0; }
        }
        input:focus {
          border-color: rgba(117,104,168,.52) !important;
          box-shadow: 0 0 0 4px rgba(117,104,168,.09) !important;
        }
        button { transition: transform .18s ease, box-shadow .18s ease, opacity .18s ease; }
        button:hover { transform: translateY(-1px); }
        button:active { transform: translateY(0); }
        .rp-intro-copy { margin-left: auto; margin-right: auto; }
        .rp-portal-wrap { margin: 0 auto; }
        @media (min-width: 900px) {
          .rp-grid { transform: translateY(-56px); }
        }
        @media (max-width: 560px) {
          .rp-topbar { padding: 20px 17px !important; }
          .rp-secure-status { display: none !important; }
          .rp-brand-name { font-size: 10px !important; }
          h1 { font-size: 40px !important; }
          .rp-login-card { padding: 28px 22px !important; border-radius: 26px !important; }
        }
      `,
        }}
      />
    </main>
  );
}
