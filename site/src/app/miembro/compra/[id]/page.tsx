"use client";

import { useCallback, useEffect, useRef, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useMemberAuth } from "@/lib/member-auth-context";
import MemberBottomNav from "@/components/MemberBottomNav";

const colors = {
  night: "#17233D",
  blue: "#263A63",
  violet: "#7568A8",
};

const ESTADO_ESTILO: Record<string, { color: string; fondo: string; label: string }> = {
  pendiente: { color: "#854F0B", fondo: "#FAEEDA", label: "Pendiente de verificación" },
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

const DESCRIPCION_PAQUETE: Record<string, string> = {
  "1": "Activación de Nodo (1 Dispositivo de 30 Bi Recargable) + Llave de Acceso (1 Certificado internacional de 50B) + Arca Guardiana de regalo (2 Unidades de Bien material).",
  "2": "Llave de Acceso (1 Certificado internacional de 50B) + Arca Guardiana (2 Unidades de Bien material).",
  "3": "Llave de Acceso (1 Certificado internacional de 50B) + Activación de Nodo (1 Dispositivo de 30 Bi Recargable) + Arca Guardiana (2 Unidades de Bien material).",
  "4": "Corporación + Fundación (Pack 1 y Pack 3 integrados en uno).",
  "5": "Reserva anticipada de la integración de Pack 4 (Corporación + Fundación).",
};

function descripcionDePaquete(paquete: string): string | null {
  const match = paquete.match(/pack\s*(\d)/i);
  if (!match) return null;
  return DESCRIPCION_PAQUETE[match[1]] ?? null;
}

interface Voucher {
  url: string;
  subido_en?: string;
}

interface CompraDetalle {
  id: string;
  paquete: string;
  lider: string | null;
  participaciones: number | null;
  monto: number | null;
  moneda: string | null;
  hash: string | null;
  vouchers: Voucher[] | null;
  estado: string;
  aprobado_por: string | null;
  reporte_miembro: string | null;
  nota_miembro: string | null;
  mensajes_admin: { autor_nombre: string; rol: string; texto: string; creado_en: string }[] | null;
  creada_en: string;
}

interface HashExtra {
  id: string;
  hash: string;
  creado_en: string;
}

export default function DetalleCompraPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { miembro, cargando, fetchAutenticado } = useMemberAuth();
  const [compra, setCompra] = useState<CompraDetalle | null>(null);
  const [hashesExtra, setHashesExtra] = useState<HashExtra[]>([]);
  const [nuevoHash, setNuevoHash] = useState("");
  const [mostrarFormHash, setMostrarFormHash] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const [mostrarFormError, setMostrarFormError] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cargar = useCallback(async () => {
    const res = await fetchAutenticado(`/api/miembro/compras/${id}`);
    if (res.ok) {
      const data = await res.json();
      setCompra(data.compra);
      setHashesExtra(data.hashesExtra);
    }
  }, [fetchAutenticado, id]);

  useEffect(() => {
    if (miembro) cargar();
  }, [miembro, cargar]);

  async function agregarHash(e: React.FormEvent) {
    e.preventDefault();
    if (!nuevoHash.trim()) return;
    const res = await fetchAutenticado(`/api/miembro/compras/${id}/hash`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hash: nuevoHash.trim() }),
    });
    if (res.ok) {
      setNuevoHash("");
      setMostrarFormHash(false);
      setAviso("Hash agregado.");
      cargar();
    } else {
      const data = await res.json();
      setAviso(data.error ?? "No se pudo agregar el hash.");
    }
  }

  async function subirComprobante(file: File) {
    setSubiendo(true);
    setAviso(null);
    const formData = new FormData();
    formData.append("archivo", file);
    const res = await fetchAutenticado(`/api/miembro/compras/${id}/comprobante`, {
      method: "POST",
      body: formData,
    });
    setSubiendo(false);
    if (res.ok) {
      setAviso("Comprobante agregado.");
      cargar();
    } else {
      const data = await res.json();
      setAviso(data.error ?? "No se pudo subir el comprobante.");
    }
  }

  async function reportarError(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetchAutenticado(`/api/miembro/compras/${id}/reportar-error`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mensaje: mensajeError.trim() }),
    });
    if (res.ok) {
      setMostrarFormError(false);
      setMensajeError("");
      setAviso("Reportaste un error en esta compra. El equipo lo va a revisar.");
      cargar();
    } else {
      const data = await res.json();
      setAviso(data.error ?? "No se pudo reportar el error.");
    }
  }

  function copiarHash(hash: string) {
    navigator.clipboard?.writeText(hash);
    setAviso("Hash copiado.");
  }

  if (cargando || !miembro || !compra) {
    return (
      <main className="rp-bg-glow" style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <p style={{ color: colors.night, fontFamily: "sans-serif" }}>Cargando…</p>
      </main>
    );
  }

  const estilo = ESTADO_ESTILO[compra.estado] ?? ESTADO_ESTILO.pendiente;
  const vouchers = compra.vouchers ?? [];

  return (
    <main
      className="rp-bg-glow"
      style={{
        minHeight: "100vh",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: colors.night,
        padding: "24px 18px 100px",
      }}
    >
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <Link
          href="/miembro"
          style={{
            fontSize: 12,
            color: colors.blue,
            textDecoration: "none",
            display: "inline-block",
            marginBottom: 14,
          }}
        >
          ← Mis Compras
        </Link>

        {imagenDePaquete(compra.paquete) && (
          <div
            style={{
              borderRadius: 14,
              overflow: "hidden",
              marginBottom: 14,
              position: "relative",
              width: 64,
              height: 64,
              flexShrink: 0,
              boxShadow: "0 6px 16px rgba(23,35,61,.12)",
            }}
          >
            <Image
              src={imagenDePaquete(compra.paquete)!}
              alt={compra.paquete}
              fill
              sizes="64px"
              style={{ objectFit: "cover", objectPosition: "center" }}
            />
          </div>
        )}

        <h1 className="rp-titulo" style={{ margin: "0 0 4px", fontSize: 20 }}>{compra.paquete}</h1>
        <p style={{ margin: "0 0 14px", fontSize: 12, color: "rgba(23,35,61,.5)" }}>
          {new Date(compra.creada_en).toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
          {compra.monto != null ? ` · ${compra.monto} ${compra.moneda ?? "USDT"}` : ""}
          {compra.participaciones != null ? ` · Cant: ${compra.participaciones}` : ""}
        </p>
        {descripcionDePaquete(compra.paquete) && (
          <p style={{ margin: "0 0 10px", fontSize: 13, color: "rgba(23,35,61,.65)", lineHeight: 1.5 }}>
            {descripcionDePaquete(compra.paquete)}
          </p>
        )}
        {compra.lider && (
          <p style={{ margin: "0 0 12px", fontSize: 13, color: "rgba(23,35,61,.6)" }}>
            Colaboradora: {compra.lider}
          </p>
        )}

        <span
          style={{
            display: "inline-block",
            fontSize: 12,
            fontWeight: 700,
            color: estilo.color,
            background: estilo.fondo,
            padding: "6px 12px",
            borderRadius: 999,
            marginBottom: 18,
          }}
        >
          {estilo.label}
        </span>

        {compra.nota_miembro && (
          <p
            style={{
              fontSize: 13,
              color: "#6B4E1E",
              background: "rgba(199,169,104,.18)",
              border: "1px solid rgba(199,169,104,.4)",
              borderRadius: 12,
              padding: "10px 14px",
              marginBottom: 18,
            }}
          >
            🎁 {compra.nota_miembro}
          </p>
        )}

        {(compra.mensajes_admin ?? []).length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <p style={{ fontSize: 12, fontWeight: 600, margin: "0 0 8px" }}>
              💬 Mensajes del equipo
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {(compra.mensajes_admin ?? []).map((m, i) => (
                <div
                  key={i}
                  style={{
                    background: "rgba(255,255,255,.7)",
                    borderRadius: 12,
                    padding: "10px 14px",
                    fontSize: 13,
                  }}
                >
                  <p style={{ margin: 0 }}>{m.texto}</p>
                  <p style={{ margin: "4px 0 0", fontSize: 11, color: "rgba(23,35,61,.5)" }}>
                    {new Date(m.creado_en).toLocaleDateString("es-AR")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {aviso && (
          <p
            style={{
              fontSize: 12,
              color: colors.violet,
              background: "rgba(117,104,168,.1)",
              borderRadius: 10,
              padding: "8px 12px",
              marginBottom: 14,
            }}
          >
            {aviso}
          </p>
        )}

        {/* Comprobantes */}
        <div style={{ display: "grid", gap: 10, marginBottom: 18 }}>
          {vouchers.length === 0 && (
            <p style={{ fontSize: 13, color: "rgba(23,35,61,.55)" }}>
              Todavía no subiste ningún comprobante.
            </p>
          )}
          {vouchers.map((v, i) => (
            <a
              key={i}
              href={v.url}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "block",
                borderRadius: 16,
                overflow: "hidden",
                border: "1px solid rgba(23,35,61,.08)",
                position: "relative",
                height: 160,
                background: "#fff",
              }}
            >
              <Image src={v.url} alt={`Comprobante ${i + 1}`} fill style={{ objectFit: "cover" }} />
            </a>
          ))}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) subirComprobante(file);
            e.target.value = "";
          }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={subiendo}
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 14,
            border: `1px solid ${colors.violet}`,
            background: "rgba(255,255,255,.7)",
            color: colors.violet,
            fontSize: 13,
            fontWeight: 700,
            cursor: subiendo ? "default" : "pointer",
            marginBottom: 18,
          }}
        >
          {subiendo ? "Subiendo…" : "+ Agregar otro comprobante"}
        </button>

        {/* Hashes */}
        <div
          style={{
            background: "rgba(255,255,255,.75)",
            borderRadius: 16,
            padding: "14px 16px",
            marginBottom: 18,
          }}
        >
          <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700 }}>Hash / TxID</p>
          {compra.hash && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 12,
                marginBottom: 6,
                gap: 8,
              }}
            >
              <span style={{ wordBreak: "break-all" }}>{compra.hash}</span>
              <button
                onClick={() => copiarHash(compra.hash!)}
                style={{ border: "none", background: "none", cursor: "pointer", fontSize: 13 }}
                aria-label="Copiar hash"
              >
                📋
              </button>
            </div>
          )}
          {hashesExtra.map((h) => (
            <div
              key={h.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 12,
                marginBottom: 6,
                gap: 8,
              }}
            >
              <span style={{ wordBreak: "break-all" }}>{h.hash}</span>
              <button
                onClick={() => copiarHash(h.hash)}
                style={{ border: "none", background: "none", cursor: "pointer", fontSize: 13 }}
                aria-label="Copiar hash"
              >
                📋
              </button>
            </div>
          ))}
          {!compra.hash && hashesExtra.length === 0 && (
            <p style={{ margin: 0, fontSize: 12, color: "rgba(23,35,61,.55)" }}>
              Todavía no cargaste ningún hash.
            </p>
          )}

          {mostrarFormHash ? (
            <form onSubmit={agregarHash} style={{ marginTop: 8, display: "flex", gap: 6 }}>
              <input
                value={nuevoHash}
                onChange={(e) => setNuevoHash(e.target.value)}
                placeholder="Pegá el hash acá"
                autoFocus
                style={{
                  flex: 1,
                  padding: "8px 10px",
                  borderRadius: 10,
                  border: "1px solid rgba(23,35,61,.15)",
                  fontSize: 12,
                }}
              />
              <button
                type="submit"
                className="rp-boton"
                style={{
                  borderRadius: 10,
                  padding: "0 14px",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Guardar
              </button>
            </form>
          ) : (
            <button
              onClick={() => setMostrarFormHash(true)}
              style={{
                marginTop: 8,
                border: "none",
                background: "transparent",
                color: colors.violet,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                padding: 0,
              }}
            >
              + Agregar hash
            </button>
          )}
        </div>

        {compra.aprobado_por && compra.estado === "verificada" && (
          <p style={{ fontSize: 12, color: "rgba(23,35,61,.55)", marginBottom: 18 }}>
            Verificado por el equipo.
          </p>
        )}

        {compra.reporte_miembro && (
          <p
            style={{
              fontSize: 12,
              color: "#A32D2D",
              background: "#FCEBEB",
              borderRadius: 10,
              padding: "8px 12px",
              marginBottom: 18,
            }}
          >
            Tu reporte: {compra.reporte_miembro}
          </p>
        )}

        {mostrarFormError ? (
          <form onSubmit={reportarError} style={{ display: "grid", gap: 8 }}>
            <textarea
              value={mensajeError}
              onChange={(e) => setMensajeError(e.target.value)}
              placeholder="Contanos qué pasó (opcional)"
              rows={3}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(23,35,61,.15)",
                fontSize: 13,
                resize: "vertical",
              }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  border: "none",
                  borderRadius: 12,
                  background: "#A32D2D",
                  color: "#fff",
                  padding: "10px 0",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Enviar reporte
              </button>
              <button
                type="button"
                onClick={() => setMostrarFormError(false)}
                style={{
                  border: "1px solid rgba(23,35,61,.15)",
                  borderRadius: 12,
                  background: "transparent",
                  padding: "10px 16px",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setMostrarFormError(true)}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 14,
              border: "1px solid rgba(163,45,45,.35)",
              background: "rgba(255,255,255,.6)",
              color: "#A32D2D",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            ⚠ Reportar un error
          </button>
        )}
      </div>
      <MemberBottomNav />
    </main>
  );
}
