"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useMemberAuth } from "@/lib/member-auth-context";
import MemberBottomNav from "@/components/MemberBottomNav";

const colors = {
  ivory: "#F2F6F6",
  night: "#17233D",
  blue: "#263A63",
  violet: "#7568A8",
  gold: "#C7A968",
};

const ESTADO_ESTILO: Record<string, { color: string; fondo: string; label: string }> = {
  pendiente: { color: "#854F0B", fondo: "#FAEEDA", label: "Pendiente" },
  verificada: { color: "#3B6D11", fondo: "#EAF3DE", label: "Verificada" },
  rechazada: { color: "#A32D2D", fondo: "#FCEBEB", label: "Rechazada" },
  error_reportado: { color: "#A32D2D", fondo: "#FCEBEB", label: "Error reportado" },
};

function imagenDePaquete(paquete: string): string | null {
  if (/origen/i.test(paquete)) return "/images/packs/origen.png";
  if (/sociedad\s*an[oó]nima|armado de s\.?a\.?/i.test(paquete)) return "/images/packs/sociedad-anonima.png";
  const match = paquete.match(/pack\s*(\d)/i);
  if (!match) return null;
  return `/images/packs/pack-${match[1]}.png`;
}

interface Compra {
  id: string;
  paquete: string;
  lider: string | null;
  participaciones: number | null;
  monto: number | null;
  moneda: string | null;
  hash: string | null;
  vouchers: { url: string }[] | null;
  estado: string;
  creada_en: string;
}

function SacredCircle() {
  return (
    <div
      style={{
        width: 52,
        height: 52,
        margin: "0 auto 14px",
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        background:
          "radial-gradient(circle, rgba(255,255,255,.96), rgba(220,216,242,.30))",
      }}
    >
      <div style={{ width: 38, height: 38, position: "relative" }}>
        <Image
          src="/images/brand-mark.png"
          alt=""
          fill
          priority
          sizes="76px"
          style={{ objectFit: "contain" }}
        />
      </div>
    </div>
  );
}

export default function MiembroPage() {
  const { miembro, cargando, logout, fetchAutenticado } = useMemberAuth();
  const [compras, setCompras] = useState<Compra[] | null>(null);

  const cargarCompras = useCallback(async () => {
    const res = await fetchAutenticado("/api/miembro/compras");
    if (res.ok) {
      const data = await res.json();
      setCompras(data.compras);
    }
  }, [fetchAutenticado]);

  useEffect(() => {
    if (miembro) cargarCompras();
  }, [miembro, cargarCompras]);

  if (cargando || !miembro) {
    return (
      <main
        className="rp-bg-soft"
        style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}
      >
        <p style={{ color: colors.night, fontFamily: "sans-serif" }}>Cargando…</p>
      </main>
    );
  }

  return (
    <main
      className="rp-bg-soft"
      style={{
        minHeight: "100vh",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: colors.night,
        padding: "28px 18px 90px",
      }}
    >
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <SacredCircle />
          <p
            style={{
              margin: 0,
              color: colors.violet,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: ".18em",
            }}
          >
            RESONANCIA GLOBAL
          </p>
          <h1
            style={{
              margin: "6px 0 0",
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontWeight: 400,
              fontSize: 24,
            }}
          >
            Hola, {miembro.nombre.split(" ")[0]}
          </h1>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <h2 className="rp-titulo" style={{ margin: 0, fontSize: 15 }}>Mis aportes</h2>
          <button
            onClick={logout}
            style={{
              border: "1px solid rgba(23,35,61,.15)",
              background: "rgba(255,255,255,.7)",
              borderRadius: 10,
              padding: "8px 14px",
              fontSize: 12,
              cursor: "pointer",
              color: colors.night,
            }}
          >
            Cerrar sesión
          </button>
        </div>

        {compras === null && (
          <p style={{ textAlign: "center", color: "rgba(23,35,61,.55)", fontSize: 14 }}>
            Cargando tus aportes…
          </p>
        )}

        {compras !== null && compras.length === 0 && (
          <div
            style={{
              background: "rgba(255,255,255,.7)",
              borderRadius: 18,
              padding: "28px 20px",
              textAlign: "center",
              color: "rgba(23,35,61,.6)",
              fontSize: 14,
            }}
          >
            Todavía no tenés aportes cargados acá. Si ya hiciste uno, contactate
            con el equipo o usá &quot;Tengo compras sin registrar&quot; (próximamente).
          </div>
        )}

        <div style={{ display: "grid", gap: 12 }}>
          {compras?.map((c) => {
            const estilo = ESTADO_ESTILO[c.estado] ?? ESTADO_ESTILO.pendiente;
            return (
              <div
                key={c.id}
                className="rp-tarjeta-compra"
                style={{
                  background: "rgba(255,255,255,.75)",
                  backdropFilter: "blur(10px)",
                  borderRadius: 18,
                  padding: "16px 18px",
                  boxShadow: "0 10px 30px rgba(23,35,61,.06)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  {imagenDePaquete(c.paquete) && (
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        overflow: "hidden",
                        position: "relative",
                        flexShrink: 0,
                      }}
                    >
                      <Image src={imagenDePaquete(c.paquete)!} alt={c.paquete} fill sizes="44px" style={{ objectFit: "cover", objectPosition: "center" }} />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <p className="rp-titulo" style={{ margin: 0, fontSize: 15 }}>
                      {c.paquete}
                    </p>
                    {c.lider && (
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(23,35,61,.55)" }}>
                        Colaboradora: {c.lider}
                      </p>
                    )}
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(23,35,61,.45)" }}>
                      {new Date(c.creada_en).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                      {c.monto != null ? ` · ${c.monto} ${c.moneda ?? "USDT"}` : ""}
                      {c.participaciones != null ? ` · Cant: ${c.participaciones}` : ""}
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: estilo.color,
                      background: estilo.fondo,
                      padding: "5px 10px",
                      borderRadius: 999,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {estilo.label}
                  </span>
                </div>

                <Link
                  href={`/miembro/compra/${c.id}`}
                  style={{
                    marginTop: 10,
                    display: "inline-block",
                    border: "none",
                    background: "transparent",
                    color: colors.violet,
                    fontSize: 12,
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Ver comprobante →
                </Link>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Link href="/" style={{ fontSize: 12, color: colors.blue, textDecoration: "underline" }}>
            ← Salir al inicio
          </Link>
        </div>
      </div>
      <MemberBottomNav />
    </main>
  );
}
