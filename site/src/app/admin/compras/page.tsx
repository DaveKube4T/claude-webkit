"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAdminAuth } from "@/lib/admin-auth-context";
import AdminNav from "@/components/AdminNav";

const colors = {
  ivory: "#F2F6F6",
  deepBlue: "#263A63",
  violet: "#7568A8",
  night: "#17233D",
};

const ESTADO_ESTILO: Record<string, { color: string; fondo: string; label: string }> = {
  pendiente: { color: "#854F0B", fondo: "#FAEEDA", label: "Pendiente" },
  verificada: { color: "#3B6D11", fondo: "#EAF3DE", label: "Verificada" },
  rechazada: { color: "#A32D2D", fondo: "#FCEBEB", label: "Rechazada" },
  error_reportado: { color: "#A32D2D", fondo: "#FCEBEB", label: "Error reportado" },
};

interface Voucher {
  url: string;
}

interface CompraFila {
  id: string;
  persona_id: string;
  persona_nombre: string | null;
  persona_telegram: string | null;
  paquete: string;
  lider: string | null;
  participaciones: number | null;
  monto: number | null;
  moneda: string | null;
  hash: string | null;
  vouchers: Voucher[] | null;
  estado: string;
  creada_en: string;
  condicion_especial: string | null;
}

interface MensajeAdmin {
  autor_nombre: string;
  rol: string;
  texto: string;
  creado_en: string;
}

interface PagoInversion {
  monto: number;
  nota: string | null;
  registrado_por_nombre: string;
  creado_en: string;
}

interface CompraDetalle extends CompraFila {
  condicion_especial: string | null;
  nota_miembro: string | null;
  reporte_miembro: string | null;
  mensajes_admin: MensajeAdmin[] | null;
  posible_duplicado: boolean;
  pago_inversion: PagoInversion[] | null;
  comprobante_solicitado_en: string | null;
}

interface HashExtra {
  id: string;
  hash: string;
}

interface PersonaOpcion {
  id: string;
  nombre: string;
  telegram: string;
}

function esRevisionUrgente(condicionEspecial: string | null) {
  return !!condicionEspecial && condicionEspecial.includes("CASO DUDOSO");
}

function badge(estado: string) {
  const e = ESTADO_ESTILO[estado] ?? ESTADO_ESTILO.pendiente;
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: e.color,
        background: e.fondo,
        padding: "4px 10px",
        borderRadius: 999,
        whiteSpace: "nowrap",
      }}
    >
      {e.label}
    </span>
  );
}

export default function AdminComprasPage() {
  return (
    <Suspense fallback={null}>
      <AdminComprasContenido />
    </Suspense>
  );
}

