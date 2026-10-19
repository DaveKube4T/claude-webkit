"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/admin-auth-context";
import AdminNav from "@/components/AdminNav";

const colors = { ivory: "#F2F6F6", violet: "#7568A8", night: "#17233D", deepBlue: "#263A63" };

const ESTADO_ESTILO: Record<string, { color: string; fondo: string }> = {
  pendiente: { color: "#854F0B", fondo: "#FAEEDA" },
  verificada: { color: "#3B6D11", fondo: "#EAF3DE" },
  rechazada: { color: "#A32D2D", fondo: "#FCEBEB" },
  error_reportado: { color: "#A32D2D", fondo: "#FCEBEB" },
};

interface PersonaFila {
  id: string;
  nombre: string;
  telegram: string;
  mail: string | null;
  telefono: string | null;
  destacado: boolean;
}

interface PersonaDetalle {
  id: string;
  nombre: string;
  telegram: string;
  apellidos: string | null;
  documento: string | null;
  pasaporte: string | null;
  mail: string | null;
  mail_alternativo: string | null;
  telefono: string | null;
  telefono_alternativo: string | null;
  signal: string | null;
  wallet_trc20: string | null;
  ciudad: string | null;
  provincia_estado: string | null;
  pais: string | null;
  zip_code: string | null;
  destacado: boolean;
  nota_destacado: string | null;
}

