"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const colors = {
  night: "#17233D",
  violet: "#7568A8",
};

const PAQUETES = [
  "Alemán con Acceso y Activación",
];
const OTRO = "__otro__";

function imagenDePaquete(paquete: string): string | null {
  if (/sociedad\\s*an[oó]nima|armado de s\\.?a\\.?/i.test(paquete)) return \"/images/packs/sociedad-anonima.png\";
  if (/alem[aá]n/i.test(paquete)) return \"/images/packs/aleman.png\";
  if (/acceso\\s*y\\s*activaci[oó]n/i.test(paquete)) return \"/images/packs/acceso.png\";
  const match = paquete.match(/pack\\s*(\\d)/i);
  if (!match) return null;
  return `/images/packs/pack-${match[1]}.png`;
}

function imagenDePaqueteAleman(paquete: string): string | null {
  if (/alem[aá]n/i.test(paquete)) return "/images/packs/aleman.png";
  return null;
}
function imagenDePaquete(paquete: string): string | null {
  if (/sociedad\s*an[oó]nima|armado de s\.?a\.?/i.test(paquete)) return "/images/packs/sociedad-anonima.png";
  if (/alem[aá]n/i.test(paquete)) return "/images/packs/aleman.png";
  if (/acceso\s*y\s*activaci[oó]n/i.test(paquete)) return "/images/packs/acceso.png";
  const match = paquete.match(/pack\s*(\d)/i);
  if (!match) return null;
  return `/images/packs/pack-${match[1]}.png`;
}

