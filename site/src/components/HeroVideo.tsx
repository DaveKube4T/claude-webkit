"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    if (prefersReducedMotion) return

    const handleReady = () => setReady(true)
    video.addEventListener("loadeddata", handleReady)

    const start = () => {
      video.play().catch(() => {
        // Autoplay bloqueado por el navegador — el poster se queda visible,
        // no es un error que deba interrumpir nada.
      })
    }

    let idleId: number | undefined
    let timeoutId: number | undefined
    const supportsIdleCallback =
      typeof window.requestIdleCallback === "function"
    if (supportsIdleCallback) {
      idleId = window.requestIdleCallback(start, { timeout: 2000 })
    } else {
      timeoutId = window.setTimeout(start, 200)
    }

    return () => {
      video.removeEventListener("loadeddata", handleReady)
      if (typeof window.cancelIdleCallback === "function" && idleId !== undefined) {
        window.cancelIdleCallback(idleId)
      }
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <video
        ref={videoRef}
        className="hero-video absolute inset-0 h-full w-full object-cover"
        poster="/hero-poster.jpg"
        preload="metadata"
        muted
        loop
        playsInline
      >
        <source src="/hero-loop.webm" type="video/webm" />
        <source src="/hero-loop.mp4" type="video/mp4" />
      </video>
      <div
        className={cn(
          "hero-video-poster-fallback absolute inset-0",
          ready && "hero-video-poster-fallback--hidden"
        )}
      />
      <div className="hero-video-glow absolute inset-0" />
      <div className="hero-video-overlay absolute inset-0" />
    </div>
  )
}
