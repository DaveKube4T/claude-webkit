"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { solutions, type Solution } from "@/data/solutions"

const CLOSE_DELAY_MS = 150

function renderSolutionCard(solution: Solution, open: boolean, onNavigate?: () => void) {
  return (
    <a
      key={solution.href}
      href={solution.href}
      tabIndex={open ? 0 : -1}
      onClick={onNavigate}
      className={cn(
        "block rounded-lg p-3 transition-all duration-200",
        "hover:bg-[#334155]/30 hover:-translate-y-0.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB347]"
      )}
    >
      <span className="block text-base font-semibold text-[#F1F5F9]">
        {solution.icon} {solution.title}
      </span>
      <span className="block text-sm text-[#94A3B8] mt-1">
        {solution.description}
      </span>
    </a>
  )
}

export function SolutionsMenu() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelClose = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }

  const scheduleClose = () => {
    cancelClose()
    closeTimeoutRef.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS)
  }

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        const hadFocusInside = containerRef.current?.contains(document.activeElement)
        setOpen(false)
        if (hadFocusInside) {
          triggerRef.current?.focus()
        }
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  useEffect(() => () => cancelClose(), [])

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => {
        cancelClose()
        setOpen(true)
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="solutions-panel"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1 text-sm font-medium text-[#94A3B8] hover:text-[#FFB347] transition-colors duration-200"
      >
        Soluciones IA
        <ChevronDown
          size={16}
          className={cn("transition-transform duration-200", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      <div
        id="solutions-panel"
        aria-hidden={!open}
        className={cn(
          "absolute left-0 top-full mt-2 w-72 rounded-xl border border-[#334155]/60 bg-[#111A2C] p-3 shadow-xl",
          "transition-all duration-200 ease-out",
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-2 pointer-events-none"
        )}
      >
        {solutions.map((solution) => renderSolutionCard(solution, open))}
      </div>
    </div>
  )
}
