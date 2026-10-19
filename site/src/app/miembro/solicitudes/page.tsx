"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useMemberAuth } from "@/lib/member-auth-context";
import MemberBottomNav from "@/components/MemberBottomNav";

const colors = { night: "#17233D", violet: "#7568A8" };

const ESTADO_ESTILO: Record<string, { color: string; fondo: string; label: string }> = {
  pendiente: { color: "#854F0B", fondo: "#FAEEDA", label: "Pendiente" },
  aprobada: { color: "#3B6D11", fondo: "#EAF3DE", label: "Aprobada" },
  rechazada: { color: "#A32D2D", fondo: "#FCEBEB", label: "Rechazada" },
};

interface PackReferencia {
  key: string;
  label: string;
  subtitulo?: string;
  imagen: string | null;
  match: RegExp;
  otroTexto: string;
}

const PACKS_REFERENCIA: PackReferencia[] = [
  { key: "origen", label: "Resonancia Origen", imagen: "/images/packs/origen.png", match: /origen/i, otroTexto: "Resonancia Origen" },
  { key: "1", label: "Pack 1", subtitulo: "Corporación, Activación de Nodo", imagen: "/images/packs/pack-1.png", match: /pack\s*1\b/i, otroTexto: "Pack 1" },
  { key: "2", label: "Pack 2", subtitulo: "Vinculación, Llave de Acceso", imagen: "/images/packs/pack-2.png", match: /pack\s*2\b/i, otroTexto: "Pack 2" },
  { key: "3", label: "Pack 3 VIP", subtitulo: "Fundación", imagen: "/images/packs/pack-3.png", match: /pack\s*3\b/i, otroTexto: "Pack 3" },
  { key: "4", label: "Pack 4", subtitulo: "Consultora & Fundación", imagen: "/images/packs/pack-4.png", match: /pack\s*4\b/i, otroTexto: "Pack 4" },
  { key: "5", label: "Pack 5", subtitulo: "Reserva de Pack 4", imagen: "/images/packs/pack-5.png", match: /pack\s*5\b/i, otroTexto: "Pack 5" },
  { key: "sociedad-anonima", label: "Armado de S.A. + Llave de Acceso de regalo", imagen: "/images/packs/sociedad-anonima.png", match: /sociedad\s*an[oó]nima|armado de s\.?a\.?/i, otroTexto: "Armado de S.A. + Llave de Acceso de regalo" },
  { key: "acceso", label: "Programa de Acceso y Activación", imagen: "/images/packs/acceso.png", match: /acceso.*activaci[oó]n/i, otroTexto: "Programa de Acceso y Activación" },
  { key: "aleman", label: "Alemán con Acceso y Activación", imagen: "/images/packs/aleman.png", match: /alem[aá]n/i, otroTexto: "Alemán con Acceso y Activación" },
];

function imagenDePaquete(paquete: string): string | null {
  const item = PACKS_REFERENCIA.find((p) => p.match.test(paquete));
  return item?.imagen ?? null;
}

interface Solicitud {
  id: string;
  paquete: string;
  lider: string | null;
  hash: string | null;
  voucher_url: string | null;
  estado: string;
  creada_en: string;
}

const OTRO = "__otro__";

