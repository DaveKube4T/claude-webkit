"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { MapPin, Share2, ExternalLink, Phone } from "lucide-react";

export default function Location() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="ubicacion" className="py-24 bg-white" ref={ref}>
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-start">
        {/* Left: info */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-[family-name:var(--font-lato)] text-xs tracking-[0.2em] uppercase text-[#40916C] mb-4">
            Dónde estamos
          </p>
          <h2
            className="font-[family-name:var(--font-oswald)] font-bold text-[#1A3C2E] mb-8 leading-tight"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
          >
            Fácil de llegar.
            <br />
            <span className="text-[#40916C]">Difícil de olvidar.</span>
          </h2>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="mt-1 flex-shrink-0">
                <MapPin size={18} className="text-[#40916C]" aria-hidden="true" />
              </div>
              <div>
                <p className="font-[family-name:var(--font-oswald)] text-[#1A3C2E] font-semibold mb-1">
                  Dirección
                </p>
                <p className="font-[family-name:var(--font-lato)] text-[#4A5550] text-sm leading-relaxed">
                  Costado Norte de la Cancha de Fútbol<br />
                  Tronadora, Tilarán<br />
                  Guanacaste, Costa Rica
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="mt-1 flex-shrink-0">
                <Phone size={18} className="text-[#40916C]" aria-hidden="true" />
              </div>
              <div>
                <p className="font-[family-name:var(--font-oswald)] text-[#1A3C2E] font-semibold mb-1">
                  Contacto
                </p>
                <a
                  href="https://www.instagram.com/carnivorosgh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-[family-name:var(--font-lato)] text-[#40916C] text-sm hover:text-[#1A3C2E] transition-colors"
                >
                  Escríbenos por Instagram
                </a>
              </div>
            </div>
          </div>

          {/* Social links */}
          <div className="mt-10 pt-8 border-t border-[#C8DDD4]">
            <p className="font-[family-name:var(--font-lato)] text-xs tracking-widest uppercase text-[#4A5550] mb-4">
              Síguenos
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/carnivorosgh"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram de Carnívoros Grill House"
                className="flex items-center gap-2 px-5 py-3 bg-[#F2F7F4] border border-[#C8DDD4] rounded-lg text-[#1A3C2E] hover:border-[#40916C] hover:bg-white hover:shadow-sm transition-all"
              >
                <Share2 size={16} aria-hidden="true" />
                <span className="font-[family-name:var(--font-lato)] text-sm">@carnivorosgh</span>
              </a>
              <a
                href="https://www.facebook.com/people/Carn%C3%ADvoros-Grill-House/100087487002624/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook de Carnívoros Grill House"
                className="flex items-center gap-2 px-5 py-3 bg-[#F2F7F4] border border-[#C8DDD4] rounded-lg text-[#1A3C2E] hover:border-[#40916C] hover:bg-white hover:shadow-sm transition-all"
              >
                <ExternalLink size={16} aria-hidden="true" />
                <span className="font-[family-name:var(--font-lato)] text-sm">Facebook</span>
              </a>
            </div>
          </div>
        </motion.div>

        {/* Right: map */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="rounded-2xl border border-[#C8DDD4] overflow-hidden shadow-sm" style={{ minHeight: "340px" }}>
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=-84.9800%2C10.4600%2C-84.9400%2C10.4900&layer=mapnik&marker=10.4750%2C-84.9600"
              width="100%"
              height="340"
              style={{ border: 0 }}
              loading="lazy"
              title="Mapa de Tronadora, Tilarán, Guanacaste"
            />
          </div>
          <p className="font-[family-name:var(--font-lato)] text-xs text-[#4A5550] mt-3 text-center">
            Tronadora · Tilarán · Cerca del Lago Arenal
          </p>
        </motion.div>
      </div>
    </section>
  );
}
