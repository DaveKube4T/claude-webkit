"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"

const services = [
  {
    title: "Automatización de Flujos con IA",
    description:
      "Tareas repetitivas en todos tus departamentos, eliminadas. Disparadores inteligentes y lógica de decisión para que tu equipo se enfoque en lo que importa.",
    features: ["Mapeo de flujos de trabajo", "Integración de sistemas en tiempo real", "Resultado validado"],
    tags: ["n8n", "CRM", "APIs"],
    icon: (
      <svg width="40" height="40" viewBox="0 0 64 64" fill="none">
        <defs>
          <linearGradient id="grad-svc1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1E8BFF" />
            <stop offset="100%" stopColor="#FF9800" />
          </linearGradient>
        </defs>
        <path
          d="M37 8 L14 36 L28 36 L24 56 L50 26 L34 26 Z"
          fill="url(#grad-svc1)"
          stroke="#fff"
          strokeOpacity="0.3"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Chatbots y Agentes Conversacionales",
    description:
      "Soporte 24/7 sin contratar más personal. Nuestros agentes IA cualifican leads, gestionan reservas y cierran ventas mientras tú duermes.",
    features: ["Atención al cliente automatizada", "Cualificación de leads", "Agente de ventas IA"],
    tags: ["Claude", "WhatsApp", "Webchat"],
    icon: (
      <svg width="44" height="44" viewBox="0 0 64 64" fill="none">
        <defs>
          <linearGradient id="grad-svc2a" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1E8BFF" />
            <stop offset="100%" stopColor="#FF9800" />
          </linearGradient>
          <linearGradient id="grad-svc2b" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFB347" />
            <stop offset="100%" stopColor="#1E8BFF" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="10" r="3" fill="#FFD95E" />
        <rect x="30" y="12" width="4" height="6" rx="2" fill="#94A3B8" />
        <rect x="10" y="18" width="44" height="32" rx="10" fill="url(#grad-svc2a)" />
        <rect x="15" y="22" width="34" height="24" rx="7" fill="#0B1220" />
        <rect x="20" y="28" width="6" height="10" rx="3" fill="url(#grad-svc2b)" />
        <rect x="38" y="28" width="6" height="10" rx="3" fill="url(#grad-svc2b)" />
        <rect x="26" y="42" width="12" height="3" rx="1.5" fill="#FFB347" />
        <rect x="4" y="26" width="6" height="14" rx="3" fill="#1E8BFF" opacity="0.7" />
        <rect x="54" y="26" width="6" height="14" rx="3" fill="#1E8BFF" opacity="0.7" />
      </svg>
    ),
  },
  {
    title: "Diseño de Páginas Web",
    description:
      "Webs que trabajan por ti. Landing pages, sitios corporativos y e-commerce optimizados para convertir visitantes en clientes desde el primer clic.",
    features: ["Alto impacto visual", "Optimización SEO", "Diseño orientado a conversión"],
    tags: ["Next.js", "Vercel", "SEO"],
    icon: (
      <svg width="44" height="44" viewBox="0 0 64 64" fill="none">
        <defs>
          <linearGradient id="grad-svc3a" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1E8BFF" />
            <stop offset="100%" stopColor="#FF9800" />
          </linearGradient>
          <linearGradient id="grad-svc3b" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFB347" />
            <stop offset="100%" stopColor="#1E8BFF" />
          </linearGradient>
        </defs>
        <rect x="7" y="10" width="50" height="36" rx="6" fill="url(#grad-svc3a)" />
        <rect x="11" y="14" width="42" height="28" rx="3" fill="#0B1220" />
        <rect x="14" y="17" width="17" height="11" rx="2" fill="url(#grad-svc3b)" />
        <rect x="35" y="18" width="14" height="3" rx="1.5" fill="#1E8BFF" />
        <rect x="35" y="23" width="12" height="2.5" rx="1.25" fill="#94A3B8" />
        <rect x="35" y="28" width="10" height="2.5" rx="1.25" fill="#94A3B8" />
        <rect x="14" y="32" width="18" height="3" rx="1.5" fill="#FFB347" />
        <rect x="20" y="48" width="24" height="6" rx="3" fill="#152033" />
      </svg>
    ),
  },
  {
    title: "Automatización del Marketing",
    description:
      "Secuencias de email que venden solas, personalización a escala y contenido generado con IA. Tu marketing siempre activo, siempre relevante.",
    features: ["Secuencias de email automatizadas", "Motor de personalización", "Contenido generado con IA"],
    tags: ["Email", "Funnels", "HubSpot"],
    icon: (
      <svg width="44" height="44" viewBox="0 0 64 64" fill="none">
        <defs>
          <linearGradient id="grad-svc4" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1E8BFF" />
            <stop offset="100%" stopColor="#FF9800" />
          </linearGradient>
        </defs>
        <rect x="8" y="8" width="48" height="48" rx="10" fill="rgba(255,255,255,0.06)" stroke="#334155" />
        <rect x="15" y="36" width="7" height="14" rx="2" fill="#1E8BFF" />
        <rect x="25" y="28" width="7" height="22" rx="2" fill="#FFB347" />
        <rect x="35" y="22" width="7" height="28" rx="2" fill="#FF9800" />
        <rect x="45" y="14" width="7" height="36" rx="2" fill="url(#grad-svc4)" />
        <path
          d="M15 32 L26 24 L36 26 L48 14"
          stroke="url(#grad-svc4)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M45 14 h6 v6"
          stroke="#FF9800"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ),
  },
]

function ServiceCard({ service, index }: { service: typeof services[0]; index: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  return (
    <motion.div
      ref={ref}
      className="card-glow bg-[#152033]/70 backdrop-blur-sm border border-[#334155] rounded-2xl p-8 flex flex-col gap-6"
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{ duration: 0.55, delay: index * 0.12, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      <div className="icon-3d">{service.icon}</div>
      <div className="relative z-10">
        <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: "var(--font-space-grotesk)" }}>
          {service.title}
        </h3>
        <p className="text-[#94A3B8] leading-relaxed">{service.description}</p>
      </div>
      <ul className="relative z-10 flex flex-col gap-2">
        {service.features.map((f) => (
          <li key={f} className="flex items-center gap-3 text-sm text-[#CBD5E1]">
            <span className="grad-text font-bold">✓</span>
            {f}
          </li>
        ))}
      </ul>
      <div className="relative z-10 flex flex-wrap gap-2 mt-2 pt-4 border-t border-[#334155]/50">
        {service.tags.map((t) => (
          <span key={t} className="tag-tech">
            {t}
          </span>
        ))}
      </div>
    </motion.div>
  )
}

export default function ServicesSection() {
  const headingRef = useRef(null)
  const headingInView = useInView(headingRef, { once: true, margin: "-80px" })

  return (
    <section id="servicios" className="py-24 px-6 bg-[#0F1A2B]/40 backdrop-blur-sm relative">
      <div className="mx-auto max-w-6xl">
        <motion.div
          ref={headingRef}
          className="mb-16 max-w-2xl"
          initial={{ opacity: 0, y: 24 }}
          animate={headingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          <div className="flex items-center gap-2 mb-4 text-xs font-semibold tracking-wider grad-text uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF9800]"></span> Soluciones
          </div>
          <h2 className="section-title font-bold mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            No necesitas más horas. Necesitas mejores sistemas.
          </h2>
          <p className="text-[#94A3B8] text-lg leading-relaxed">
            Diseñamos una experiencia tecnológica completa: desde tu página web y tus formularios hasta la automatización de seguimiento, atención al cliente y reportes de ventas.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {services.map((s, i) => (
            <ServiceCard key={s.title} service={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
