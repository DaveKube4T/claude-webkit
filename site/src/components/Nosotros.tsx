"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Star } from "lucide-react";

export default function Nosotros() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="nosotros" className="py-24 bg-[#0C0704]" ref={ref}>
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        {/* Left: stat blocks */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-2 gap-4"
          aria-hidden="true"
        >
          {[
            { value: "#1", label: "Restaurante en Tronadora", color: "text-[#C84B0E]" },
            { value: "5.0", label: "Estrellas en TripAdvisor", color: "text-[#F2A520]" },
            { value: "100%", label: "Cortes seleccionados", color: "text-[#F2A520]" },
            { value: "GH", label: "Grill House artesanal", color: "text-[#C84B0E]" },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-[#1A0E08] border border-[#3D1F0A] rounded-lg p-6 hover:border-[#C84B0E]/40 transition-colors"
            >
              <div
                className={`font-[family-name:var(--font-oswald)] text-4xl font-bold mb-1 ${item.color}`}
              >
                {item.value}
              </div>
              <div className="font-[family-name:var(--font-lato)] text-xs text-[#C4A882] leading-tight">
                {item.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Right: text */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} size={14} className="text-[#F2A520] fill-[#F2A520]" aria-hidden="true" />
            ))}
          </div>

          <h2 className="font-[family-name:var(--font-oswald)] font-bold text-[#F5EDD6] mb-6 leading-tight"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
            No es un restaurante.<br />
            <span className="text-[#C84B0E]">Es una experiencia.</span>
          </h2>

          <div className="font-[family-name:var(--font-lato)] text-[#C4A882] space-y-4 leading-relaxed">
            <p>
              Estamos en el costado norte de la cancha de fútbol de Tronadora,
              a pocos minutos del Lago Arenal. Un lugar donde la parrilla es
              protagonista y cada corte llega a la mesa con el punto exacto.
            </p>
            <p>
              Cerveza artesanal en frío. Carne seleccionada. Y la vista
              tranquila de un pueblo que vale la pena descubrir.
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-[#3D1F0A]">
            <p className="font-[family-name:var(--font-lato)] text-xs text-[#C4A882] tracking-wider uppercase">
              Encuéntranos en
            </p>
            <p className="font-[family-name:var(--font-oswald)] text-[#F5EDD6] mt-1 text-lg">
              Tronadora, Tilarán, Guanacaste — Costa Rica
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
