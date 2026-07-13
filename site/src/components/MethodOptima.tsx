"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { ArrowRight } from "lucide-react"

const steps = [
  {
    n: "01",
    title: "Diagnóstico de procesos",
    desc: "Identificamos tareas repetitivas, cuellos de botella, oportunidades de automatización y puntos donde se pierden clientes.",
  },
  {
    n: "02",
    title: "Arquitectura tecnológica",
    desc: "Diseñamos el mapa del sistema: formularios, CRM, WhatsApp, emails, bases de datos, IA, reportes y seguimiento.",
  },
  {
    n: "03",
    title: "Implementación y pruebas",
    desc: "Construimos, probamos escenarios reales, corregimos errores y dejamos el flujo listo para operar.",
  },
  {
    n: "04",
    title: "Optimización continua",
    desc: "Medimos resultados y ajustamos el sistema para que cada mes sea más rápido, más claro y más rentable.",
  },
]

function StepCard({ step, index }: { step: typeof steps[0]; index: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  return (
    <motion.div
      ref={ref}
      className="card-glow flex gap-5 bg-[#152033]/70 backdrop-blur-sm border border-[#334155] rounded-xl p-6"
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      <div className="text-4xl font-bold grad-text shrink-0 w-14 relative z-10" style={{ fontFamily: "var(--font-space-grotesk)" }}>
        {step.n}
      </div>
      <div className="relative z-10">
        <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-space-grotesk)" }}>
          {step.title}
        </h3>
        <p className="text-[#94A3B8] leading-relaxed">{step.desc}</p>
      </div>
    </motion.div>
  )
}

export default function MethodOptima() {
  return (
    <section id="proceso" className="py-24 px-6 relative">
      <div className="mx-auto max-w-6xl grid lg:grid-cols-[1fr_1.3fr] gap-12 items-start">
        <motion.div
          className="lg:sticky lg:top-28"
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          <div className="card-glow bg-gradient-to-br from-[#152033]/95 to-[#0B1220]/95 border border-[#334155] rounded-2xl p-8 flex flex-col gap-6">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider grad-text uppercase relative z-10">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF9800]"></span> Método Optima
            </div>
            <h2 className="section-title font-bold relative z-10" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              De idea a sistema funcionando.
            </h2>
            <p className="text-[#94A3B8] leading-relaxed relative z-10">
              Primero entendemos tu operación. Después diseñamos el flujo, lo conectamos con tus herramientas y lo dejamos probado para que tu equipo lo use sin complicarse.
            </p>
            <a href="#contacto" className="btn-grad relative z-10 flex w-fit items-center gap-2 text-white font-semibold h-11 px-7 rounded-lg text-sm">
              Quiero una auditoría
              <ArrowRight size={16} />
            </a>
          </div>
        </motion.div>

        <div className="flex flex-col gap-5">
          {steps.map((s, i) => (
            <StepCard key={s.n} step={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
