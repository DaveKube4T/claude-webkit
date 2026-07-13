"use client"

import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface ServiceCardProps {
  icon: LucideIcon
  title: string
  description: string
  features: string[]
}

export function AnimatedServiceCard({ icon: Icon, title, description, features }: ServiceCardProps) {
  return (
    <motion.div
      className="bg-[#1E293B] border border-[#334155] rounded-2xl p-8 flex flex-col gap-6 cursor-default"
      variants={{
        hidden: { opacity: 0, y: 28 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] } },
      }}
      whileHover={{
        borderColor: "rgba(16,185,129,0.45)",
        y: -4,
        transition: { duration: 0.25 },
      }}
    >
      <motion.div
        className="w-12 h-12 bg-[#FF9800]/10 rounded-xl flex items-center justify-center shrink-0"
        whileHover={{ backgroundColor: "rgba(16,185,129,0.18)", scale: 1.05 }}
        transition={{ duration: 0.2 }}
        aria-hidden="true"
      >
        <Icon size={24} className="text-[#FF9800]" />
      </motion.div>
      <div className="flex flex-col gap-3">
        <h3
          className="text-xl font-bold text-[#F1F5F9]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          {title}
        </h3>
        <p className="text-[#94A3B8] text-sm leading-relaxed">{description}</p>
      </div>
      <ul className="flex flex-col gap-2">
        {features.map((f, i) => (
          <motion.li
            key={f}
            className="flex items-center gap-3 text-sm text-[#CBD5E1]"
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.08 }}
          >
            <CheckCircle2 size={14} className="text-[#FF9800] shrink-0" aria-hidden="true" />
            {f}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  )
}
