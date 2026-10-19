"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useMemberAuth } from "@/lib/member-auth-context";
import MemberBottomNav from "@/components/MemberBottomNav";
import {
  CATEGORIAS_LEGALES,
  JURISDICCIONES_DISPONIBLES,
  CategoriaLegal,
} from "@/lib/legal-categorias";

const colors = {
  night: "#17233D",
  violet: "#7568A8",
  gold: "#C7A968",
  ivory: "#F2F6F6",
};

interface Turno {
  rol: "user" | "assistant";
  texto: string;
  en: string;
}

export default function OrientacionLegalPage() {
  const { miembro, cargando, fetchAutenticado } = useMemberAuth();
  const [jurisdiccion, setJurisdiccion] = useState("GLOBAL");
  const [categoriaActiva, setCategoriaActiva] = useState<string>(CATEGORIAS_LEGALES[0].id);
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historial, setHistorial] = useState<Turno[]>([]);
  const finChatRef = useRef<HTMLDivElement>(null);

  const catActual: CategoriaLegal =
    CATEGORIAS_LEGALES.find((c) => c.id === categoriaActiva) ?? CATEGORIAS_LEGALES[0];

  useEffect(() => {
    finChatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [historial.length, enviando]);

  async function enviarConsulta(textoAEnviar?: string) {
    const texto = (textoAEnviar ?? mensaje).trim();
    if (!texto || enviando) return;

    setEnviando(true);
    setError(null);
    setMensaje("");

    const nuevoTurnoUsuario: Turno = {
      rol: "user",
      texto,
      en: new Date().toISOString(),
    };

    const historialActualizado = [...historial, nuevoTurnoUsuario];
    setHistorial(historialActualizado);

    try {
      const res = await fetchAutenticado("/api/miembro/legal/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensaje: texto,
          jurisdiccion,
          categoria: categoriaActiva,
          historial: historialActualizado.map((h) => ({ rol: h.rol, texto: h.texto })),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "No se pudo procesar la consulta.");
      } else if (data.respuesta) {
        setHistorial([
          ...historialActualizado,
          {
            rol: "assistant",
            texto: data.respuesta,
            en: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      setError("Error de conexión al procesar la orientación legal.");
    } finally {
      setEnviando(false);
    }
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    enviarConsulta();
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #F9FBFC 0%, #F0F4F8 100%)",
        color: colors.night,
        paddingBottom: 110,
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "16px 14px" }}>
        {/* Cabecera */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <Link
            href="/miembro"
            style={{
              fontSize: 12,
              color: colors.violet,
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            ← Volver a Miembro
          </Link>
          <div style={{ display: "flex", gap: 10, fontSize: 12 }}>
            <Link
              href="/miembro/plan-de-vida"
              style={{ color: "rgba(23,35,61,.7)", textDecoration: "none", fontWeight: 600 }}
            >
              🧭 Plan de Vida
            </Link>
            <Link
              href="/miembro/perfil-financiero"
              style={{ color: "rgba(23,35,61,.7)", textDecoration: "none", fontWeight: 600 }}
            >
              💰 P. Financiero
            </Link>
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: 18,
            border: "1px solid rgba(23,35,61,.08)",
            padding: "18px 18px 14px",
            boxShadow: "0 6px 24px rgba(23,35,61,.04)",
            marginBottom: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 28 }}>⚖️</span>
            <div>
              <h1
                style={{
                  fontSize: 20,
                  margin: 0,
                  fontFamily: "Georgia, serif",
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                }}
              >
                Orientación Legal Estratégica
              </h1>
              <p style={{ margin: 0, fontSize: 12.5, color: "rgba(23,35,61,.6)" }}>
                Asistencia jurídica multijurisdiccional para blindaje patrimonial, corporativo, contratos y sucesiones.
              </p>
            </div>
          </div>

          {/* Banner de descargo legal */}
          <div
            style={{
              background: "rgba(117,104,168,.08)",
              border: "1px solid rgba(117,104,168,.2)",
              borderRadius: 10,
              padding: "10px 14px",
              marginTop: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>⚖️</span>
              <p style={{ fontSize: 11.5, color: colors.night, margin: 0, lineHeight: 1.4 }}>
                <strong>Nota legal y protección de datos</strong> — Esta orientación es informativa y asistida por IA con <strong>Zero Data Retention (ZDR)</strong> activo: tus consultas no se usan para entrenar modelos públicos y no son visibles para otros miembros. No sustituye el patrocinio o dictamen de un abogado matriculado.
              </p>
            </div>
          </div>

          {/* Selector de Jurisdicción */}
          <div style={{ marginTop: 14 }}>
            <label
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 800,
                color: "rgba(23,35,61,.7)",
                textTransform: "uppercase",
                letterSpacing: ".08em",
                marginBottom: 6,
              }}
            >
              Jurisdicción aplicable:
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {JURISDICCIONES_DISPONIBLES.map((j) => {
                const sel = j.codigo === jurisdiccion;
                return (
                  <button
                    key={j.codigo}
                    type="button"
                    onClick={() => setJurisdiccion(j.codigo)}
                    style={{
                      background: sel ? colors.night : "rgba(23,35,61,.04)",
                      color: sel ? "#fff" : colors.night,
                      border: sel ? `1px solid ${colors.night}` : "1px solid rgba(23,35,61,.1)",
                      borderRadius: 999,
                      padding: "5px 12px",
                      fontSize: 12,
                      fontWeight: sel ? 700 : 500,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      transition: "all .15s ease",
                    }}
                  >
                    <span>{j.bandera}</span>
                    <span>{j.nombre}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Categorías Especializadas (tipo ConsiliumxAI) */}
        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 8,
            }}
          >
            {CATEGORIAS_LEGALES.map((cat) => {
              const sel = cat.id === categoriaActiva;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoriaActiva(cat.id)}
                  style={{
                    background: sel ? "#fff" : "rgba(255,255,255,.6)",
                    border: sel ? `2px solid ${colors.violet}` : "1px solid rgba(23,35,61,.09)",
                    borderRadius: 14,
                    padding: "10px 12px",
                    textAlign: "left",
                    cursor: "pointer",
                    boxShadow: sel ? "0 4px 14px rgba(117,104,168,.18)" : "none",
                    transition: "all .15s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 18 }}>{cat.icono}</span>
                    <strong
                      style={{
                        fontSize: 12.5,
                        color: sel ? colors.violet : colors.night,
                        lineHeight: 1.2,
                      }}
                    >
                      {cat.titulo}
                    </strong>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 11,
                      color: "rgba(23,35,61,.6)",
                      lineHeight: 1.3,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {cat.descripcion}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Caja de Chat */}
        <div
          style={{
            background: "#fff",
            borderRadius: 18,
            border: "1px solid rgba(23,35,61,.08)",
            boxShadow: "0 8px 30px rgba(23,35,61,.04)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            minHeight: 460,
          }}
        >
          {/* Header del área de chat */}
          <div
            style={{
              padding: "12px 16px",
              background: "rgba(23,35,61,.02)",
              borderBottom: "1px solid rgba(23,35,61,.06)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>{catActual.icono}</span>
              <div>
                <strong style={{ fontSize: 13, color: colors.night }}>
                  {catActual.titulo}
                </strong>
                <span style={{ fontSize: 11, color: "rgba(23,35,61,.5)", marginLeft: 6 }}>
                  — Jurisdicción: {jurisdiccion}
                </span>
              </div>
            </div>
            {historial.length > 0 && (
              <button
                type="button"
                onClick={() => setHistorial([])}
                style={{
                  fontSize: 11,
                  background: "none",
                  border: "none",
                  color: "rgba(23,35,61,.5)",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Limpiar conversación
              </button>
            )}
          </div>

          {/* Historial de mensajes */}
          <div
            style={{
              flex: 1,
              padding: 16,
              overflowY: "auto",
              maxHeight: "55vh",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {historial.length === 0 ? (
              <div style={{ margin: "auto 0", padding: "20px 8px", textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🏛️</div>
                <h3
                  style={{
                    fontSize: 16,
                    margin: "0 0 6px",
                    fontFamily: "Georgia, serif",
                    fontWeight: 600,
                  }}
                >
                  Consulta jurídica en {catActual.titulo}
                </h3>
                <p
                  style={{
                    fontSize: 12.5,
                    color: "rgba(23,35,61,.6)",
                    maxWidth: 520,
                    margin: "0 auto 16px",
                    lineHeight: 1.45,
                  }}
                >
                  Escribe tu duda o haz clic en uno de los temas sugeridos para obtener un análisis legal estructurado y preventivo.
                </p>

                {/* Preguntas sugeridas */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    maxWidth: 540,
                    margin: "0 auto",
                    textAlign: "left",
                  }}
                >
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 800,
                      color: colors.violet,
                      textTransform: "uppercase",
                      letterSpacing: ".06em",
                    }}
                  >
                    Preguntas frecuentes sugeridas:
                  </span>
                  {catActual.ejemplos.map((ejemplo, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => enviarConsulta(ejemplo)}
                      style={{
                        background: "rgba(117,104,168,.06)",
                        border: "1px solid rgba(117,104,168,.16)",
                        borderRadius: 10,
                        padding: "9px 12px",
                        fontSize: 12,
                        color: colors.night,
                        cursor: "pointer",
                        textAlign: "left",
                        lineHeight: 1.35,
                        transition: "background .15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(117,104,168,.12)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(117,104,168,.06)")}
                    >
                      💡 {ejemplo}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              historial.map((turno, idx) => {
                const esUsuario = turno.rol === "user";
                return (
                  <div
                    key={idx}
                    style={{
                      alignSelf: esUsuario ? "flex-end" : "flex-start",
                      maxWidth: "85%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: esUsuario ? "flex-end" : "flex-start",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        color: "rgba(23,35,61,.45)",
                        marginBottom: 3,
                        fontWeight: 600,
                      }}
                    >
                      {esUsuario ? "Tú" : "Orientador Legal IA"}
                    </span>
                    <div
                      style={{
                        background: esUsuario ? colors.night : "rgba(23,35,61,.04)",
                        color: esUsuario ? "#fff" : colors.night,
                        border: esUsuario ? "none" : "1px solid rgba(23,35,61,.08)",
                        borderRadius: esUsuario ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                        padding: "12px 15px",
                        fontSize: 13,
                        lineHeight: 1.55,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {turno.texto}
                    </div>
                  </div>
                );
              })
            )}

            {enviando && (
              <div style={{ alignSelf: "flex-start", maxWidth: "80%" }}>
                <div
                  style={{
                    background: "rgba(117,104,168,.08)",
                    border: "1px solid rgba(117,104,168,.16)",
                    borderRadius: "16px 16px 16px 4px",
                    padding: "10px 14px",
                    fontSize: 12,
                    color: colors.violet,
                    fontStyle: "italic",
                  }}
                >
                  Analizando jurisprudencia y normativa aplicable...
                </div>
              </div>
            )}

            {error && (
              <div
                style={{
                  background: "#FCEBEB",
                  border: "1px solid #EAA0A0",
                  color: "#A32D2D",
                  borderRadius: 10,
                  padding: "9px 12px",
                  fontSize: 12,
                }}
              >
                ⚠️ {error}
              </div>
            )}
            <div ref={finChatRef} />
          </div>

          {/* Formulario de entrada */}
          <form
            onSubmit={handleFormSubmit}
            style={{
              padding: 12,
              borderTop: "1px solid rgba(23,35,61,.08)",
              background: "#FAFCFD",
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            <input
              type="text"
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder={`Escribe tu consulta legal sobre ${catActual.titulo}...`}
              disabled={enviando}
              style={{
                flex: 1,
                border: "1px solid rgba(23,35,61,.14)",
                borderRadius: 12,
                padding: "11px 14px",
                fontSize: 13,
                outline: "none",
                background: "#fff",
                color: colors.night,
              }}
            />
            <button
              type="submit"
              disabled={enviando || !mensaje.trim()}
              style={{
                background: colors.violet,
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "11px 18px",
                fontWeight: 700,
                fontSize: 13,
                cursor: enviando || !mensaje.trim() ? "not-allowed" : "pointer",
                opacity: enviando || !mensaje.trim() ? 0.6 : 1,
                boxShadow: "0 2px 8px rgba(117,104,168,.3)",
                transition: "opacity .15s ease",
              }}
            >
              Enviar
            </button>
          </form>
        </div>
      </div>

      <MemberBottomNav />
    </div>
  );
}
