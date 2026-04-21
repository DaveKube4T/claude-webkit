"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Star, Quote } from "lucide-react";

const testimonios = [
  {
    texto:
      "La mejor parrilla que he encontrado en la zona. El entrecot estaba perfecto y la cerveza artesanal fue el complemento ideal. Volveremos.",
    nombre: "Mariana V.",
    origen: "San José, Costa Rica",
  },
  {
    texto:
      "Un lugar increíble cerca del Lago Arenal. Ambiente tranquilo, atención directa y la carne, lo mejor que he comido en Guanacaste.",
    nombre: "Jorge A.",
    origen: "Liberia, Guanacaste",
  },
  {
    texto:
      "Pasamos por Tronadora sin planearlo y terminamos cenando acá. Fue el highlight del viaje. Ya le avisé a todos.",
    nombre: "Laura & Tomás",
    origen: "Visitantes internacionales",
  },
];

export default function SocialProof() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="resenas" className="py-24 bg-[#F2F7F4]" ref={ref}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-14"
        >
          <div>
            <p className="font-[family-name:var(--font-lato)] text-xs tracking-[0.2em] uppercase text-[#40916C] mb-3">
              Lo que dicen
            </p>
            <h2
              className="font-[family-name:var(--font-oswald)] font-bold text-[#1A3C2E] leading-tight"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
            >
              La gente habla.
              <br />
              <span className="text-[#40916C]">Y no para.</span>
            </h2>
          </div>

          {/* TripAdvisor badge */}
          <div className="bg-white border border-[#C8DDD4] rounded-xl px-6 py-4 text-center min-w-[160px] shadow-sm">
            <div className="flex justify-center gap-0.5 mb-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={16} className="text-[#40916C] fill-[#40916C]" aria-hidden="true" />
              ))}
            </div>
            <div className="font-[family-name:var(--font-oswald)] text-3xl font-bold text-[#1A3C2E]">
              5.0
            </div>
            <div className="font-[family-name:var(--font-lato)] text-[10px] tracking-widest uppercase text-[#4A5550] mt-0.5">
              TripAdvisor
            </div>
            <div className="font-[family-name:var(--font-lato)] text-[10px] text-[#40916C] mt-1 font-bold">
              #1 en Tronadora
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonios.map((t, i) => (
            <motion.blockquote
              key={t.nombre}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.55,
                delay: 0.1 + i * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="bg-white border border-[#C8DDD4] rounded-xl p-7 flex flex-col gap-4 hover:border-[#40916C] hover:shadow-md transition-all"
            >
              <Quote size={20} className="text-[#40916C] opacity-60" aria-hidden="true" />
              <p className="font-[family-name:var(--font-lato)] text-[#4A5550] text-sm leading-relaxed flex-1">
                &ldquo;{t.texto}&rdquo;
              </p>
              <footer className="pt-4 border-t border-[#C8DDD4]">
                <div className="font-[family-name:var(--font-oswald)] text-[#1A3C2E] font-semibold">
                  {t.nombre}
                </div>
                <div className="font-[family-name:var(--font-lato)] text-xs text-[#4A5550] mt-0.5">
                  {t.origen}
                </div>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
