"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { MapPin, Share2, ExternalLink, Phone } from "lucide-react";

export default function Location() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      id="ubicacion"
      className="py-24"
      style={{ background: "#1A0E08" }}
      ref={ref}
    >
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-start">
        {/* Left: info */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-[family-name:var(--font-lato)] text-xs tracking-[0.2em] uppercase text-[#C84B0E] mb-4">
            Dónde estamos
          </p>
          <h2
            className="font-[family-name:var(--font-oswald)] font-bold text-[#F5EDD6] mb-8 leading-tight"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
          >
            Fácil de llegar.
            <br />
            <span className="text-[#C84B0E]">Difícil de olvidar.</span>
          </h2>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="mt-1 flex-shrink-0">
                <MapPin size={18} className="text-[#C84B0E]" aria-hidden="true" />
              </div>
              <div>
                <p className="font-[family-name:var(--font-oswald)] text-[#F5EDD6] font-semibold mb-1">
                  Dirección
                </p>
                <p className="font-[family-name:var(--font-lato)] text-[#C4A882] text-sm leading-relaxed">
                  Costado Norte de la Cancha de Fútbol<br />
                  Tronadora, Tilarán<br />
                  Guanacaste, Costa Rica
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="mt-1 flex-shrink-0">
                <Phone size={18} className="text-[#C84B0E]" aria-hidden="true" />
              </div>
              <div>
                <p className="font-[family-name:var(--font-oswald)] text-[#F5EDD6] font-semibold mb-1">
                  Contacto
                </p>
                <a
                  href="https://www.instagram.com/carnivorosgh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-[family-name:var(--font-lato)] text-[#C4A882] text-sm hover:text-[#F5EDD6] transition-colors"
                >
                  Escríbenos por Instagram
                </a>
              </div>
            </div>
          </div>

          {/* Social links */}
          <div className="mt-10 pt-8 border-t border-[#3D1F0A]">
            <p className="font-[family-name:var(--font-lato)] text-xs tracking-widest uppercase text-[#C4A882] mb-4">
              Síguenos
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/carnivorosgh"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram de Carnívoros Grill House"
                className="flex items-center gap-2 px-5 py-3 bg-[#0C0704] border border-[#3D1F0A] rounded-lg text-[#C4A882] hover:text-[#F5EDD6] hover:border-[#C84B0E]/40 transition-all"
              >
                <Share2 size={16} aria-hidden="true" />
                <span className="font-[family-name:var(--font-lato)] text-sm">@carnivorosgh</span>
              </a>
              <a
                href="https://www.facebook.com/people/Carn%C3%ADvoros-Grill-House/100087487002624/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook de Carnívoros Grill House"
                className="flex items-center gap-2 px-5 py-3 bg-[#0C0704] border border-[#3D1F0A] rounded-lg text-[#C4A882] hover:text-[#F5EDD6] hover:border-[#C84B0E]/40 transition-all"
              >
                <ExternalLink size={16} aria-hidden="true" />
                <span className="font-[family-name:var(--font-lato)] text-sm">Facebook</span>
              </a>
            </div>
          </div>
        </motion.div>

        {/* Right: map-style card */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="rounded-2xl border border-[#3D1F0A] overflow-hidden"
            style={{ minHeight: "340px" }}
          >
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=-84.9800%2C10.4600%2C-84.9400%2C10.4900&layer=mapnik&marker=10.4750%2C-84.9600"
              width="100%"
              height="340"
              style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) brightness(0.8)" }}
              loading="lazy"
              title="Mapa de Tronadora, Tilarán, Guanacaste"
            />
          </div>
          <p className="font-[family-name:var(--font-lato)] text-xs text-[#C4A882] mt-3 text-center">
            Tronadora · Tilarán · Cerca del Lago Arenal
          </p>
        </motion.div>
      </div>
    </section>
  );
}
