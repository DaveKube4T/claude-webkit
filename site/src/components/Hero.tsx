"use client";

import { motion } from "framer-motion";
import { Flame, MapPin } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background gradient layers */}
      <div className="absolute inset-0 bg-[#0C0704]" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 60% 50%, rgba(200,75,14,0.18) 0%, transparent 65%), radial-gradient(ellipse at 20% 80%, rgba(242,165,32,0.10) 0%, transparent 50%)",
        }}
      />
      {/* Diagonal texture stripe */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            #F5EDD6,
            #F5EDD6 1px,
            transparent 1px,
            transparent 8px
          )`,
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-28 pb-20 grid md:grid-cols-2 gap-12 items-center">
        {/* Left: copy */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2 mb-6"
          >
            <Flame size={16} className="text-[#C84B0E]" aria-hidden="true" />
            <span className="font-[family-name:var(--font-lato)] text-xs tracking-[0.2em] uppercase text-[#C84B0E]">
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
            <span className="block text-[#F5EDD6]">Carne</span>
            <span className="block text-[#C84B0E]">en su</span>
            <span className="block text-[#F5EDD6]">punto.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="font-[family-name:var(--font-lato)] text-[#C4A882] text-lg leading-relaxed mb-8 max-w-md"
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
              className="font-[family-name:var(--font-lato)] font-700 text-sm px-8 py-4 bg-[#C84B0E] text-[#F5EDD6] rounded uppercase tracking-wider hover:bg-[#E05A18] transition-all duration-200 hover:shadow-[0_0_20px_rgba(200,75,14,0.4)]"
            >
              Ver Especialidades
            </a>
            <a
              href="#ubicacion"
              className="font-[family-name:var(--font-lato)] text-sm px-8 py-4 border border-[#3D1F0A] text-[#C4A882] rounded uppercase tracking-wider hover:border-[#C84B0E] hover:text-[#F5EDD6] transition-all duration-200 flex items-center gap-2"
            >
              <MapPin size={14} aria-hidden="true" />
              Cómo llegar
            </a>
          </motion.div>
        </div>

        {/* Right: decorative fire panel */}
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
                  "radial-gradient(circle, rgba(200,75,14,0.25) 0%, rgba(242,165,32,0.08) 50%, transparent 70%)",
                filter: "blur(20px)",
              }}
            />
            {/* Center flame icon cluster */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <Flame
                  size={100}
                  className="text-[#C84B0E]"
                  strokeWidth={1}
                />
                <Flame
                  size={60}
                  className="text-[#F2A520] absolute top-4 left-5"
                  strokeWidth={1}
                />
              </div>
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#1A0E08] border border-[#3D1F0A] rounded-full px-6 py-2 whitespace-nowrap">
              <span className="font-[family-name:var(--font-oswald)] text-sm text-[#F2A520] tracking-widest uppercase">
                #1 en Tronadora
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        aria-hidden="true"
      >
        <div className="w-px h-10 bg-gradient-to-b from-transparent to-[#3D1F0A]" />
      </motion.div>
    </section>
  );
}