interface CompraResumen {
  id: string;
  paquete: string;
  estado: string;
  creada_en: string;
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

export default function AdminPersonasPage() {
  const { usuario, cargando, logout, fetchAutenticado } = useAdminAuth();
  const [personas, setPersonas] = useState<PersonaFila[] | null>(null);
  const [query, setQuery] = useState("");
  const [seleccionadaId, setSeleccionadaId] = useState<string | null>(null);
  const [mostrarNueva, setMostrarNueva] = useState(false);

  const cargarLista = useCallback(async () => {
    const res = await fetchAutenticado(
      `/api/admin/personas?q=${encodeURIComponent(query)}`
    );
    if (res.ok) setPersonas((await res.json()).personas);
  }, [fetchAutenticado, query]);

  useEffect(() => {
    if (!usuario) return;
    const t = setTimeout(cargarLista, 250);
    return () => clearTimeout(t);
  }, [usuario, cargarLista]);

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
        <h1 className="rp-titulo" style={{ margin: 0, fontSize: 22 }}>Personas</h1>
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

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o Telegram"
            style={{
              flex: 1,
              padding: "9px 12px",
              borderRadius: 10,
              border: "1px solid rgba(23,35,61,.15)",
              fontSize: 13,
            }}
          />
          <button
            onClick={() => setMostrarNueva(true)}
            className="rp-boton"
            style={{
              padding: "9px 16px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            + Nueva persona
          </button>
        </div>

        {personas === null && <p style={{ fontSize: 13 }}>Cargando…</p>}
        {personas !== null && personas.length === 0 && (
          <p style={{ fontSize: 13, color: "rgba(23,35,61,.55)" }}>Sin resultados.</p>
        )}

        <div style={{ display: "grid", gap: 8 }}>
          {personas?.map((p) => (
            <button
              key={p.id}
              onClick={() => setSeleccionadaId(p.id)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
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
                  {p.destacado && <span title="Destacado">⭐ </span>}
                  {p.nombre}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(23,35,61,.55)" }}>
                  @{p.telegram} {p.mail ? `· ${p.mail}` : ""}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {seleccionadaId && (
        <PanelPersona
          id={seleccionadaId}
          onClose={() => setSeleccionadaId(null)}
          onCambio={cargarLista}
          fetchAutenticado={fetchAutenticado}
          esSuperadmin={usuario.rol === "superadmin"}
        />
      )}

      {mostrarNueva && (
        <ModalNuevaPersona
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

function PanelPersona({
  id,
  onClose,
  onCambio,
  fetchAutenticado,
  esSuperadmin,
}: {
  id: string;
  onClose: () => void;
  onCambio: () => void;
  fetchAutenticado: (input: string, init?: RequestInit) => Promise<Response>;
  esSuperadmin: boolean;
}) {
  const [persona, setPersona] = useState<PersonaDetalle | null>(null);
  const [compras, setCompras] = useState<CompraResumen[]>([]);
  const [aviso, setAviso] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [confirmarBorrar, setConfirmarBorrar] = useState(false);

  const cargar = useCallback(async () => {
    const res = await fetchAutenticado(`/api/admin/personas/${id}`);
    if (res.ok) {
      const data = await res.json();
      setPersona(data.persona);
      setCompras(data.compras);
    }
  }, [fetchAutenticado, id]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  function actualizarCampo(key: keyof PersonaDetalle, valor: string) {
    setPersona((p) => (p ? { ...p, [key]: valor } : p));
  }

  function toggleDestacado() {
    setPersona((p) => (p ? { ...p, destacado: !p.destacado } : p));
  }

  async function guardar() {
    if (!persona) return;
    setGuardando(true);
    setAviso(null);
    const { id: _id, telegram: _telegram, ...cambios } = persona;
    void _id;
    void _telegram;
    const res = await fetchAutenticado(`/api/admin/personas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cambios),
    });
    setGuardando(false);
    if (res.ok) {
      setAviso("Guardado.");
      onCambio();
    } else {
      setAviso((await res.json()).error ?? "No se pudo guardar.");
    }
  }

  async function borrar() {
    const res = await fetchAutenticado(`/api/admin/personas/${id}`, { method: "DELETE" });
    if (res.ok) {
      onCambio();
      onClose();
    } else {
      setAviso((await res.json()).error ?? "No se pudo borrar.");
    }
  }

  const campos: { key: Exclude<keyof PersonaDetalle, "destacado">; label: string }[] = [
    { key: "nombre", label: "Nombre" },
    { key: "apellidos", label: "Apellidos" },
    { key: "signal", label: "Usuario de Signal" },
    { key: "documento", label: "Documento" },
    { key: "pasaporte", label: "Pasaporte" },
    { key: "mail", label: "Mail" },
    { key: "mail_alternativo", label: "Mail alternativo" },
    { key: "telefono", label: "Teléfono" },
    { key: "telefono_alternativo", label: "Teléfono alternativo" },
    { key: "wallet_trc20", label: "Wallet TRC20" },
    { key: "ciudad", label: "Ciudad" },
    { key: "provincia_estado", label: "Provincia / Estado" },
    { key: "pais", label: "País" },
    { key: "zip_code", label: "Código postal" },
  ];

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

        {!persona ? (
          <p style={{ fontSize: 13 }}>Cargando…</p>
        ) : (
          <>
            <h2 className="rp-titulo" style={{ margin: "0 0 4px", fontSize: 18 }}>{persona.nombre}</h2>
            <p style={{ margin: "0 0 14px", fontSize: 12, color: "rgba(23,35,61,.55)" }}>
              Telegram: @{persona.telegram} (no editable)
            </p>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                fontWeight: 600,
                marginBottom: persona.destacado ? 6 : 14,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={persona.destacado}
                onChange={toggleDestacado}
                style={{ accentColor: colors.violet }}
              />
              ⭐ Destacado (para recordar algo especial del equipo)
            </label>
            {persona.destacado && (
              <textarea
                value={persona.nota_destacado ?? ""}
                onChange={(e) => actualizarCampo("nota_destacado", e.target.value)}
                placeholder="¿Por qué está destacado?"
                rows={2}
                style={{ ...inputStyleAdmin(), marginBottom: 14, resize: "vertical" }}
              />
            )}

            {aviso && <p style={{ fontSize: 12, color: colors.violet, marginBottom: 10 }}>{aviso}</p>}

            <div style={{ display: "grid", gap: 10 }}>
              {campos.map((c) => (
                <label key={c.key} style={{ fontSize: 12, fontWeight: 600 }}>
                  {c.label}
                  <input
                    value={persona[c.key] ?? ""}
                    onChange={(e) => actualizarCampo(c.key, e.target.value)}
                    style={inputStyleAdmin()}
                  />
                </label>
              ))}
            </div>

            <button
              onClick={guardar}
              disabled={guardando}
              className="rp-boton"
              style={{
                marginTop: 14,
                width: "100%",
                padding: "11px 0",
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 700,
                cursor: guardando ? "default" : "pointer",
              }}
            >
              {guardando ? "Guardando…" : "Guardar cambios"}
            </button>

            <p style={{ margin: "22px 0 8px", fontSize: 13, fontWeight: 700 }}>
              Compras ({compras.length})
            </p>
            <div style={{ display: "grid", gap: 6 }}>
              {compras.length === 0 && (
                <p style={{ fontSize: 12, color: "rgba(23,35,61,.55)" }}>Sin compras.</p>
              )}
              {compras.map((c) => {
                const estilo = ESTADO_ESTILO[c.estado] ?? ESTADO_ESTILO.pendiente;
                return (
                  <div
                    key={c.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      background: "#fff",
                      borderRadius: 10,
                      padding: "8px 10px",
                      fontSize: 12,
                    }}
                  >
                    <span>{c.paquete}</span>
                    <span style={{ color: estilo.color, fontWeight: 700 }}>{c.estado}</span>
                  </div>
                );
              })}
            </div>

            {esSuperadmin && (
              <div style={{ marginTop: 26, borderTop: "1px solid rgba(23,35,61,.1)", paddingTop: 16 }}>
                {!confirmarBorrar ? (
                  <button
                    onClick={() => setConfirmarBorrar(true)}
                    style={{
                      border: "1px solid #A32D2D",
                      color: "#A32D2D",
                      background: "transparent",
                      borderRadius: 10,
                      padding: "8px 14px",
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    Eliminar persona
                  </button>
                ) : (
                  <div>
                    <p style={{ fontSize: 12, color: "#A32D2D", marginBottom: 8 }}>
                      Esto borra también todas sus compras, solicitudes y mensajes. ¿Confirmás?
                    </p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={borrar}
                        style={{
                          border: "none",
                          borderRadius: 10,
                          background: "#A32D2D",
                          color: "#fff",
                          padding: "8px 14px",
                          fontSize: 12,
                          cursor: "pointer",
                        }}
                      >
                        Sí, eliminar
                      </button>
                      <button
                        onClick={() => setConfirmarBorrar(false)}
                        style={{
                          border: "1px solid rgba(23,35,61,.15)",
                          borderRadius: 10,
                          background: "transparent",
                          padding: "8px 14px",
                          fontSize: 12,
                          cursor: "pointer",
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ModalNuevaPersona({
  onClose,
  onCreada,
  fetchAutenticado,
}: {
  onClose: () => void;
  onCreada: () => void;
  fetchAutenticado: (input: string, init?: RequestInit) => Promise<Response>;
}) {
  const [nombre, setNombre] = useState("");
  const [telegram, setTelegram] = useState("");
  const [mail, setMail] = useState("");
  const [aviso, setAviso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim() || !telegram.trim()) {
      setAviso("Completá nombre y Telegram.");
      return;
    }
    setEnviando(true);
    const res = await fetchAutenticado("/api/admin/personas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: nombre.trim(),
        telegram: telegram.trim(),
        mail: mail.trim(),
      }),
    });
    setEnviando(false);
    if (res.ok) onCreada();
    else setAviso((await res.json()).error ?? "No se pudo crear.");
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
          width: "min(380px, 100%)",
          display: "grid",
          gap: 10,
        }}
      >
        <h2 className="rp-titulo" style={{ margin: "0 0 4px", fontSize: 17 }}>Nueva persona</h2>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre completo"
          style={inputStyleAdmin()}
        />
        <input
          value={telegram}
          onChange={(e) => setTelegram(e.target.value)}
          placeholder="Usuario de Telegram (sin @)"
          style={inputStyleAdmin()}
        />
        <input
          value={mail}
          onChange={(e) => setMail(e.target.value)}
          placeholder="Email"
          type="email"
          style={inputStyleAdmin()}
        />
        {!mail.trim() && (
          <p style={{ margin: 0, fontSize: 11, color: "#854F0B" }}>
            Sin email, esta persona no va a poder hacer el login de primera vez
            por código.
          </p>
        )}
        {aviso && <p style={{ margin: 0, fontSize: 12, color: "#A32D2D" }}>{aviso}</p>}
        <div style={{ display: "flex", gap: 8 }}>
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
              cursor: "pointer",
            }}
          >
            {enviando ? "Creando…" : "Crear"}
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
