"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Flame } from "lucide-react";

export default function CTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className="py-24 bg-[#0C0704]" ref={ref}>
      <div className="max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <Flame
            size={36}
            className="text-[#C84B0E] mx-auto mb-6"
            aria-hidden="true"
          />

          <h2
            className="font-[family-name:var(--font-oswald)] font-bold text-[#F5EDD6] mb-4 leading-tight"
            style={{ fontSize: "clamp(2.2rem, 5vw, 3.5rem)" }}
          >
            ¿Ya tienes hambre?
          </h2>

          <p className="font-[family-name:var(--font-lato)] text-[#C4A882] text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Estamos en Tronadora esperándote. Ven por un corte, quédate por la
            experiencia.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="https://www.instagram.com/carnivorosgh"
              target="_blank"
              rel="noopener noreferrer"
              className="font-[family-name:var(--font-lato)] font-bold text-sm px-10 py-4 bg-[#C84B0E] text-[#F5EDD6] rounded uppercase tracking-wider hover:bg-[#E05A18] transition-all duration-200 hover:shadow-[0_0_24px_rgba(200,75,14,0.4)]"
            >
              Contáctanos en Instagram
            </a>
            <a
              href="#ubicacion"
              className="font-[family-name:var(--font-lato)] text-sm px-10 py-4 border border-[#3D1F0A] text-[#C4A882] rounded uppercase tracking-wider hover:border-[#C84B0E] hover:text-[#F5EDD6] transition-all duration-200"
            >
              Ver ubicación
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