export default function SolicitudesPage() {
  const { miembro, cargando, fetchAutenticado } = useMemberAuth();
  const [paquetes, setPaquetes] = useState<string[]>([]);
  const [colaboradores, setColaboradores] = useState<string[]>([]);
  const [solicitudes, setSolicitudes] = useState<Solicitud[] | null>(null);

  const [paqueteSel, setPaqueteSel] = useState("");
  const [paqueteOtro, setPaqueteOtro] = useState("");
  const [colaboradorSel, setColaboradorSel] = useState("");
  const [colaboradorOtro, setColaboradorOtro] = useState("");
  const [comentario, setComentario] = useState("");
  const [hash, setHash] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const archivoInputRef = useRef<HTMLInputElement>(null);

  interface PagoParcial {
    id: string;
    hash: string;
    monto: string;
    archivo: File | null;
  }
  const [pagosParciales, setPagosParciales] = useState<PagoParcial[]>([
    { id: "1", hash: "", monto: "", archivo: null },
  ]);

  const esPaqueteParcial = (p: string) => {
    return /pack\s*(1|3|4)\b/i.test(p);
  };
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [packAmpliado, setPackAmpliado] = useState<PackReferencia | null>(null);
  const [packHover, setPackHover] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    const [resOpciones, resSolicitudes] = await Promise.all([
      fetchAutenticado("/api/miembro/opciones"),
      fetchAutenticado("/api/miembro/solicitudes"),
    ]);
    if (resOpciones.ok) {
      const d = await resOpciones.json();
      setPaquetes(d.paquetes);
      setColaboradores(d.colaboradores);
    }
    if (resSolicitudes.ok) {
      const d = await resSolicitudes.json();
      setSolicitudes(d.solicitudes);
    }
  }, [fetchAutenticado]);

  useEffect(() => {
    if (miembro) cargar();
  }, [miembro, cargar]);

  function elegirPorMiniatura(item: PackReferencia) {
    const match = paquetes.find((p) => item.match.test(p));
    if (match) {
      setPaqueteSel(match);
    } else {
      setPaqueteSel(OTRO);
      setPaqueteOtro(item.otroTexto);
    }
  }

  async function enviarSolicitud(e: React.FormEvent) {
    e.preventDefault();
    const paquete = paqueteSel === OTRO ? paqueteOtro.trim() : paqueteSel;
    if (!paquete) {
      setAviso("Elegí o escribí un paquete.");
      return;
    }

    const esParcial = esPaqueteParcial(paquete);

    if (esParcial) {
      // Validar que al menos haya un pago parcial con hash y archivo/monto
      for (let i = 0; i < pagosParciales.length; i++) {
        if (!pagosParciales[i].hash.trim()) {
          setAviso(`El hash del Pago ${i + 1} es obligatorio.`);
          return;
        }
        if (!pagosParciales[i].archivo) {
          setAviso(`El comprobante del Pago ${i + 1} es obligatorio.`);
          return;
        }
      }
    } else {
      if (!hash.trim()) {
        setAviso("El hash o referencia de pago es obligatorio.");
        return;
      }
      if (!archivo) {
        setAviso("El comprobante es obligatorio.");
        return;
      }
    }

    const lider = colaboradorSel === OTRO ? colaboradorOtro.trim() : colaboradorSel;
    setEnviando(true);
    setAviso(null);

    if (esParcial) {
      // Enviar cada pago parcial como solicitud separada o indicar Pago X
      let errorOcurrido = false;
      for (let i = 0; i < pagosParciales.length; i++) {
        const p = pagosParciales[i];
        const numeroPago = i + 1;
        const paqueteConPago = `${paquete} - Pago ${numeroPago}${p.monto.trim() ? ` ($${p.monto.trim()})` : ""}`;

        const res = await fetchAutenticado("/api/miembro/solicitudes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paquete: paqueteConPago,
            lider,
            comentario: `${comentario} [Pago parcial ${numeroPago}${p.monto.trim() ? ` - Monto: ${p.monto.trim()}` : ""}]`.trim(),
            hash: p.hash.trim(),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          errorOcurrido = true;
          setAviso(data.error ?? `No se pudo enviar el Pago ${numeroPago}.`);
          break;
        }

        if (p.archivo) {
          const formData = new FormData();
          formData.append("archivo", p.archivo);
          const resArchivo = await fetchAutenticado(
            `/api/miembro/solicitudes/${data.id}/comprobante`,
            { method: "POST", body: formData }
          );
          if (!resArchivo.ok) {
            errorOcurrido = true;
            setAviso(`El Pago ${numeroPago} se creó, pero falló al subir el comprobante.`);
            break;
          }
        }
      }

      setEnviando(false);
      if (!errorOcurrido) {
        setPaqueteSel("");
        setPaqueteOtro("");
        setColaboradorSel("");
        setColaboradorOtro("");
        setComentario("");
        setPagosParciales([{ id: "1", hash: "", monto: "", archivo: null }]);
        setAviso("¡Pagos parciales enviados correctamente! El equipo los va a revisar.");
        cargar();
      }
      return;
    }

    const res = await fetchAutenticado("/api/miembro/solicitudes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paquete, lider, comentario, hash }),
    });
    const data = await res.json();
    if (!res.ok) {
      setEnviando(false);
      setAviso(data.error ?? "No se pudo enviar la solicitud.");
      return;
    }

    if (archivo) {
      const formData = new FormData();
      formData.append("archivo", archivo);
      const resArchivo = await fetchAutenticado(
        `/api/miembro/solicitudes/${data.id}/comprobante`,
        { method: "POST", body: formData }
      );
      if (!resArchivo.ok) {
        setEnviando(false);
        setAviso(
          "La solicitud se envió, pero no pudimos subir el comprobante. Probá subirlo de nuevo más tarde o contactate con el equipo."
        );
        cargar();
        return;
      }
    }

    setEnviando(false);
    setPaqueteSel("");
    setPaqueteOtro("");
    setColaboradorSel("");
    setColaboradorOtro("");
    setComentario("");
    setHash("");
    setArchivo(null);
    if (archivoInputRef.current) archivoInputRef.current.value = "";
    setAviso("Solicitud enviada. El equipo la va a revisar.");
    cargar();
  }

  if (cargando || !miembro) {
    return (
      <main className="rp-bg-clean" style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <p style={{ color: colors.night, fontFamily: "sans-serif" }}>Cargando…</p>
      </main>
    );
  }

  const opcionesPaquete = PACKS_REFERENCIA.map((item) => item.otroTexto);

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
        <h1 className="rp-titulo" style={{ fontSize: 20, marginBottom: 4 }}>Solicitudes</h1>
        <p style={{ fontSize: 13, color: "rgba(23,35,61,.6)", marginBottom: 6 }}>
          ¿Ya hiciste un aporte y no aparece en "Mis Compras"? Avisanos acá para que lo
          carguemos.
        </p>
        <p
          style={{
            fontSize: 12,
            color: "#854F0B",
            background: "#FAEEDA",
            borderRadius: 10,
            padding: "8px 12px",
            marginBottom: 8,
          }}
        >
          ⚠ Esto no es para hacer un aporte nuevo — es para avisar de un pago que{" "}
          <strong>ya hiciste</strong> y todavía no está registrado.
        </p>
        <div
          style={{
            fontSize: 12.5,
            fontWeight: 700,
            color: "#854F0B",
            background: "#FAEEDA",
            border: "1px solid rgba(133,79,11,.2)",
            borderRadius: 12,
            padding: "10px 14px",
            marginBottom: 18,
            lineHeight: 1.4,
          }}
        >
          🚨 Importante: El único paquete que queda disponible para nuevas adquisiciones es el <strong>Alemán con Acceso y Activación</strong>.
        </div>

        <form
          onSubmit={enviarSolicitud}
          style={{
            background: "rgba(255,255,255,.8)",
            borderRadius: 18,
            padding: "18px 16px",
            marginBottom: 24,
            display: "grid",
            gap: 10,
          }}
        >
          <p className="rp-titulo" style={{ margin: 0, fontSize: 15 }}>
            Tengo una compra sin registrar
          </p>

          <div>
            <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 600, color: colors.night }}>
              ¿No te acordás cuál es? Mirá las imágenes
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 304, margin: "0 auto" }}>
              {PACKS_REFERENCIA.map((p) => {
                const estaSeleccionado =
                  paqueteSel === OTRO ? p.match.test(paqueteOtro) : p.match.test(paqueteSel);
                const estaHover = packHover === p.key;
                return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => elegirPorMiniatura(p)}
                  onMouseEnter={() => setPackHover(p.key)}
                  onMouseLeave={() => setPackHover(null)}
                  style={{
                    flex: "0 0 auto",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 3,
                    border: estaSeleccionado
                      ? `1px solid ${colors.violet}`
                      : "1px solid rgba(23,35,61,.12)",
                    background: "#fff",
                    borderRadius: 10,
                    padding: "6px 8px 7px",
                    cursor: "pointer",
                    width: 68,
                  }}
                >
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setPackAmpliado(p);
                    }}
                    style={{
                      position: "relative",
                      width: 48,
                      height: 48,
                      borderRadius: 8,
                      overflow: "hidden",
                      background: "rgba(23,35,61,.05)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "zoom-in",
                      transform: estaHover ? "scale(1.6)" : "scale(1)",
                      transition: "transform .15s ease",
                      transformOrigin: "center",
                      zIndex: estaHover ? 5 : 1,
                      boxShadow: estaHover ? "0 10px 24px rgba(23,35,61,.3)" : "none",
                    }}
                  >
                    {p.imagen ? (
                      <Image src={p.imagen} alt={p.label} fill sizes="48px" style={{ objectFit: "cover" }} />
                    ) : (
                      <span style={{ fontSize: 20 }}>🧩</span>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      color: "rgba(23,35,61,.65)",
                      textAlign: "center",
                      lineHeight: 1.2,
                    }}
                  >
                    {p.label}
                    {p.subtitulo && (
                      <>
                        <br />
                        <span style={{ fontSize: 9, color: "rgba(23,35,61,.45)" }}>{p.subtitulo}</span>
                      </>
                    )}
                  </span>
                </button>
                );
              })}
            </div>
          </div>

          {packAmpliado && (
            <div
              onClick={() => setPackAmpliado(null)}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 50,
                background: "rgba(23,35,61,.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 24,
                cursor: "zoom-out",
              }}
            >
              <div
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  padding: 18,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  maxWidth: 260,
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: 220,
                    height: 330,
                    maxHeight: "60vh",
                    aspectRatio: "2 / 3",
                    borderRadius: 12,
                    overflow: "hidden",
                    background: "rgba(23,35,61,.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {packAmpliado.imagen ? (
                    <Image src={packAmpliado.imagen} alt={packAmpliado.label} fill sizes="220px" style={{ objectFit: "contain" }} />
                  ) : (
                    <span style={{ fontSize: 48 }}>🧩</span>
                  )}
                </div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, textAlign: "center", color: colors.night }}>
                  {packAmpliado.label}
                  {packAmpliado.subtitulo ? ` — ${packAmpliado.subtitulo}` : ""}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: "rgba(23,35,61,.5)" }}>Tocá para cerrar</p>
              </div>
            </div>
          )}

          <label style={{ fontSize: 12, fontWeight: 600, color: colors.night }}>
            Paquete
            <select
              value={paqueteSel}
              onChange={(e) => setPaqueteSel(e.target.value)}
              required
              style={{
                display: "block",
                width: "100%",
                marginTop: 4,
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(23,35,61,.15)",
                fontSize: 13,
                background: "#fff",
              }}
            >
              <option value="" disabled>
                Elegí un paquete
              </option>
              {opcionesPaquete.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>

          {paqueteSel === OTRO && (
            <input
              value={paqueteOtro}
              onChange={(e) => setPaqueteOtro(e.target.value)}
              placeholder="Escribí el nombre del paquete"
              required
              style={{
                display: "none",
              }}
            />
          )}

          {(() => {
            const paqueteElegido = paqueteSel === OTRO ? paqueteOtro : paqueteSel;
            const imagen = paqueteElegido ? imagenDePaquete(paqueteElegido) : null;
            if (!imagen) return null;
            return (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    position: "relative",
                    width: 56,
                    height: 56,
                    borderRadius: 10,
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  <Image src={imagen} alt={paqueteElegido} fill sizes="56px" style={{ objectFit: "cover" }} />
                </div>
                <p style={{ margin: 0, fontSize: 12, color: "rgba(23,35,61,.6)" }}>
                  ¿Es este el que tenés? Si no, cambiá la selección de arriba.
                </p>
              </div>
            );
          })()}

          <label style={{ fontSize: 12, fontWeight: 600, color: colors.night }}>
            Colaboradora
            <select
              value={colaboradorSel}
              onChange={(e) => setColaboradorSel(e.target.value)}
              style={{
                display: "block",
                width: "100%",
                marginTop: 4,
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(23,35,61,.15)",
                fontSize: 13,
                background: "#fff",
              }}
            >
              <option value="">No estoy segura/o</option>
              {Array.from(new Set([...colaboradores, "Portal Web"])).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value={OTRO}>Otros…</option>
            </select>
          </label>

          {colaboradorSel === OTRO && (
            <input
              value={colaboradorOtro}
              onChange={(e) => setColaboradorOtro(e.target.value)}
              placeholder="Escribí el nombre de la colaboradora"
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(23,35,61,.15)",
                fontSize: 13,
                boxSizing: "border-box",
              }}
            />
          )}

          {paqueteSel && esPaqueteParcial(paqueteSel === OTRO ? paqueteOtro : paqueteSel) ? (
            <div style={{ background: "rgba(117,104,168,.06)", padding: 12, borderRadius: 12, display: "grid", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: colors.violet }}>
                  Comprobantes de Pagos Parciales (Pack 1, 3 o 4)
                </span>
                <span style={{ fontSize: 11, color: "rgba(23,35,61,.6)" }}>
                  Agregá cada pago parcial por separado
                </span>
              </div>

              {pagosParciales.map((pago, index) => (
                <div
                  key={pago.id}
                  style={{
                    background: "#fff",
                    borderRadius: 10,
                    padding: 12,
                    border: "1px solid rgba(23,35,61,.1)",
                    display: "grid",
                    gap: 8,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: colors.night }}>
                      Pago {index + 1}
                    </span>
                    {pagosParciales.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setPagosParciales(pagosParciales.filter((_, i) => i !== index));
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#A32D2D",
                          fontSize: 11,
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        Eliminar
                      </button>
                    )}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: colors.night }}>
                      Monto (ej: 100 USD / 400k)
                      <input
                        value={pago.monto}
                        onChange={(e) => {
                          const nuevos = [...pagosParciales];
                          nuevos[index].monto = e.target.value;
                          setPagosParciales(nuevos);
                        }}
                        placeholder="Monto parcial"
                        style={{
                          display: "block",
                          width: "100%",
                          marginTop: 2,
                          padding: "8px 10px",
                          borderRadius: 8,
                          border: "1px solid rgba(23,35,61,.15)",
                          fontSize: 12,
                          boxSizing: "border-box",
                        }}
                      />
                    </label>

                    <label style={{ fontSize: 11, fontWeight: 600, color: colors.night }}>
                      Hash o Referencia
                      <input
                        value={pago.hash}
                        onChange={(e) => {
                          const nuevos = [...pagosParciales];
                          nuevos[index].hash = e.target.value;
                          setPagosParciales(nuevos);
                        }}
                        placeholder="Hash de transacción"
                        required
                        style={{
                          display: "block",
                          width: "100%",
                          marginTop: 2,
                          padding: "8px 10px",
                          borderRadius: 8,
                          border: "1px solid rgba(23,35,61,.15)",
                          fontSize: 12,
                          boxSizing: "border-box",
                        }}
                      />
                    </label>
                  </div>

                  <label style={{ fontSize: 11, fontWeight: 600, color: colors.night }}>
                    Comprobante de este pago
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        const nuevos = [...pagosParciales];
                        nuevos[index].archivo = file;
                        setPagosParciales(nuevos);
                      }}
                      required
                      style={{
                        display: "block",
                        width: "100%",
                        marginTop: 2,
                        fontSize: 11,
                      }}
                    />
                  </label>
                </div>
              ))}

              <button
                type="button"
                onClick={() => {
                  setPagosParciales([
                    ...pagosParciales,
                    { id: Date.now().toString(), hash: "", monto: "", archivo: null },
                  ]);
                }}
                style={{
                  background: "rgba(117,104,168,.12)",
                  color: colors.violet,
                  border: `1px dashed ${colors.violet}`,
                  padding: "10px",
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Agregar otro comprobante (Pago parcial)
              </button>
            </div>
          ) : (
            <>
              <label style={{ fontSize: 12, fontWeight: 600, color: colors.night }}>
                Hash o referencia de pago
                <input
                  value={hash}
                  onChange={(e) => setHash(e.target.value)}
                  placeholder="Pegá aquí el hash o número de referencia"
                  required
                  style={{
                    display: "block",
                    width: "100%",
                    marginTop: 4,
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid rgba(23,35,61,.15)",
                    fontSize: 13,
                    boxSizing: "border-box",
                  }}
                />
              </label>

              <label style={{ fontSize: 12, fontWeight: 600, color: colors.night }}>
                Comprobante
                <input
                  ref={archivoInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
                  required
                  style={{
                    display: "block",
                    width: "100%",
                    marginTop: 4,
                    fontSize: 12,
                  }}
                />
              </label>
            </>
          )}

          <label style={{ fontSize: 12, fontWeight: 600, color: colors.night }}>
            Comentario (opcional)
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Contanos algo más sobre este pago, si querés"
              rows={3}
              style={{
                display: "block",
                width: "100%",
                marginTop: 4,
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(23,35,61,.15)",
                fontSize: 13,
                fontFamily: "inherit",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
          </label>

          {aviso && (
            <p style={{ margin: 0, fontSize: 12, color: colors.violet }}>{aviso}</p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="rp-boton"
            style={{
              marginTop: 4,
              padding: "12px 14px",
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 700,
              cursor: enviando ? "default" : "pointer",
              opacity: enviando ? 0.7 : 1,
            }}
          >
            {enviando ? "Enviando…" : "Enviar solicitud"}
          </button>
        </form>

        <h2 className="rp-titulo" style={{ fontSize: 15, marginBottom: 10 }}>Mis solicitudes</h2>

        {solicitudes === null && (
          <p style={{ fontSize: 13, color: "rgba(23,35,61,.55)" }}>Cargando…</p>
        )}
        {solicitudes !== null && solicitudes.length === 0 && (
          <p style={{ fontSize: 13, color: "rgba(23,35,61,.55)" }}>
            Todavía no hiciste ninguna solicitud.
          </p>
        )}

        <div style={{ display: "grid", gap: 10 }}>
          {solicitudes?.map((s) => {
            const estilo = ESTADO_ESTILO[s.estado] ?? ESTADO_ESTILO.pendiente;
            return (
              <div
                key={s.id}
                style={{
                  background: "rgba(255,255,255,.8)",
                  borderRadius: 14,
                  padding: "12px 14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div>
                  <p className="rp-titulo" style={{ margin: 0, fontSize: 13 }}>{s.paquete}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(23,35,61,.55)" }}>
                    {new Date(s.creada_en).toLocaleDateString("es-AR")}
                  </p>
                  {s.voucher_url && (
                    <a
                      href={s.voucher_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 11, color: colors.violet }}
                    >
                      Ver comprobante →
                    </a>
                  )}
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
            );
          })}
        </div>
      </div>
      <MemberBottomNav />
    </main>
  );
}
