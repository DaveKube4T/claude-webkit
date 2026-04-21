"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Star } from "lucide-react";

export default function Nosotros() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="nosotros" className="py-24 bg-[#F2F7F4]" ref={ref}>
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
            { value: "#1", label: "Restaurante en Tronadora", color: "text-[#1A3C2E]" },
            { value: "5.0", label: "Estrellas en TripAdvisor", color: "text-[#40916C]" },
            { value: "100%", label: "Cortes seleccionados", color: "text-[#40916C]" },
            { value: "GH", label: "Grill House artesanal", color: "text-[#1A3C2E]" },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white border border-[#C8DDD4] rounded-xl p-6 hover:border-[#40916C] hover:shadow-sm transition-all"
            >
              <div className={`font-[family-name:var(--font-oswald)] text-4xl font-bold mb-1 ${item.color}`}>
                {item.value}
              </div>
              <div className="font-[family-name:var(--font-lato)] text-xs text-[#4A5550] leading-tight">
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
          <div className="flex items-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} size={14} className="text-[#40916C] fill-[#40916C]" aria-hidden="true" />
            ))}
          </div>

          <h2
            className="font-[family-name:var(--font-oswald)] font-bold text-[#1A3C2E] mb-6 leading-tight"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
          >
            No es un restaurante.<br />
            <span className="text-[#40916C]">Es una experiencia.</span>
          </h2>

          <div className="font-[family-name:var(--font-lato)] text-[#4A5550] space-y-4 leading-relaxed">
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

          <div className="mt-8 pt-8 border-t border-[#C8DDD4]">
            <p className="font-[family-name:var(--font-lato)] text-xs text-[#4A5550] tracking-wider uppercase">
              Encuéntranos en
            </p>
            <p className="font-[family-name:var(--font-oswald)] text-[#1A3C2E] mt-1 text-lg">
              Tronadora, Tilarán, Guanacaste — Costa Rica
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
