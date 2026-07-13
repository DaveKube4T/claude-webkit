"use client"

import { useEffect, useRef } from "react"

/**
 * Activa el efecto light-on-hover en todos los .card-glow del documento.
 * Mounting once en el layout/page mantiene los handlers sincronizados.
 */
export default function CardGlowHandler() {
  const observerRef = useRef<MutationObserver | null>(null)

  useEffect(() => {
    function attach(el: Element) {
      if ((el as HTMLElement).dataset.glowAttached) return
      ;(el as HTMLElement).dataset.glowAttached = "1"
      el.addEventListener("pointermove", (e) => {
        const ev = e as PointerEvent
        const rect = (el as HTMLElement).getBoundingClientRect()
        ;(el as HTMLElement).style.setProperty("--mx", `${ev.clientX - rect.left}px`)
        ;(el as HTMLElement).style.setProperty("--my", `${ev.clientY - rect.top}px`)
      })
    }

    document.querySelectorAll(".card-glow").forEach(attach)

    // Observa nuevos nodos dinámicos
    observerRef.current = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return
          const el = node as Element
          if (el.classList?.contains("card-glow")) attach(el)
          el.querySelectorAll?.(".card-glow").forEach(attach)
        })
      })
    })
    observerRef.current.observe(document.body, { childList: true, subtree: true })

    return () => {
      observerRef.current?.disconnect()
    }
  }, [])

  return null
}