export default function VidrieraPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [telegram, setTelegram] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [paqueteSel, setPaqueteSel] = useState("");
  const [paqueteOtro, setPaqueteOtro] = useState("");
  const [colaboradores, setColaboradores] = useState<string[]>([]);
  const [liderSel, setLiderSel] = useState("");
  const [liderOtro, setLiderOtro] = useState("");
  const [hash, setHash] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    fetch("/api/publico/opciones")
      .then((res) => res.json())
      .then((data) => setColaboradores(data.colaboradores ?? []))
      .catch(() => null);
  }, []);
  const [error, setError] = useState<string | null>(null);
  const [packAmpliado, setPackAmpliado] = useState<string | null>(null);
  const [packHover, setPackHover] = useState<string | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const paquete = paqueteSel === OTRO ? paqueteOtro.trim() : paqueteSel;
    const lider = liderSel === OTRO ? liderOtro.trim() : liderSel === "no_segura" ? "" : liderSel;

    if (!nombre.trim() || !telegram.trim() || !password || !paquete) {
      setError("Completá nombre, Telegram, contraseña y paquete.");
      return;
    }
    if (password !== password2) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (!liderSel) {
      setError("Elegí tu colaboradora (o \"No estoy segura\").");
      return;
    }
    if (!hash.trim()) {
      setError("Ingresá la referencia de pago o hash.");
      return;
    }
    if (!archivo) {
      setError("Subí el comprobante.");
      return;
    }

    setEnviando(true);

    const formData = new FormData();
    formData.set("nombre", nombre.trim());
    formData.set("telegram", telegram.trim());
    formData.set("password", password);
    formData.set("paquete", paquete);
    if (lider.trim()) formData.set("lider", lider.trim());
    formData.set("hash", hash.trim());
    formData.set("comprobante", archivo);

    const res = await fetch("/api/publico/registro", { method: "POST", body: formData });
    const data = await res.json().catch(() => ({}));
    setEnviando(false);

    if (!res.ok) {
      setError(data.error ?? "No pudimos completar el registro.");
      return;
    }

    localStorage.setItem("resonancia_member_token", data.token);
    router.push("/miembro/aceptar");
  }

  return (
    <main
      className="rp-bg-soft"
      style={{
        minHeight: "100vh",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: colors.night,
        padding: "32px 20px 60px",
      }}
    >
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: ".22em",
              color: colors.violet,
            }}
          >
            RESONANCIA GLOBAL
          </div>
          <h1 className="rp-titulo" style={{ fontSize: 26, margin: "8px 0 6px" }}>
            Unite a Resonancia
          </h1>
          <p style={{ fontSize: 13, color: "rgba(23,35,61,.65)", maxWidth: 420, margin: "0 auto" }}>
            {/* Texto genérico — pendiente de redacción final. */}
            Creá tu cuenta, solicitá tu paquete y subí tu comprobante. El equipo revisa y
            confirma tu aporte voluntario a la brevedad.
          </p>
        </div>

        <form
          onSubmit={enviar}
          style={{
            background: "rgba(255,255,255,.85)",
            borderRadius: 18,
            padding: "22px 20px",
            display: "grid",
            gap: 14,
          }}
        >
          <h2 className="rp-titulo" style={{ margin: 0, fontSize: 17 }}>
            Tus datos
          </h2>

          <label style={{ fontSize: 12, fontWeight: 600 }}>
            Nombre completo
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              style={campoEstilo}
            />
          </label>

          <label style={{ fontSize: 12, fontWeight: 600 }}>
            Usuario de Telegram
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: 12,
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
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="tu_usuario"
                required
                style={{ ...campoEstilo, paddingLeft: 24 }}
              />
            </div>
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <label style={{ fontSize: 12, fontWeight: 600 }}>
              Contraseña
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={campoEstilo}
              />
            </label>
            <label style={{ fontSize: 12, fontWeight: 600 }}>
              Repetir contraseña
              <input
                type="password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                required
                style={campoEstilo}
              />
            </label>
          </div>

          {password2.length > 0 && (
            <p
              style={{
                margin: "-6px 0 0",
                fontSize: 11.5,
                fontWeight: 600,
                color: password === password2 ? "#3B6D11" : "#A32D2D",
              }}
            >
              {password === password2 ? "✓ Las contraseñas coinciden" : "✗ Las contraseñas no coinciden"}
            </p>
          )}

          <h2 className="rp-titulo" style={{ margin: "6px 0 0", fontSize: 17 }}>
            Tu paquete
          </h2>

          {paqueteSel && paqueteSel !== OTRO && imagenDePaquete(paqueteSel) && (
            <img
              src={imagenDePaquete(paqueteSel)!}
              alt={paqueteSel}
              style={{
                width: 120,
                height: 120,
                objectFit: "contain",
                objectPosition: "center",
                margin: "0 auto",
                display: "block",
              }}
            />
          )}

          <label style={{ fontSize: 12, fontWeight: 600 }}>
            Solicitá tu paquete
            <select
              value={paqueteSel}
              onChange={(e) => setPaqueteSel(e.target.value)}
              required
              style={campoEstilo}
            >
              <option value="" disabled>
                Solicitá tu paquete
              </option>
              {PAQUETES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
              <option value={OTRO}>Otro…</option>
            </select>
          </label>

          {paqueteSel === OTRO && (
            <input
              value={paqueteOtro}
              onChange={(e) => setPaqueteOtro(e.target.value)}
              placeholder="Escribí el nombre del paquete"
              required
              style={campoEstilo}
            />
          )}

          <label style={{ fontSize: 12, fontWeight: 600 }}>
            Colaboradora
            <select
              value={liderSel}
              onChange={(e) => setLiderSel(e.target.value)}
              required
              style={campoEstilo}
            >
              <option value="" disabled>
                Elegí tu colaboradora
              </option>
              <option value="no_segura">No estoy segura</option>
              <option value="Página web">Entré directo por la página web</option>
              {colaboradores.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value={OTRO}>Otro…</option>
            </select>
          </label>

          {liderSel === OTRO && (
            <input
              value={liderOtro}
              onChange={(e) => setLiderOtro(e.target.value)}
              placeholder="Escribí el nombre de tu colaboradora"
              required
              style={campoEstilo}
            />
          )}

          <label style={{ fontSize: 12, fontWeight: 600 }}>
            Referencia de Pago o Hash
            <input
              value={hash}
              onChange={(e) => setHash(e.target.value)}
              required
              style={campoEstilo}
            />
          </label>

          <label style={{ fontSize: 12, fontWeight: 600 }}>
            Comprobante
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
              required
              style={{ ...campoEstilo, padding: "8px 10px" }}
            />
          </label>

          {error && (
            <p style={{ margin: 0, fontSize: 12, color: "#A32D2D" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="rp-boton"
            style={{
              borderRadius: 12,
              padding: "12px 14px",
              fontSize: 14,
              fontWeight: 700,
              cursor: enviando ? "default" : "pointer",
              opacity: enviando ? 0.75 : 1,
            }}
          >
            {enviando ? "Enviando…" : "Crear cuenta y enviar"}
          </button>

          <p style={{ margin: 0, fontSize: 12, textAlign: "center", color: "rgba(23,35,61,.6)" }}>
            ¿Ya tenés cuenta?{" "}
            <Link href="/" style={{ color: colors.violet, fontWeight: 600 }}>
              Iniciá sesión
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

const campoEstilo: React.CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: 4,
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(23,35,61,.15)",
  fontSize: 13,
  background: "#fff",
};
