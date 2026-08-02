"use client"

import { useEffect, useRef } from "react"

export default function NeuralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let particles: { x: number; y: number; vx: number; vy: number; r: number; hue: "blue" | "green" }[] = []
    let rafId: number

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    function resize() {
      if (!canvas || !ctx) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = window.innerWidth + "px"
      canvas.style.height = window.innerHeight + "px"
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      init()
    }

    function init() {
      const count = Math.min(110, Math.max(50, Math.floor(window.innerWidth / 14)))
      particles = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.6 + 0.7,
        hue: i % 2 === 0 ? "blue" : "green",
      }))
    }

    function color(p: typeof particles[number], alpha: number) {
      return p.hue === "green"
        ? `rgba(16,185,129,${alpha})`
        : `rgba(30,139,255,${alpha})`
    }

    function tick() {
      if (!ctx) return
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = window.innerWidth
        if (p.x > window.innerWidth) p.x = 0
        if (p.y < 0) p.y = window.innerHeight
        if (p.y > window.innerHeight) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = color(p, 0.7)
        ctx.shadowColor = color(p, 0.85)
        ctx.shadowBlur = 10
        ctx.fill()
        ctx.shadowBlur = 0

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j]
          const dx = p.x - q.x
          const dy = p.y - q.y
          const dist = Math.hypot(dx, dy)
          if (dist < 140) {
            const alpha = (1 - dist / 140) * 0.18
            const grad = ctx.createLinearGradient(p.x, p.y, q.x, q.y)
            grad.addColorStop(0, color(p, alpha))
            grad.addColorStop(1, color(q, alpha))
            ctx.strokeStyle = grad
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.stroke()
          }
        }
      }
      if (!prefersReduced) rafId = requestAnimationFrame(tick)
    }

    resize()
    if (!prefersReduced) tick()
    window.addEventListener("resize", resize)

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-screen h-screen pointer-events-none"
      style={{ opacity: 0.45, zIndex: 0 }}
    />
  )
}
