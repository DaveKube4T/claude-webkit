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
          ? "bg-white/95 backdrop-blur-sm border-b border-[#C8DDD4] shadow-sm"
          : "bg-white/90 backdrop-blur-sm border-b border-[#C8DDD4]"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <a
          href="#"
          className="font-[family-name:var(--font-oswald)] text-xl font-bold tracking-widest uppercase text-[#1A3C2E] hover:text-[#40916C] transition-colors"
        >
          Carnívoros<span className="text-[#40916C]">.</span>
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="font-[family-name:var(--font-lato)] text-sm tracking-wider uppercase text-[#4A5550] hover:text-[#1A3C2E] transition-colors"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="#ubicacion"
              className="font-[family-name:var(--font-lato)] text-sm px-5 py-2 bg-[#1A3C2E] text-white rounded uppercase tracking-wider hover:bg-[#2D6A4F] transition-colors"
            >
              Visítanos
            </a>
          </li>
        </ul>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          className="md:hidden text-[#1A3C2E] p-2"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-white border-t border-[#C8DDD4] px-6 pb-6">
          <ul className="flex flex-col gap-4 pt-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="font-[family-name:var(--font-lato)] text-base tracking-wider uppercase text-[#4A5550] hover:text-[#1A3C2E] transition-colors block py-2"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#ubicacion"
                onClick={() => setOpen(false)}
                className="font-[family-name:var(--font-lato)] text-sm px-5 py-3 bg-[#1A3C2E] text-white rounded uppercase tracking-wider hover:bg-[#2D6A4F] transition-colors block text-center mt-2"
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
