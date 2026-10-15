"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const colors = { night: "#17233D", violet: "#7568A8" };

const ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/compras", label: "Compras" },
  { href: "/admin/solicitudes", label: "Solicitudes" },
  { href: "/admin/personas", label: "Personas" },
  { href: "/admin/mensajes", label: "Mensajes" },
  { href: "/admin/equipo", label: "Equipo" },
  { href: "/admin/condiciones", label: "Condiciones" },
  { href: "/admin/hash-duplicados", label: "Duplicados" },
  { href: "/admin/colaboradoras", label: "Colaboradoras" },
  { href: "/admin/perfiles-incompletos", label: "Perfiles" },
  { href: "/admin/mensajes-sin-registrar", label: "Sin registrar" },
  { href: "/admin/pagos-inversion", label: "Pagos", soloEquipo: true },
  { href: "/admin/historial", label: "Historial", soloEquipo: true },
];

export default function AdminNav({ rol }: { rol?: string }) {
  const pathname = usePathname();
  const items = ITEMS.filter((item) => !item.soloEquipo || rol === "superadmin" || rol === "admin");

  return (
    <nav
      style={{
        display: "flex",
        gap: 6,
        marginBottom: 20,
        borderBottom: "1px solid rgba(23,35,61,.08)",
        paddingBottom: 10,
        overflowX: "auto",
      }}
    >
      {items.map((item) => {
        const activo =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              padding: "7px 14px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: activo ? 700 : 500,
              textDecoration: "none",
              whiteSpace: "nowrap",
              color: activo ? "#fff" : colors.night,
              background: activo ? colors.violet : "transparent",
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
