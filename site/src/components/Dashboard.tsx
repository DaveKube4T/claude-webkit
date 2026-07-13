"use client"

import { motion, useInView } from "framer-motion"
import { useEffect, useRef, useState } from "react"

function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView) return
    const duration = 1400
    const start = performance.now()
    let raf: number
    function tick(now: number) {
      const p = Math.min((now - start) / duration, 1)
      setValue(Math.floor(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, target])

  return (
    <span ref={ref} className="font-bold" style={{ fontFamily: "var(--font-space-grotesk)" }}>
      {value}{suffix}
    </span>
  )
}

export default function Dashboard() {
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.24, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      <div className="absolute -inset-4 bg-gradient-to-br from-[#1E8BFF]/25 to-[#FF9800]/15 rounded-3xl blur-2xl"></div>
      <div className="card-glow relative bg-[#152033]/95 backdrop-blur-md border border-[#334155] rounded-2xl p-6 flex flex-col gap-5 shadow-2xl">
        <div className="flex justify-between items-start relative z-10">
          <div>
            <div className="text-lg font-bold text-[#F1F5F9]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              Centro de Automatización
            </div>
            <div className="text-xs text-[#64748B] mt-1">Procesos activos en tiempo real</div>
          </div>
          <div className="flex items-center gap-1.5 bg-[#FF9800]/10 border border-[#FF9800]/20 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF9800] pulse-dot"></span>
            <span className="text-[10px] font-semibold text-[#FF9800] uppercase tracking-wide">Online</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 relative z-10">
          <div className="bg-[#0B1220] border border-[#334155] rounded-xl p-4">
            <div className="text-[10px] text-[#64748B] uppercase tracking-wide mb-2">Leads atendidos</div>
            <div className="text-3xl text-[#F1F5F9]">
              <Counter target={247} />
            </div>
            <div className="progress-bar mt-3"><span style={{ width: "82%" }}></span></div>
          </div>
          <div className="bg-[#0B1220] border border-[#334155] rounded-xl p-4">
            <div className="text-[10px] text-[#64748B] uppercase tracking-wide mb-2">Ahorro operativo</div>
            <div className="text-3xl text-[#F1F5F9]">
              <Counter target={68} suffix="%" />
            </div>
            <div className="progress-bar mt-3"><span style={{ width: "68%" }}></span></div>
          </div>
        </div>

        <div className="flex flex-col gap-2 relative z-10">
          <div className="flow-item flex justify-between items-center bg-[#0B1220]/60 border border-[#334155]/60 rounded-lg px-4 py-3 text-sm">
            <span className="text-[#CBD5E1]">Mensaje recibido</span>
            <span className="text-xs grad-text font-semibold" style={{ fontFamily: "var(--font-space-grotesk)" }}>0.2s</span>
          </div>
          <div className="flow-item flex justify-between items-center bg-[#0B1220]/60 border border-[#334155]/60 rounded-lg px-4 py-3 text-sm">
            <span className="text-[#CBD5E1]">IA clasifica intención</span>
            <span className="text-xs grad-text font-semibold" style={{ fontFamily: "var(--font-space-grotesk)" }}>OK</span>
          </div>
          <div className="flow-item flex justify-between items-center bg-[#0B1220]/60 border border-[#334155]/60 rounded-lg px-4 py-3 text-sm">
            <span className="text-[#CBD5E1]">CRM + WhatsApp + Email</span>
            <span className="text-xs grad-text font-semibold" style={{ fontFamily: "var(--font-space-grotesk)" }}>Auto</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
