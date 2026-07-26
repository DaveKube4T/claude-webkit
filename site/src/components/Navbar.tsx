"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import Logo from "@/components/Logo"
import { SolutionsMenu, SolutionsMenuMobile } from "@/components/SolutionsMenu"

const links = [
  { label: "Servicios", href: "#servicios" },
  { label: "Proceso", href: "#proceso" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "Testimonios", href: "#testimonios" },
  { label: "Contacto", href: "#contacto" },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#334155]/60 bg-[#0B1220]/85 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-6 h-24 flex items-center justify-between">
        <a href="/" aria-label="Optima Technology inicio">
          <Logo size="lg" />
        </a>

        <nav className="hidden md:flex items-center gap-8" aria-label="Navegación principal">
          {links.slice(0, 1).map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-[#94A3B8] hover:text-[#FFB347] transition-colors duration-200"
            >
              {l.label}
            </a>
          ))}
          <SolutionsMenu />
          {links.slice(1).map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-[#94A3B8] hover:text-[#FFB347] transition-colors duration-200"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contacto"
            className="btn-grad text-white font-semibold text-sm h-10 px-5 rounded-lg flex items-center"
          >
            Agendar llamada
          </a>
        </nav>

        <button
          className="md:hidden p-2 text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-[#334155]/60 bg-[#0B1220] px-6 py-4 flex flex-col gap-4">
          {links.slice(0, 1).map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-[#94A3B8] hover:text-[#FFB347] transition-colors py-1"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <SolutionsMenuMobile setMenuOpen={setOpen} />
          {links.slice(1).map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-[#94A3B8] hover:text-[#FFB347] transition-colors py-1"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contacto"
            onClick={() => setOpen(false)}
            className="btn-grad text-white font-semibold text-sm h-11 rounded-lg w-full flex items-center justify-center"
          >
            Agendar llamada
          </a>
        </div>
      )}
    </header>
  )
}