function AdminComprasContenido() {
  const { usuario, cargando, logout, fetchAutenticado } = useAdminAuth();
  const searchParams = useSearchParams();
  const [compras, setCompras] = useState<CompraFila[] | null>(null);
  const [filtroPersona, setFiltroPersona] = useState("");
  const [filtroEstado, setFiltroEstado] = useState(searchParams.get("estado") ?? "");
  const [filtroPaquete, setFiltroPaquete] = useState("");
  const [soloRevision, setSoloRevision] = useState(false);
  const [paquetesDisponibles, setPaquetesDisponibles] = useState<string[]>([]);
  const [resumenPaquetes, setResumenPaquetes] = useState<{ paquete: string; compras: number; personas: number }[]>([]);
  const [totales, setTotales] = useState<{ compras: number; personas: number } | null>(null);
  const [exportando, setExportando] = useState(false);
  const [compraAbiertaId, setCompraAbiertaId] = useState<string | null>(null);
  const [mostrarNueva, setMostrarNueva] = useState(false);

  const cargarLista = useCallback(async () => {
    const params = new URLSearchParams();
    if (filtroPersona) params.set("persona", filtroPersona);
    if (filtroEstado) params.set("estado", filtroEstado);
    if (filtroPaquete) params.set("paquete", filtroPaquete);
    const res = await fetchAutenticado(`/api/admin/compras?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setCompras(data.compras);
    }
  }, [fetchAutenticado, filtroPersona, filtroEstado, filtroPaquete]);

  useEffect(() => {
    if (usuario) cargarLista();
  }, [usuario, cargarLista]);

  useEffect(() => {
    if (!usuario) return;
    fetchAutenticado("/api/admin/compras/paquetes").then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        setPaquetesDisponibles(data.paquetes);
        setResumenPaquetes(data.resumen ?? []);
        setTotales({ compras: data.totalCompras ?? 0, personas: data.totalPersonas ?? 0 });
      }
    });
  }, [usuario, fetchAutenticado]);

  async function exportarExcel() {
    setExportando(true);
    const params = new URLSearchParams();
    if (filtroPersona) params.set("persona", filtroPersona);
    if (filtroEstado) params.set("estado", filtroEstado);
    if (filtroPaquete) params.set("paquete", filtroPaquete);
    const res = await fetchAutenticado(`/api/admin/compras/exportar?${params.toString()}`);
    setExportando(false);
    if (!res.ok) return;
    const blob = await res.blob();
    const nombre =
      res.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] ??
      "compras.csv";
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  if (cargando || !usuario) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <p style={{ color: colors.night, fontFamily: "sans-serif" }}>Cargando…</p>
      </main>
    );
  }

  return (
    <main
      className="rp-bg-clean admin-ui"
      style={{
        minHeight: "100vh",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: colors.night,
        padding: "24px 20px 60px",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          maxWidth: 960,
          margin: "0 auto 12px",
        }}
      >
        <h1 className="rp-titulo" style={{ margin: 0, fontSize: 22 }}>Compras</h1>
        <button
          onClick={logout}
          style={{
            padding: "8px 14px",
            borderRadius: 10,
            border: "none",
            background: colors.night,
            color: "#fff",
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          Cerrar sesión
        </button>
      </header>

      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <AdminNav rol={usuario.rol} />

        {totales && (
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              marginBottom: 10,
              fontSize: 12,
              color: "rgba(23,35,61,.7)",
            }}
          >
            <span style={{ fontWeight: 700 }}>
              {totales.compras} compras · {totales.personas} personas
            </span>
            {resumenPaquetes.map((r) => (
              <span
                key={r.paquete}
                style={{
                  padding: "3px 10px",
                  borderRadius: 999,
                  background: "rgba(23,35,61,.06)",
                }}
              >
                {r.paquete}: {r.compras} compras · {r.personas} personas
              </span>
            ))}
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 16,
            alignItems: "center",
          }}
        >
          <input
            value={filtroPersona}
            onChange={(e) => setFiltroPersona(e.target.value)}
            placeholder="Buscar por persona o Telegram"
            style={{
              flex: "1 1 220px",
              padding: "9px 12px",
              borderRadius: 10,
              border: "1px solid rgba(23,35,61,.15)",
              fontSize: 13,
            }}
          />
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            style={{
              padding: "9px 12px",
              borderRadius: 10,
              border: "1px solid rgba(23,35,61,.15)",
              fontSize: 13,
              background: "#fff",
            }}
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="verificada">Verificada</option>
            <option value="rechazada">Rechazada</option>
            <option value="error_reportado">Error reportado</option>
          </select>
          <select
            value={filtroPaquete}
            onChange={(e) => setFiltroPaquete(e.target.value)}
            style={{
              padding: "9px 12px",
              borderRadius: 10,
              border: "1px solid rgba(23,35,61,.15)",
              fontSize: 13,
              background: "#fff",
            }}
          >
            <option value="">Todos los paquetes</option>
            {paquetesDisponibles.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              color: "#9a6a00",
              cursor: "pointer",
              padding: "9px 12px",
              borderRadius: 10,
              border: "1px solid rgba(154,106,0,.3)",
              background: soloRevision ? "#fbf0d6" : "#fff",
            }}
          >
            <input
              type="checkbox"
              checked={soloRevision}
              onChange={(e) => setSoloRevision(e.target.checked)}
            />
            ⚠️ Solo revisión urgente
          </label>
          <button
            onClick={exportarExcel}
            disabled={exportando}
            style={{
              padding: "9px 16px",
              borderRadius: 10,
              border: "1px solid rgba(23,35,61,.15)",
              background: "#fff",
              color: colors.deepBlue,
              fontSize: 13,
              fontWeight: 700,
              cursor: exportando ? "default" : "pointer",
            }}
          >
            {exportando ? "Exportando…" : "Exportar a Excel ⬇"}
          </button>
          <button
            onClick={() => setMostrarNueva(true)}
            className="rp-boton"
            style={{
              padding: "9px 16px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            + Nueva compra
          </button>
        </div>

        {compras === null && <p style={{ fontSize: 13 }}>Cargando…</p>}
        {compras !== null && compras.length === 0 && (
          <p style={{ fontSize: 13, color: "rgba(23,35,61,.55)" }}>
            No hay compras que coincidan con el filtro.
          </p>
        )}

        <div style={{ display: "grid", gap: 8 }}>
          {compras
            ?.filter((c) => !soloRevision || esRevisionUrgente(c.condicion_especial))
            .map((c) => (
            <button
              key={c.id}
              onClick={() => setCompraAbiertaId(c.id)}
              className="rp-tarjeta-compra"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                textAlign: "left",
                background: "#fff",
                border: "1px solid rgba(23,35,61,.08)",
                borderRadius: 14,
                padding: "12px 14px",
                cursor: "pointer",
              }}
            >
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>
                  {c.persona_nombre ?? "—"}{" "}
                  <span style={{ fontWeight: 400, color: "rgba(23,35,61,.5)" }}>
                    @{c.persona_telegram}
                  </span>
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(23,35,61,.6)" }}>
                  {c.paquete} {c.lider ? `· ${c.lider}` : ""}
                  {c.monto != null ? ` · ${c.monto} ${c.moneda ?? "USDT"}` : ""}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(23,35,61,.45)" }}>
                  {new Date(c.creada_en).toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                  {c.participaciones != null ? ` · Cant: ${c.participaciones}` : ""}
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                {esRevisionUrgente(c.condicion_especial) && (
                  <span
                    title={c.condicion_especial ?? undefined}
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#9a6a00",
                      background: "#fbf0d6",
                      padding: "3px 9px",
                      borderRadius: 999,
                      whiteSpace: "nowrap",
                    }}
                  >
                    ⚠️ Revisar
                  </span>
                )}
                {badge(c.estado)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {compraAbiertaId && (
        <PanelDetalle
          id={compraAbiertaId}
          onClose={() => setCompraAbiertaId(null)}
          onCambio={cargarLista}
          fetchAutenticado={fetchAutenticado}
        />
      )}

      {mostrarNueva && (
        <ModalNuevaCompra
          onClose={() => setMostrarNueva(false)}
          onCreada={() => {
            setMostrarNueva(false);
            cargarLista();
          }}
          fetchAutenticado={fetchAutenticado}
        />
      )}
    </main>
  );
}

function PanelDetalle({
  id,
  onClose,
  onCambio,
  fetchAutenticado,
}: {
  id: string;
  onClose: () => void;
  onCambio: () => void;
  fetchAutenticado: (input: string, init?: RequestInit) => Promise<Response>;
}) {
  const [compra, setCompra] = useState<CompraDetalle | null>(null);
  const [hashesExtra, setHashesExtra] = useState<HashExtra[]>([]);
  const [duplicados, setDuplicados] = useState<{ id: string; persona_nombre: string | null; paquete: string }[]>([]);
  const [permisos, setPermisos] = useState({
    puedeEditarLider: false,
    puedeEliminarComprobantes: false,
    puedeVerPagoInterno: false,
    puedeEliminarCompra: false,
  });
  const [nuevoHash, setNuevoHash] = useState("");
  const [aviso, setAviso] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [enviandoMensaje, setEnviandoMensaje] = useState(false);
  const [editandoHash, setEditandoHash] = useState(false);
  const [montoPago, setMontoPago] = useState("");
  const [notaPago, setNotaPago] = useState("");
  const [registrandoPago, setRegistrandoPago] = useState(false);
  const [pidiendoComprobante, setPidiendoComprobante] = useState(false);

  const cargar = useCallback(async () => {
    const res = await fetchAutenticado(`/api/admin/compras/${id}`);
    if (res.ok) {
      const data = await res.json();
      setCompra(data.compra);
      setHashesExtra(data.hashesExtra);
      setDuplicados(data.duplicados);
      setPermisos({
        puedeEditarLider: data.puedeEditarLider,
        puedeEliminarComprobantes: data.puedeEliminarComprobantes,
        puedeVerPagoInterno: data.puedeVerPagoInterno,
        puedeEliminarCompra: data.puedeEliminarCompra,
      });
    }
  }, [fetchAutenticado, id]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function actualizar(cambios: Record<string, unknown>) {
    setGuardando(true);
    setAviso(null);
    const res = await fetchAutenticado(`/api/admin/compras/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cambios),
    });
    setGuardando(false);
    if (res.ok) {
      setAviso("Guardado.");
      cargar();
      onCambio();
    } else {
      const data = await res.json();
      setAviso(data.error ?? "No se pudo guardar.");
    }
  }

  async function agregarHash(e: React.FormEvent) {
    e.preventDefault();
    if (!nuevoHash.trim()) return;
    const res = await fetchAutenticado(`/api/admin/compras/${id}/hash`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hash: nuevoHash.trim() }),
    });
    if (res.ok) {
      setNuevoHash("");
      cargar();
    } else {
      const data = await res.json();
      setAviso(data.error ?? "No se pudo agregar el hash.");
    }
  }

  async function enviarMensaje(e: React.FormEvent) {
    e.preventDefault();
    if (!nuevoMensaje.trim()) return;
    setEnviandoMensaje(true);
    const res = await fetchAutenticado(`/api/admin/compras/${id}/mensaje`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto: nuevoMensaje.trim() }),
    });
    setEnviandoMensaje(false);
    if (res.ok) {
      const data = await res.json().catch(() => null);
      if (data?.aviso) setAviso(data.aviso);
      setNuevoMensaje("");
      cargar();
    } else {
      const data = await res.json();
      setAviso(data.error ?? "No se pudo enviar el mensaje.");
    }
  }

  async function registrarPago(e: React.FormEvent) {
    e.preventDefault();
    const monto = Number(montoPago);
    if (!monto || monto <= 0) {
      setAviso("Ingresá un monto mayor a 0 antes de registrar el pago.");
      return;
    }
    setRegistrandoPago(true);
    const res = await fetchAutenticado(`/api/admin/compras/${id}/pago-inversion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ monto, nota: notaPago.trim() || null }),
    });
    setRegistrandoPago(false);
    if (res.ok) {
      setMontoPago("");
      setNotaPago("");
      cargar();
    } else {
      const data = await res.json();
      setAviso(data.error ?? "No se pudo registrar el pago.");
    }
  }

  async function pedirComprobante() {
    setPidiendoComprobante(true);
    setAviso(null);
    const res = await fetchAutenticado(`/api/admin/compras/${id}/pedir-comprobante`, {
      method: "POST",
    });
    setPidiendoComprobante(false);
    if (res.ok) {
      cargar();
    } else {
      const data = await res.json();
      setAviso(data.error ?? "No se pudo pedir el comprobante.");
    }
  }

  async function eliminarComprobante(url: string) {
    const res = await fetchAutenticado(`/api/admin/compras/${id}/voucher`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    if (res.ok) cargar();
  }

  async function eliminarCompra() {
    if (!window.confirm("¿Eliminar esta compra? Esta acción no se puede deshacer.")) return;
    setGuardando(true);
    const res = await fetchAutenticado(`/api/admin/compras/${id}`, { method: "DELETE" });
    setGuardando(false);
    if (res.ok) {
      onCambio();
      onClose();
    } else {
      const data = await res.json().catch(() => ({}));
      setAviso(data.error ?? "No se pudo eliminar la compra.");
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(23,35,61,.35)",
        display: "flex",
        justifyContent: "flex-end",
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(440px, 100vw)",
          height: "100%",
          background: colors.ivory,
          overflowY: "auto",
          padding: "20px 18px 40px",
        }}
      >
        <button
          onClick={onClose}
          style={{
            border: "none",
            background: "transparent",
            fontSize: 13,
            color: colors.deepBlue,
            cursor: "pointer",
            padding: 0,
            marginBottom: 14,
          }}
        >
          ← Cerrar
        </button>

        {!compra ? (
          <p style={{ fontSize: 13 }}>Cargando…</p>
        ) : (
          <>
            <h2 className="rp-titulo" style={{ margin: "0 0 4px", fontSize: 18 }}>
              {compra.persona_nombre}
            </h2>
            <p style={{ margin: "0 0 4px", fontSize: 12, color: "rgba(23,35,61,.55)" }}>
              @{compra.persona_telegram}
            </p>
            <p style={{ margin: "0 0 14px", fontSize: 12, color: "rgba(23,35,61,.5)" }}>
              Fecha:{" "}
              {new Date(compra.creada_en).toLocaleDateString("es-AR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </p>

            {badge(compra.estado)}

            {duplicados.length > 0 && (
              <p
                style={{
                  marginTop: 10,
                  fontSize: 12,
                  color: "#A32D2D",
                  background: "#FCEBEB",
                  borderRadius: 10,
                  padding: "8px 10px",
                }}
              >
                ⚠ Este hash también aparece en {duplicados.length} otra(s) compra(s):{" "}
                {duplicados.map((d) => `${d.persona_nombre} (${d.paquete})`).join(", ")}
              </p>
            )}

            {compra.reporte_miembro && (
              <p
                style={{
                  marginTop: 10,
                  fontSize: 12,
                  color: "#854F0B",
                  background: "#FAEEDA",
                  borderRadius: 10,
                  padding: "8px 10px",
                }}
              >
                Reporte del miembro: {compra.reporte_miembro}
              </p>
            )}

            {aviso && (
              <p style={{ marginTop: 10, fontSize: 12, color: colors.violet }}>{aviso}</p>
            )}

            <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600 }}>
                Paquete
                <input
                  defaultValue={compra.paquete}
                  onBlur={(e) => {
                    if (e.target.value.trim() !== compra.paquete) {
                      actualizar({ paquete: e.target.value.trim() });
                    }
                  }}
                  style={inputStyleAdmin()}
                />
              </label>

              <label style={{ fontSize: 12, fontWeight: 600 }}>
                Colaboradora {!permisos.puedeEditarLider && "(solo superadmin)"}
                <input
                  defaultValue={compra.lider ?? ""}
                  disabled={!permisos.puedeEditarLider}
                  onBlur={(e) => {
                    if (e.target.value.trim() !== (compra.lider ?? "")) {
                      actualizar({ lider: e.target.value.trim() });
                    }
                  }}
                  style={{
                    ...inputStyleAdmin(),
                    opacity: permisos.puedeEditarLider ? 1 : 0.5,
                  }}
                />
              </label>

              <label style={{ fontSize: 12, fontWeight: 600 }}>
                Participaciones
                <input
                  type="number"
                  defaultValue={compra.participaciones ?? ""}
                  onBlur={(e) => {
                    const v = e.target.value ? Number(e.target.value) : null;
                    if (v !== compra.participaciones) actualizar({ participaciones: v });
                  }}
                  style={inputStyleAdmin()}
                />
              </label>

              <label style={{ fontSize: 12, fontWeight: 600 }}>
                Monto
                <input
                  disabled
                  value={compra.monto != null ? `${compra.monto} ${compra.moneda ?? "USDT"}` : "—"}
                  style={{ ...inputStyleAdmin(), opacity: 0.6 }}
                />
              </label>
            </div>

            {/* Comprobantes */}
            <p style={{ margin: "18px 0 6px", fontSize: 13, fontWeight: 700 }}>Comprobantes</p>
            {(compra.vouchers ?? []).length === 0 && (
              <>
                <p style={{ fontSize: 12, color: "rgba(23,35,61,.55)" }}>Sin comprobantes.</p>
                {compra.comprobante_solicitado_en ? (
                  <p style={{ fontSize: 12, color: colors.violet, margin: "4px 0 10px" }}>
                    📨 Comprobante solicitado por Telegram ·{" "}
                    {new Date(compra.comprobante_solicitado_en).toLocaleString("es-AR")}
                  </p>
                ) : (
                  <button
                    disabled={pidiendoComprobante}
                    onClick={pedirComprobante}
                    style={{
                      border: "none",
                      borderRadius: 10,
                      background: "#F1EEF9",
                      color: colors.violet,
                      padding: "6px 12px",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      margin: "4px 0 10px",
                    }}
                  >
                    📎 Pedir comprobante por Telegram
                  </button>
                )}
              </>
            )}
            <div style={{ display: "grid", gap: 6 }}>
              {(compra.vouchers ?? []).map((v, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "#fff",
                    borderRadius: 10,
                    padding: "8px 10px",
                    fontSize: 12,
                  }}
                >
                  <a href={v.url} target="_blank" rel="noreferrer" style={{ color: colors.deepBlue }}>
                    Ver comprobante {i + 1} ↗
                  </a>
                  {permisos.puedeEliminarComprobantes && (
                    <button
                      onClick={() => eliminarComprobante(v.url)}
                      style={{ border: "none", background: "none", color: "#A32D2D", cursor: "pointer" }}
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Hashes */}
            <p style={{ margin: "18px 0 6px", fontSize: 13, fontWeight: 700 }}>Hash / TxID</p>
            {compra.hash && !editandoHash && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <p style={{ fontSize: 12, wordBreak: "break-all", margin: 0, flex: 1 }}>
                  🔗 {compra.hash}
                </p>
                <button
                  onClick={() => setEditandoHash(true)}
                  style={{ border: "none", background: "none", color: colors.violet, fontSize: 11, cursor: "pointer" }}
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => actualizar({ hash: null })}
                  style={{ border: "none", background: "none", color: "#A32D2D", fontSize: 11, cursor: "pointer" }}
                >
                  🗑 Borrar hash falso
                </button>
              </div>
            )}
            {editandoHash && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const v = (e.target as HTMLFormElement).hashPrincipal.value.trim() || null;
                  actualizar({ hash: v });
                  setEditandoHash(false);
                }}
                style={{ display: "flex", gap: 6, marginBottom: 4 }}
              >
                <input
                  name="hashPrincipal"
                  defaultValue={compra.hash ?? ""}
                  style={{ ...inputStyleAdmin(), flex: 1 }}
                />
                <button type="submit" className="rp-boton" style={{ borderRadius: 10, padding: "0 12px", fontSize: 12, cursor: "pointer" }}>
                  Guardar
                </button>
              </form>
            )}
            {!compra.hash && (
              <button
                onClick={() => setEditandoHash(true)}
                style={{ border: "none", background: "none", color: colors.violet, fontSize: 12, cursor: "pointer", padding: 0 }}
              >
                ✏️ Editar hash principal
              </button>
            )}
            {hashesExtra.map((h) => (
              <p key={h.id} style={{ fontSize: 12, wordBreak: "break-all" }}>
                {h.hash}
              </p>
            ))}
            <form onSubmit={agregarHash} style={{ display: "flex", gap: 6, marginTop: 6 }}>
              <input
                value={nuevoHash}
                onChange={(e) => setNuevoHash(e.target.value)}
                placeholder="Agregar hash"
                style={{ ...inputStyleAdmin(), flex: 1 }}
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
                +
              </button>
            </form>

            {/* Aprobar / rechazar */}
            <div style={{ display: "flex", gap: 8, marginTop: 22 }}>
              <button
                disabled={guardando}
                onClick={() => actualizar({ estado: "verificada" })}
                style={botonEstado("#3B6D11")}
              >
                ✓ Aprobar
              </button>
              <button
                disabled={guardando}
                onClick={() => actualizar({ estado: "rechazada" })}
                style={botonEstado("#A32D2D")}
              >
                ✕ Rechazar
              </button>
            </div>
            {compra.estado === "error_reportado" && (
              <button
                disabled={guardando}
                onClick={() => actualizar({ estado: "pendiente" })}
                style={{ ...botonEstado("#854F0B"), marginTop: 8, width: "100%" }}
              >
                Marcar error como solucionado (vuelve a pendiente)
              </button>
            )}
            {(compra.estado === "verificada" || compra.estado === "rechazada") && (
              <button
                disabled={guardando}
                onClick={() => actualizar({ estado: "pendiente" })}
                style={{ ...botonEstado("#854F0B"), marginTop: 8, width: "100%" }}
              >
                ↺ Revertir a pendiente
              </button>
            )}

            {permisos.puedeEliminarCompra && (
              <button
                disabled={guardando}
                onClick={eliminarCompra}
                style={{
                  marginTop: 8,
                  border: "none",
                  borderRadius: 10,
                  background: "#FCEBEB",
                  color: "#A32D2D",
                  padding: "6px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                🗑️ Eliminar compra (posible duplicado)
              </button>
            )}

            {/* Mensajes al miembro */}
            <p style={{ margin: "18px 0 6px", fontSize: 13, fontWeight: 700 }}>
              💬 Mensajes al miembro
            </p>
            {(compra.mensajes_admin ?? []).length === 0 && (
              <p style={{ fontSize: 12, color: "rgba(23,35,61,.55)" }}>Sin mensajes todavía.</p>
            )}
            {(compra.mensajes_admin ?? []).length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
                {(compra.mensajes_admin ?? []).map((m, i) => (
                  <div
                    key={i}
                    style={{
                      background: "#fff",
                      borderRadius: 10,
                      padding: "8px 10px",
                      fontSize: 12,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <strong>{m.autor_nombre}</strong>
                      <span style={{ color: "rgba(23,35,61,.45)", fontSize: 10 }}>
                        {new Date(m.creado_en).toLocaleString("es-AR")}
                      </span>
                    </div>
                    <p style={{ margin: "2px 0 0", color: "rgba(23,35,61,.75)" }}>{m.texto}</p>
                  </div>
                ))}
              </div>
            )}
            <form onSubmit={enviarMensaje} style={{ display: "flex", gap: 6 }}>
              <textarea
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                placeholder="Escribí un mensaje para el miembro..."
                rows={2}
                style={{ ...inputStyleAdmin(), resize: "vertical", flex: 1 }}
              />
              <button
                type="submit"
                disabled={enviandoMensaje || !nuevoMensaje.trim()}
                className="rp-boton"
                style={{
                  borderRadius: 10,
                  padding: "0 14px",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  opacity: enviandoMensaje || !nuevoMensaje.trim() ? 0.6 : 1,
                }}
              >
                💬 Enviar
              </button>
            </form>

            <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600 }}>
                Condición especial{" "}
                <span style={{ fontWeight: 400, color: "rgba(23,35,61,.5)" }}>
                  (interno, el miembro NO lo ve)
                </span>
                <textarea
                  defaultValue={compra.condicion_especial ?? ""}
                  placeholder="Ej: pago parcial de un lote de JotForm, pendiente de confirmar con Clau"
                  rows={2}
                  onBlur={(e) => {
                    const v = e.target.value.trim() || null;
                    if (v !== compra.condicion_especial) actualizar({ condicion_especial: v });
                  }}
                  style={{ ...inputStyleAdmin(), resize: "vertical" }}
                />
              </label>

              <label style={{ fontSize: 12, fontWeight: 600 }}>
                Nota para el miembro{" "}
                <span style={{ fontWeight: 400, color: "#3B6D11" }}>
                  (esto SÍ lo ve la persona en su compra)
                </span>
                <textarea
                  defaultValue={compra.nota_miembro ?? ""}
                  placeholder="Ej: Este Pack es un regalo de Resonancia por ser parte de Resonancia Origen y por tu elección en el Formulario de Actualización."
                  rows={2}
                  onBlur={(e) => {
                    const v = e.target.value.trim() || null;
                    if (v !== compra.nota_miembro) actualizar({ nota_miembro: v });
                  }}
                  style={{ ...inputStyleAdmin(), resize: "vertical" }}
                />
              </label>
            </div>

            {permisos.puedeVerPagoInterno && (
              <>
                <p style={{ margin: "22px 0 6px", fontSize: 13, fontWeight: 700 }}>
                  💰 Pago de inversión (interno)
                </p>
                {(compra.pago_inversion ?? []).length === 0 && (
                  <p style={{ fontSize: 12, color: "rgba(23,35,61,.55)" }}>Sin pagos registrados.</p>
                )}
                {(compra.pago_inversion ?? []).map((p, i) => (
                  <p key={i} style={{ fontSize: 12, margin: "2px 0" }}>
                    ${p.monto} — {p.registrado_por_nombre}
                    {p.nota ? ` (${p.nota})` : ""} ·{" "}
                    {new Date(p.creado_en).toLocaleDateString("es-AR")}
                  </p>
                ))}
                <form onSubmit={registrarPago} style={{ display: "flex", gap: 6, marginTop: 6 }}>
                  <input
                    type="number"
                    value={montoPago}
                    onChange={(e) => setMontoPago(e.target.value)}
                    placeholder="Monto"
                    style={{ ...inputStyleAdmin(), width: 90 }}
                  />
                  <input
                    value={notaPago}
                    onChange={(e) => setNotaPago(e.target.value)}
                    placeholder="Nota (opcional)"
                    style={{ ...inputStyleAdmin(), flex: 1 }}
                  />
                  <button
                    type="submit"
                    disabled={registrandoPago}
                    className="rp-boton"
                    style={{
                      borderRadius: 10,
                      padding: "0 14px",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    + Registrar
                  </button>
                </form>
                {aviso && (
                  <p style={{ margin: "6px 0 0", fontSize: 12, color: "#A32D2D" }}>{aviso}</p>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ModalNuevaCompra({
  onClose,
  onCreada,
  fetchAutenticado,
}: {
  onClose: () => void;
  onCreada: () => void;
  fetchAutenticado: (input: string, init?: RequestInit) => Promise<Response>;
}) {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<PersonaOpcion[]>([]);
  const [personaSel, setPersonaSel] = useState<PersonaOpcion | null>(null);
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [telegramNuevo, setTelegramNuevo] = useState("");
  const [mailNuevo, setMailNuevo] = useState("");
  const [paquete, setPaquete] = useState("");
  const [lider, setLider] = useState("");
  const [hash, setHash] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResultados([]);
      return;
    }
    const t = setTimeout(async () => {
      const res = await fetchAutenticado(
        `/api/admin/personas/buscar?q=${encodeURIComponent(query.trim())}`
      );
      if (res.ok) setResultados((await res.json()).personas);
    }, 300);
    return () => clearTimeout(t);
  }, [query, fetchAutenticado]);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setAviso(null);

    let personaId = personaSel?.id;

    if (!personaId) {
      if (!nombreNuevo.trim() || !telegramNuevo.trim()) {
        setAviso("Elegí una persona existente o completá nombre y Telegram para crear una.");
        return;
      }
      setEnviando(true);
      const resPersona = await fetchAutenticado("/api/admin/personas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombreNuevo.trim(),
          telegram: telegramNuevo.trim(),
          mail: mailNuevo.trim(),
        }),
      });
      if (!resPersona.ok) {
        setEnviando(false);
        setAviso((await resPersona.json()).error ?? "No se pudo crear la persona.");
        return;
      }
      personaId = (await resPersona.json()).id;
    }

    if (!paquete.trim()) {
      setEnviando(false);
      setAviso("Elegí un paquete.");
      return;
    }

    setEnviando(true);
    const res = await fetchAutenticado("/api/admin/compras", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personaId,
        paquete: paquete.trim(),
        lider: lider.trim(),
        hash: hash.trim(),
      }),
    });
    if (!res.ok) {
      setEnviando(false);
      setAviso((await res.json()).error ?? "No se pudo crear la compra.");
      return;
    }

    const { id: compraId } = await res.json();

    if (archivo) {
      const formData = new FormData();
      formData.append("archivo", archivo);
      const resArchivo = await fetchAutenticado(
        `/api/admin/compras/${compraId}/comprobante`,
        { method: "POST", body: formData }
      );
      if (!resArchivo.ok) {
        setEnviando(false);
        setAviso(
          "La compra se creó, pero el comprobante no se pudo subir: " +
            ((await resArchivo.json()).error ?? "error desconocido.")
        );
        return;
      }
    }

    setEnviando(false);
    onCreada();
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(23,35,61,.4)",
        display: "grid",
        placeItems: "center",
        zIndex: 60,
        padding: 16,
      }}
      onClick={onClose}
    >
      <form
        onSubmit={crear}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 18,
          padding: 20,
          width: "min(420px, 100%)",
          display: "grid",
          gap: 10,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <h2 className="rp-titulo" style={{ margin: "0 0 4px", fontSize: 17 }}>Nueva compra</h2>

        <label style={{ fontSize: 12, fontWeight: 600 }}>
          Buscar persona existente
          <input
            value={personaSel ? `${personaSel.nombre} (@${personaSel.telegram})` : query}
            onChange={(e) => {
              setPersonaSel(null);
              setQuery(e.target.value);
            }}
            placeholder="Nombre o Telegram"
            style={inputStyleAdmin()}
          />
        </label>
        {resultados.length > 0 && !personaSel && (
          <div style={{ display: "grid", gap: 4 }}>
            {resultados.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setPersonaSel(p);
                  setResultados([]);
                }}
                style={{
                  textAlign: "left",
                  border: "1px solid rgba(23,35,61,.1)",
                  borderRadius: 8,
                  padding: "6px 10px",
                  fontSize: 12,
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                {p.nombre} — @{p.telegram}
              </button>
            ))}
          </div>
        )}

        {!personaSel && (
          <>
            <p style={{ margin: "6px 0 0", fontSize: 12, color: "rgba(23,35,61,.55)" }}>
              O creá una persona nueva:
            </p>
            <input
              value={nombreNuevo}
              onChange={(e) => setNombreNuevo(e.target.value)}
              placeholder="Nombre completo"
              style={inputStyleAdmin()}
            />
            <input
              value={telegramNuevo}
              onChange={(e) => setTelegramNuevo(e.target.value)}
              placeholder="Usuario de Telegram (sin @)"
              style={inputStyleAdmin()}
            />
            <input
              value={mailNuevo}
              onChange={(e) => setMailNuevo(e.target.value)}
              placeholder="Email"
              type="email"
              style={inputStyleAdmin()}
            />
          </>
        )}

        <label style={{ fontSize: 12, fontWeight: 600 }}>
          Paquete
          <input
            value={paquete}
            onChange={(e) => setPaquete(e.target.value)}
            required
            style={inputStyleAdmin()}
          />
        </label>

        <label style={{ fontSize: 12, fontWeight: 600 }}>
          Colaboradora
          <input
            value={lider}
            onChange={(e) => setLider(e.target.value)}
            style={inputStyleAdmin()}
          />
        </label>

        <label style={{ fontSize: 12, fontWeight: 600 }}>
          Hash / TxID
          <input
            value={hash}
            onChange={(e) => setHash(e.target.value)}
            style={inputStyleAdmin()}
          />
        </label>

        <label style={{ fontSize: 12, fontWeight: 600 }}>
          Comprobante (opcional)
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
            style={{ ...inputStyleAdmin(), padding: "7px 8px" }}
          />
        </label>

        {aviso && <p style={{ margin: 0, fontSize: 12, color: "#A32D2D" }}>{aviso}</p>}

        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <button
            type="submit"
            disabled={enviando}
            className="rp-boton"
            style={{
              flex: 1,
              borderRadius: 10,
              padding: "10px 0",
              fontSize: 13,
              fontWeight: 700,
              cursor: enviando ? "default" : "pointer",
            }}
          >
            {enviando ? "Creando…" : "Crear compra"}
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: "1px solid rgba(23,35,61,.15)",
              borderRadius: 10,
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
    </div>
  );
}

function inputStyleAdmin(): React.CSSProperties {
  return {
    display: "block",
    width: "100%",
    marginTop: 4,
    padding: "9px 11px",
    borderRadius: 10,
    border: "1px solid rgba(23,35,61,.15)",
    fontSize: 13,
    background: "#fff",
  };
}

function botonEstado(color: string): React.CSSProperties {
  return {
    flex: 1,
    border: `1px solid ${color}`,
    background: "#fff",
    color,
    borderRadius: 12,
    padding: "10px 0",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  };
}
