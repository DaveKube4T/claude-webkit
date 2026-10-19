import Link from "next/link";

const colors = {
  deepBlue: "#263A63",
  night: "#17233D",
};

export default function PrivacidadPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "60px 24px",
        maxWidth: 720,
        margin: "0 auto",
        background: "#F2F6F6",
        color: colors.night,
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        lineHeight: 1.7,
      }}
    >
      <h1 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 400 }}>
        Privacidad y protección de datos
      </h1>

      <h2 style={{ fontSize: 18 }}>¿Para qué usamos tus datos?</h2>
      <p>
        Los datos personales que compartís (nombre, documento, contacto,
        comprobantes de compra) se usan únicamente para verificar tus
        aportes y comunicarnos con vos dentro de la comunidad Resonancia
        Global. No los compartimos con terceros ni los usamos con fines
        comerciales ajenos a este propósito.
      </p>

      <h2 style={{ fontSize: 18 }}>Participación voluntaria</h2>
      <p>
        Compartir tus datos y comprobantes es voluntario. Podés contactar al
        equipo de verificación en cualquier momento para consultar, corregir
        o eliminar tu información.
      </p>

      <h2 style={{ fontSize: 18 }}>Quién puede ver tu información</h2>
      <p>
        Tus datos y tus consultas privadas no son visibles para otros
        miembros. Solo accede a ellos el equipo autorizado de verificación,
        para poder ayudarte.
      </p>

      <h2 style={{ fontSize: 18 }}>Seguridad</h2>
      <p>
        Guardamos tu información en servidores protegidos y tomamos medidas
        razonables para resguardarla. Ningún sistema es 100% infalible, por
        eso te pedimos no compartir datos extremadamente sensibles (como
        contraseñas de otras cuentas) dentro del Portal.
      </p>

      <h2 style={{ fontSize: 18 }}>Tus derechos</h2>
      <p>
        Podés pedirnos en cualquier momento acceder, corregir o eliminar tus
        datos personales, escribiéndonos por los canales de contacto del
        Portal.
      </p>

      <p style={{ marginTop: 40 }}>
        <Link href="/" style={{ color: colors.deepBlue }}>
          ← Volver al inicio
        </Link>
      </p>
    </main>
  );
}
