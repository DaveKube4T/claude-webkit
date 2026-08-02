"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

export default function AutomationBanner() {
  return (
    <section className="py-20 px-6 relative">
      <motion.div
        className="mx-auto max-w-5xl relative overflow-hidden bg-gradient-to-br from-[#1E8BFF]/10 via-[#152033] to-[#FF9800]/10 border border-[#1E8BFF]/25 rounded-3xl p-10 lg:p-14"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
      >
        <div className="orb absolute top-0 right-0 w-72 h-72 rounded-full bg-[#1E8BFF] blur-3xl opacity-20 pointer-events-none"></div>
        <div className="relative flex items-center gap-2 mb-4 text-xs font-semibold tracking-wider grad-text uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF9800]"></span> Automatización inteligente
        </div>
        <h2 className="relative section-title font-bold mb-5 max-w-3xl" style={{ fontFamily: "var(--font-space-grotesk)" }}>
          Convierte tu operación en una máquina de respuesta rápida.
        </h2>
        <p className="relative text-[#CBD5E1] text-lg leading-relaxed max-w-3xl mb-8">
          Imagina que un prospecto llena un formulario, recibe un mensaje inmediato por WhatsApp, entra al CRM, se etiqueta según su necesidad, recibe un email personalizado y tu equipo obtiene una alerta con toda la información. <span className="grad-text font-semibold">Eso es lo que construimos.</span>
        </p>
        <div className="relative flex flex-wrap gap-4">
          <a href="#contacto" className="btn-grad flex items-center gap-2 text-white font-semibold h-12 px-8 rounded-lg">
            Cotizar mi sistema
            <ArrowRight size={18} />
          </a>
          <a href="#contacto" className="btn-outline-grad flex items-center gap-2 border border-[#334155] text-[#F1F5F9] h-12 px-8 rounded-lg">
            Enviar información
          </a>
        </div>
      </motion.div>
    </section>
  )
}
