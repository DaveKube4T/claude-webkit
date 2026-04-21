"use client";

import { motion } from "framer-motion";
import { Flame, MapPin } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white">
      {/* Subtle green background shapes */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at 70% 40%, rgba(64,145,108,0.08) 0%, transparent 60%), radial-gradient(ellipse at 10% 80%, rgba(26,60,46,0.05) 0%, transparent 50%)",
        }}
      />
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1A3C2E] via-[#40916C] to-[#74C69D]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-28 pb-20 grid md:grid-cols-2 gap-12 items-center">
        {/* Left: copy */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2 mb-6"
          >
            <Flame size={16} className="text-[#40916C]" aria-hidden="true" />
            <span className="font-[family-name:var(--font-lato)] text-xs tracking-[0.2em] uppercase text-[#40916C]">
              Tronadora · Tilarán · Guanacaste
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-[family-name:var(--font-oswald)] font-bold leading-[0.95] mb-6"
            style={{ fontSize: "clamp(3rem, 7vw, 6rem)" }}
          >
            <span className="block text-[#1A3C2E]">Carne</span>
            <span className="block text-[#40916C]">en su</span>
            <span className="block text-[#1A3C2E]">punto.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="font-[family-name:var(--font-lato)] text-[#4A5550] text-lg leading-relaxed mb-8 max-w-md"
          >
            Parrilla artesanal con cortes seleccionados y la mejor cerveza
            artesanal. Al costado norte de la cancha, en Tronadora.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap gap-4"
          >
            <a
              href="#especialidades"
              className="font-[family-name:var(--font-lato)] font-bold text-sm px-8 py-4 bg-[#1A3C2E] text-white rounded uppercase tracking-wider hover:bg-[#2D6A4F] transition-all duration-200 hover:shadow-lg"
            >
              Ver Especialidades
            </a>
            <a
              href="#ubicacion"
              className="font-[family-name:var(--font-lato)] text-sm px-8 py-4 border-2 border-[#C8DDD4] text-[#1A3C2E] rounded uppercase tracking-wider hover:border-[#40916C] hover:bg-[#F2F7F4] transition-all duration-200 flex items-center gap-2"
            >
              <MapPin size={14} aria-hidden="true" />
              Cómo llegar
            </a>
          </motion.div>
        </div>

        {/* Right: decorative panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="hidden md:flex items-center justify-center"
          aria-hidden="true"
        >
          <div className="relative w-72 h-72">
            {/* Outer glow ring */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(64,145,108,0.15) 0%, rgba(26,60,46,0.05) 50%, transparent 70%)",
                filter: "blur(20px)",
              }}
            />
            {/* Center circle */}
            <div className="absolute inset-8 rounded-full bg-[#F2F7F4] border-2 border-[#C8DDD4] flex items-center justify-center">
              <div className="text-center">
                <Flame size={48} className="text-[#40916C] mx-auto mb-2" strokeWidth={1.5} />
                <p className="font-[family-name:var(--font-oswald)] text-sm text-[#1A3C2E] tracking-widest uppercase">
                  Grill House
                </p>
              </div>
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#1A3C2E] rounded-full px-6 py-2 whitespace-nowrap shadow-md">
              <span className="font-[family-name:var(--font-oswald)] text-sm text-white tracking-widest uppercase">
                #1 en Tronadora
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
