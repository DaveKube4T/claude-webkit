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

function PromoAleman() {
  const [hover, setHover] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [copiado, setCopiado] = useState<string | null>(null);

  function copiarTexto(texto: string, clave: string) {
    navigator.clipboard.writeText(texto);
    setCopiado(clave);
    setTimeout(() => setCopiado(null), 2000);
  }

  return (
    <>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          marginTop: 20,
          borderRadius: 20,
          overflow: "hidden",
          position: "relative",
          background: "linear-gradient(135deg, #2A1F4A 0%, #3D2E6B 60%, #7568A8 100%)",
          boxShadow: hover
            ? "0 8px 32px rgba(117,104,168,.55)"
            : "0 4px 20px rgba(117,104,168,.25)",
          transform: hover ? "translateY(-2px)" : "translateY(0)",
          transition: "box-shadow .2s ease, transform .2s ease",
        }}
      >
        {/* Badge Nuevo */}
        <div
          style={{
            position: "absolute",
            top: 14,
            left: 14,
            zIndex: 2,
            background: "#C7A968",
            color: "#fff",
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: ".12em",
            padding: "4px 10px",
            borderRadius: 999,
          }}
        >
          NUEVO
        </div>

        {/* Imagen */}
        <div style={{ position: "relative", width: "100%", height: 180 }}>
          <Image
            src="/images/packs/aleman.png"
            alt="Alemán con Acceso y Activación"
            fill
            sizes="480px"
            style={{ objectFit: "cover", objectPosition: "center", opacity: .7 }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to bottom, transparent 30%, rgba(42,31,74,.95) 100%)",
            }}
          />
        </div>

        {/* Texto y botones */}
        <div style={{ padding: "0 18px 18px", marginTop: -28, position: "relative", zIndex: 1 }}>
          <p
            style={{
              margin: "0 0 4px",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: ".16em",
              color: "#C7A968",
            }}
          >
            PAQUETE DISPONIBLE
          </p>
          <p
            style={{
              margin: "0 0 8px",
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: 20,
              fontWeight: 400,
              color: "#fff",
              lineHeight: 1.25,
            }}
          >
            Alemán con Acceso y Activación
          </p>

          <p
            style={{
              margin: "0 0 14px",
              fontSize: 11,
              fontWeight: 600,
              color: "rgba(255,255,255,.65)",
              letterSpacing: ".04em",
              lineHeight: 1.5,
            }}
          >
            PROGRAMA COMPLETO: Activo + Pasaporte Soberano + Med Bed + Proyectos Humanitarios
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <Link
              href="/miembro/solicitudes"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(255,255,255,.12)",
                border: "1px solid rgba(255,255,255,.25)",
                borderRadius: 10,
                padding: "8px 16px",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Solicitar →
            </Link>
            <button
              onClick={() => setModalAbierto(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(199,169,104,.25)",
                border: "1px solid rgba(199,169,104,.5)",
                borderRadius: 10,
                padding: "8px 16px",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Ver Instrucciones 📋
            </button>
            <a
              href="https://t.me/+s8-olxXZwjk0NmIx"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(42,171,238,.18)",
                border: "1px solid rgba(42,171,238,.35)",
                borderRadius: 10,
                padding: "8px 16px",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Consultas →
            </a>
          </div>
        </div>
      </div>

      {/* Modal de Instrucciones */}
      {modalAbierto && (
        <div
          onClick={() => setModalAbierto(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: "24px 20px",
              maxWidth: 480,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              color: "#17233D",
              boxShadow: "0 20px 40px rgba(0,0,0,.3)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontFamily: 'Georgia, serif' }}>Instrucciones de Pago</h3>
              <button
                onClick={() => setModalAbierto(false)}
                style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#17233D" }}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: 13, display: "grid", gap: 14, lineHeight: 1.5 }}>
              <div>
                <p style={{ fontWeight: 700, margin: "0 0 6px", color: "#7568A8" }}>Opciones de cuentas oficiales:</p>

                {/* NEQUI 1 */}
                <div style={{ background: "#F2F6F6", padding: 10, borderRadius: 10, marginBottom: 8 }}>
                  <p style={{ margin: 0, fontWeight: 700 }}>NEQUI 1:</p>
                  <p style={{ margin: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>Número: <strong>+57 3103979865</strong></span>
                    <button
                      onClick={() => copiarTexto("+57 3103979865", "nequi1")}
                      style={{ fontSize: 11, background: "#7568A8", color: "#fff", border: "none", borderRadius: 6, padding: "2px 8px", cursor: "pointer" }}
                    >
                      {copiado === "nequi1" ? "¡Copiado!" : "Copiar"}
                    </button>
                  </p>
                  <p style={{ margin: 2 }}>Titular: Jesús Amortegui</p>
                  <p style={{ margin: 2 }}>Cédula: 1104703922</p>
                </div>

                {/* NEQUI 2 */}
                <div style={{ background: "#F2F6F6", padding: 10, borderRadius: 10, marginBottom: 8 }}>
                  <p style={{ margin: 0, fontWeight: 700 }}>NEQUI 2:</p>
                  <p style={{ margin: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>Número: <strong>+57 3125223246</strong></span>
                    <button
                      onClick={() => copiarTexto("+57 3125223246", "nequi2")}
                      style={{ fontSize: 11, background: "#7568A8", color: "#fff", border: "none", borderRadius: 6, padding: "2px 8px", cursor: "pointer" }}
                    >
                      {copiado === "nequi2" ? "¡Copiado!" : "Copiar"}
                    </button>
                  </p>
                  <p style={{ margin: 2 }}>Titular: Mayerlis Santos Carrascal</p>
                </div>

                {/* APP LITTIO */}
                <div style={{ background: "#F2F6F6", padding: 10, borderRadius: 10, marginBottom: 8 }}>
                  <p style={{ margin: 0, fontWeight: 700 }}>APP LITTIO:</p>
                  <p style={{ margin: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>Número: <strong>+57 3125223246</strong></span>
                    <button
                      onClick={() => copiarTexto("+57 3125223246", "littio")}
                      style={{ fontSize: 11, background: "#7568A8", color: "#fff", border: "none", borderRadius: 6, padding: "2px 8px", cursor: "pointer" }}
                    >
                      {copiado === "littio" ? "¡Copiado!" : "Copiar"}
                    </button>
                  </p>
                  <p style={{ margin: 2 }}>Titular: Mayerlis Santos Carrascal</p>
                </div>
              </div>

              <div style={{ background: "#FAEEDA", padding: 10, borderRadius: 10, color: "#854F0B", fontWeight: 600 }}>
                💡 Deben llegar 400.000 Cops (130 Usd aprox)
              </div>

              <p style={{ margin: 0, fontSize: 12, color: "rgba(23,35,61,.7)" }}>
                👉 En caso de no poder hacer envío a Nequi, comunícate con tu colaborador de confianza para que te ayuden con otros medios de pago.
              </p>

              <div style={{ borderTop: "1px solid rgba(23,35,61,.1)", paddingTop: 10 }}>
                <p style={{ fontWeight: 700, margin: "0 0 4px" }}>SUBIR CAPTURA DE PANTALLA MARCADA CON:</p>
                <p style={{ margin: 0, whiteSpace: "pre-line", fontSize: 12, background: "#F9FBFB", padding: 8, borderRadius: 8 }}>
                  ALEMAN A.A{"\n"}
                  Invita RESONANCIA{"\n"}
                  Nombre completo:{"\n"}
                  Usuario:{"\n"}
                  Telefono:{"\n"}
                  Pasaporte/Cedula:{"\n"}
                  Mail:{"\n"}
                  Colaborador:
                </p>
              </div>

              <div>
                <p style={{ fontWeight: 700, margin: "0 0 6px" }}>LUEGO INGRESA A ESTOS GRUPOS (espera admisión):</p>
                <div style={{ display: "grid", gap: 8 }}>
                  <a
                    href="https://t.me/+H5klL4Fi-yswNGMx"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "block",
                      textAlign: "center",
                      background: "#2AABEE",
                      color: "#fff",
                      padding: "10px",
                      borderRadius: 10,
                      fontWeight: 700,
                      textDecoration: "none",
                      fontSize: 13,
                    }}
                  >
                    GRUPO PRIVADO TELEGRAM →
                  </a>
                  <a
                    href="https://signal.group/#CjQKII0yOkrXiG7u_Sk8Y3TFeUsi1B60gLg5LdJy5j3nSW6aEhCsSxNeK9Mj69NXUf7SyICv"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "block",
                      textAlign: "center",
                      background: "#3A76F0",
                      color: "#fff",
                      padding: "10px",
                      borderRadius: 10,
                      fontWeight: 700,
                      textDecoration: "none",
                      fontSize: 13,
                    }}
                  >
                    GRUPO PRIVADO SIGNAL →
                  </a>
                </div>
              </div>

              <div style={{ background: "#FCEBEB", padding: 12, borderRadius: 10, color: "#A32D2D" }}>
                <p style={{ fontWeight: 800, margin: "0 0 4px" }}>MUY IMPORTANTE!!</p>
                <p style={{ margin: 0, fontSize: 12 }}>
                  AVISAR A TU COLABORADOR DE CONFIANZA ASÍ TE ADMITEN EN LOS GRUPOS Y TE DAN LOS SIGUIENTES PASOS
                </p>
              </div>

              <div>
                <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 600 }}>SINO TIENES COLABORADOR PREGUNTA EN ESTE GRUPO DE TELEGRAM:</p>
                <a
                  href="https://t.me/+s8-olxXZwjk0NmIx"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "block",
                    textAlign: "center",
                    background: "#7568A8",
                    color: "#fff",
                    padding: "10px",
                    borderRadius: 10,
                    fontWeight: 700,
                    textDecoration: "none",
                    fontSize: 13,
                  }}
                >
                  ABRIR GRUPO DE CONSULTAS →
                </a>
              </div>

            </div>

            {/* Botón Cerrar fijo abajo con separación */}
            <div style={{ marginTop: 24, paddingBottom: 20 }}>
              <button
                onClick={() => setModalAbierto(false)}
                style={{
                  width: "100%",
                  background: "#17233D",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  padding: "14px",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(23,35,61,.2)",
                }}
              >
                Cerrar instrucciones
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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

        {/* Tarjeta para quienes ya tienen Acceso y Activación */}
        {compras !== null && compras.some((c) => /acceso\s*y\s*activaci[oó]n/i.test(c.paquete)) && (
          <div
            style={{
              marginTop: 20,
              borderRadius: 20,
              background: "linear-gradient(135deg, #17233D 0%, #263A63 100%)",
              padding: "20px",
              color: "#fff",
              boxShadow: "0 4px 20px rgba(23,35,61,.2)",
            }}
          >
            <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 700, letterSpacing: ".16em", color: "#C7A968" }}>
              ACCESO ACTIVO
            </p>
            <h3 style={{ margin: "0 0 8px", fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 400 }}>
              Tus Grupos Privados - Acceso y Activación
            </h3>
            <p style={{ margin: "0 0 14px", fontSize: 12, color: "rgba(255,255,255,.7)", lineHeight: 1.4 }}>
              Ya tenés este pack activo. Debes estar en estos grupos privados (espera admisión):
            </p>
            <div style={{ display: "grid", gap: 8 }}>
              <a
                href="https://t.me/+H5klL4Fi-yswNGMx"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  textAlign: "center",
                  background: "#2AABEE",
                  color: "#fff",
                  padding: "10px",
                  borderRadius: 10,
                  fontWeight: 700,
                  textDecoration: "none",
                  fontSize: 13,
                }}
              >
                GRUPO PRIVADO TELEGRAM →
              </a>
              <div>
                <a
                  href="https://signal.group/#CjQKIMNdhGSZVIK3DTotm0a04xCIOuozZi-hUc9a_-XDLKO5EhDKDmxWBby4A02-OULBUXqs"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "block",
                    textAlign: "center",
                    background: "#3A76F0",
                    color: "#fff",
                    padding: "10px",
                    borderRadius: 10,
                    fontWeight: 700,
                    textDecoration: "none",
                    fontSize: 13,
                  }}
                >
                  GRUPO PRIVADO SIGNAL →
                </a>
                <p style={{ margin: "4px 0 0", fontSize: 10.5, color: "rgba(255,255,255,.5)", textAlign: "center" }}>
                  Este es solo un grupo back up (tené paciencia para la admisión).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Promo alemán — solo si no tiene ese paquete */}
        {compras !== null && !compras.some((c) => /alem[aá]n/i.test(c.paquete)) && (
          <PromoAleman />
        )}

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
