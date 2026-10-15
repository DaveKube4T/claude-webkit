"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemberAuth } from "@/lib/member-auth-context";

const colors = {
  night: "#17233D",
  blue: "#263A63",
  water: "#6FAFC2",
  violet: "#7568A8",
  gold: "#C7A968",
};

export default function AceptarDisclaimerPage() {
  const { fetchAutenticado, marcarDisclaimerAceptado } = useMemberAuth();
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);

  async function aceptar() {
    setEnviando(true);
    const res = await fetchAutenticado("/api/miembro/aceptar-disclaimer", {
      method: "POST",
    });
    setEnviando(false);
    if (res.ok) {
      marcarDisclaimerAceptado();
      router.push("/miembro");
    }
  }

  return (
    <main
      className="rp-bg"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        color: colors.night,
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
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

      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: 440,
          padding: "clamp(24px, 5vw, 40px)",
          borderRadius: 28,
          border: "1px solid rgba(255,255,255,.77)",
          background: "rgba(255,255,255,.6)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: "0 38px 95px rgba(38,58,99,.16), 0 8px 35px rgba(255,255,255,.38) inset",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div style={{ width: 52, height: 52, position: "relative", margin: "0 auto 14px" }}>
            <Image src="/images/brand-mark.png" alt="" fill priority sizes="52px" style={{ objectFit: "contain" }} />
          </div>
          <h1
            style={{
              margin: 0,
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontWeight: 400,
              fontSize: 24,
              color: colors.night,
            }}
          >
            Antes de continuar
          </h1>
        </div>

        <ul style={{ margin: 0, padding: "0 0 0 20px", color: "rgba(23,35,61,.8)", fontSize: 14, lineHeight: 1.7 }}>
          <li>
            Tus datos personales se tratan de forma <strong>confidencial</strong> y se
            usan para verificar tu aporte y para contactarte.
          </li>
          <li style={{ marginTop: 10 }}>
            Tu aporte es <strong>completamente voluntario</strong>.
          </li>
          <li style={{ marginTop: 10 }}>
            Cualquier distribución está sujeta a que los proyectos y procesos
            correspondientes se completen, según las condiciones de cada caso. Tenemos
            como objetivo brindarte la ayuda para que estés listo y preparado para
            recibir tus recursos.
          </li>
        </ul>

        <button
          onClick={aceptar}
          disabled={enviando}
          style={{
            display: "block",
            marginTop: 26,
            width: "100%",
            height: 46,
            border: "none",
            borderRadius: 15,
            background: `linear-gradient(110deg, ${colors.violet}, ${colors.water})`,
            color: "#fff",
            fontSize: 14,
            fontWeight: 700,
            cursor: enviando ? "default" : "pointer",
            opacity: enviando ? 0.75 : 1,
            boxShadow: "0 15px 32px rgba(117,104,168,.24), 0 0 26px rgba(111,175,194,.13)",
          }}
        >
          {enviando ? "Guardando…" : "Acepto y continúo"}
        </button>

        <p style={{ textAlign: "center", marginTop: 14, fontSize: 11, color: "rgba(23,35,61,.5)" }}>
          <Link href="/privacidad" style={{ color: colors.blue }}>
            Ver política de privacidad completa
          </Link>
        </p>
      </div>
    </main>
  );
}
