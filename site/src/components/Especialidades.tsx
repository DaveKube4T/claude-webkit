"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Flame, Beer, Leaf, Utensils } from "lucide-react";

const items = [
  {
    icon: Flame,
    title: "Cortes a la Parrilla",
    desc: "Seleccionamos cada corte con cuidado. Entrecot, lomo fino, costilla — todo pasa por las brasas con el punto que pediste.",
    tag: "Especialidad",
  },
  {
    icon: Beer,
    title: "Cerveza Artesanal",
    desc: "Trabajamos con cervezas artesanales seleccionadas para acompañar la carne. Porque el maridaje también importa.",
    tag: "Bebidas",
  },
  {
    icon: Leaf,
    title: "Ingredientes Locales",
    desc: "Apoyamos productores de Tilarán y Guanacaste. Ingredientes frescos, sabor real, impacto local.",
    tag: "Local",
  },
  {
    icon: Utensils,
    title: "Menú del Día",
    desc: "Opciones diarias que cambian según lo fresco del día. Menos carta, más sabor. Pregunta al llegar.",
    tag: "Diario",
  },
];

export default function Especialidades() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      id="especialidades"
      className="py-24"
      style={{ background: "#1A0E08" }}
      ref={ref}
    >
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14"
        >
          <p className="font-[family-name:var(--font-lato)] text-xs tracking-[0.2em] uppercase text-[#C84B0E] mb-3">
            Lo que hacemos
          </p>
          <h2
            className="font-[family-name:var(--font-oswald)] font-bold text-[#F5EDD6] max-w-sm leading-tight"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
          >
            Sin secretos.
            <br />
            <span className="text-[#C84B0E]">Solo buena carne.</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.55,
                  delay: i * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group bg-[#0C0704] border border-[#3D1F0A] rounded-xl p-6 hover:border-[#C84B0E]/50 transition-all duration-300 hover:bg-[#130A04]"
              >
                <div className="mb-5">
                  <div className="inline-flex p-3 rounded-lg bg-[#1A0E08] border border-[#3D1F0A] group-hover:border-[#C84B0E]/30 transition-colors">
                    <Icon
                      size={22}
                      className="text-[#C84B0E]"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                <span className="font-[family-name:var(--font-lato)] text-[10px] tracking-widest uppercase text-[#F2A520] mb-2 block">
                  {item.tag}
                </span>

                <h3 className="font-[family-name:var(--font-oswald)] text-lg font-semibold text-[#F5EDD6] mb-3 leading-tight">
                  {item.title}
                </h3>

                <p className="font-[family-name:var(--font-lato)] text-sm text-[#C4A882] leading-relaxed">
                  {item.desc}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
