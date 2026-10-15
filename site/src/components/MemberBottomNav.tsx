"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const colors = {
  night: "#17233D",
  violet: "#7568A8",
};

const ITEMS = [
  { href: "/miembro/perfil", label: "Perfil", icon: "👤" },
  { href: "/miembro", label: "Mis Compras", icon: "🛍️" },
  { href: "/miembro/solicitudes", label: "Solicitudes", icon: "📋" },
  { href: "/miembro/plan-de-vida", label: "Plan de Vida", icon: "🧭" },
  { href: "/miembro/perfil-financiero", label: "P. Financiero", icon: "💰" },
  { href: "/miembro/contacto", label: "Ayuda", icon: "💬" },
];

export default function MemberBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 20,
        display: "flex",
        justifyContent: "center",
        padding: "10px 14px calc(10px + env(safe-area-inset-bottom))",
        background: "rgba(255,255,255,.82)",
        backdropFilter: "blur(18px)",
        borderTop: "1px solid rgba(23,35,61,.08)",
      }}
    >
      <div style={{ display: "flex", gap: 6, width: "100%", maxWidth: 420 }}>
        {ITEMS.map((item) => {
          const activo =
            item.href === "/miembro"
              ? pathname === "/miembro"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                padding: "6px 4px",
                borderRadius: 12,
                textDecoration: "none",
                color: activo ? colors.violet : "rgba(23,35,61,.5)",
                background: activo ? "rgba(117,104,168,.1)" : "transparent",
              }}
            >
              <span style={{ fontSize: 17, lineHeight: 1 }}>{item.icon}</span>
              <span style={{ fontSize: 10, fontWeight: activo ? 700 : 500 }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
