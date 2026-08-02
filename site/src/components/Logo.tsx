"use client"

import { useState } from "react"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

const sizes = {
  sm: { mark: 36, height: 36, fontSize: "20px", techSize: "8px" },
  md: { mark: 48, height: 48, fontSize: "26px", techSize: "10px" },
  lg: { mark: 56, height: 56, fontSize: "32px", techSize: "11px" },
}

/**
 * Logo del sitio.
 * - Si existe public/logo.png lo usa (el PNG ya incluye texto).
 * - Si el PNG no carga, hace fallback al SVG inline con texto.
 */
export default function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const s = sizes[size]
  const [usePng, setUsePng] = useState(true)

  if (usePng) {
    return (
      <div className={`flex items-center ${className}`} aria-label="Optima Technology">
        <img
          src="/logo.png"
          alt="Optima Technology"
          style={{ height: s.height, width: "auto", display: "block" }}
          onError={() => setUsePng(false)}
        />
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-3 ${className}`} aria-label="Optima Technology">
      <svg
        width={s.mark}
        height={s.mark}
        viewBox="0 0 100 100"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M5 12 C5 8 9 7 12 9 L54 47 C57 49 57 51 54 53 L12 91 C9 93 5 92 5 88 Z"
          fill="#E08B2A"
        />
        <path
          d="M40 12 C40 8 44 7 47 9 L92 47 C95 49 95 51 92 53 L47 91 C44 93 40 92 40 88 Z"
          fill="#F5A623"
        />
      </svg>
      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className="font-bold tracking-tight text-[#F1F5F9]"
            style={{ fontFamily: "var(--font-space-grotesk)", fontSize: s.fontSize }}
          >
            OPTIMA
          </span>
          <span
            className="font-semibold tracking-[0.3em] grad-text uppercase mt-0.5"
            style={{ fontFamily: "var(--font-space-grotesk)", fontSize: s.techSize }}
          >
            Technology
          </span>
        </div>
      )}
    </div>
  )
}
