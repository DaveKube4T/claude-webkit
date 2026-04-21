"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "#nosotros", label: "Nosotros" },
  { href: "#especialidades", label: "Especialidades" },
  { href: "#resenas", label: "Reseñas" },
  { href: "#ubicacion", label: "Ubicación" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0C0704]/95 backdrop-blur-sm border-b border-[#3D1F0A]"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <a
          href="#"
          className="font-[family-name:var(--font-oswald)] text-xl font-bold tracking-widest uppercase text-[#F5EDD6] hover:text-[#F2A520] transition-colors"
        >
          Carnívoros<span className="text-[#C84B0E]">.</span>
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="font-[family-name:var(--font-lato)] text-sm tracking-wider uppercase text-[#C4A882] hover:text-[#F5EDD6] transition-colors"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="#ubicacion"
              className="font-[family-name:var(--font-lato)] text-sm px-5 py-2 bg-[#C84B0E] text-[#F5EDD6] rounded uppercase tracking-wider hover:bg-[#E05A18] transition-colors"
            >
              Visítanos
            </a>
          </li>
        </ul>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          className="md:hidden text-[#F5EDD6] p-2"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-[#0C0704]/98 border-t border-[#3D1F0A] px-6 pb-6">
          <ul className="flex flex-col gap-4 pt-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="font-[family-name:var(--font-lato)] text-base tracking-wider uppercase text-[#C4A882] hover:text-[#F5EDD6] transition-colors block py-2"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#ubicacion"
                onClick={() => setOpen(false)}
                className="font-[family-name:var(--font-lato)] text-sm px-5 py-3 bg-[#C84B0E] text-[#F5EDD6] rounded uppercase tracking-wider hover:bg-[#E05A18] transition-colors block text-center mt-2"
              >
                Visítanos
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
