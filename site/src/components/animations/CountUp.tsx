"use client"

import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion"
import { useRef, useEffect, useState } from "react"

interface StatCardProps {
  value: string
  label: string
  delay?: number
}

function parseValue(v: string): { number: number; suffix: string; prefix: string } {
  const match = v.match(/^([^0-9]*)(\d+(?:\.\d+)?)(.*)$/)
  if (!match) return { number: 0, suffix: v, prefix: "" }
  return { prefix: match[1], number: parseFloat(match[2]), suffix: match[3] }
}

export function AnimatedStat({ value, label, delay = 0 }: StatCardProps) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })
  const [displayed, setDisplayed] = useState("0")
  const { prefix, number, suffix } = parseValue(value)

  useEffect(() => {
    if (!inView) return
    const timeout = setTimeout(() => {
      const isInt = Number.isInteger(number)
      const controls = animate(0, number, {
        duration: number < 10 ? 0.8 : 1.8,
        ease: "easeOut",
        onUpdate(v) {
          setDisplayed(isInt ? Math.round(v).toString() : v.toFixed(1))
        },
      })
      return controls.stop
    }, delay * 1000)
    return () => clearTimeout(timeout)
  }, [inView, number, delay])

  return (
    <motion.div
      ref={ref}
      className="bg-[#243347] border border-[#334155] rounded-xl p-5 md:p-6 flex flex-col gap-2"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.5, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      whileHover={{ borderColor: "rgba(16,185,129,0.4)", transition: { duration: 0.2 } }}
    >
      <span
        className="text-4xl font-bold text-[#FF9800]"
        style={{ fontFamily: "var(--font-space-grotesk)" }}
      >
        {prefix}{displayed}{suffix}
      </span>
      <span className="text-sm text-[#94A3B8] leading-snug">{label}</span>
    </motion.div>
  )
}
