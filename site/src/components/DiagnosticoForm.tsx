"use client"

import { useState } from "react"
import { CheckCircle, ArrowRight, AlertCircle } from "lucide-react"

const inputClass =
  "bg-[#0B1220] border border-[#334155] rounded-lg px-4 h-11 text-sm text-[#F1F5F9] placeholder:text-[#475569] focus:outline-none focus:border-[#1E8BFF] transition-colors"
const labelClass = "text-sm font-medium text-[#CBD5E1]"

export default function DiagnosticoForm() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [agendar, setAgendar] = useState("no")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const form = e.currentTarget
    const data = new FormData(form)
    const quiereAgenda = data.get("agendar") === "si"
    const horario = (data.get("horario") as string) || ""
    const agenda = quiereAgenda ? `Sí — ${horario}` : "No"

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: data.get("nombre"),
          empresa: data.get("empresa"),
          whatsapp: data.get("whatsapp"),
          email: data.get("email"),
          tipoNegocio: data.get("tipoNegocio"),
          reto: data.get("reto"),
          agenda,
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || "No se pudo enviar")
      }
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <CheckCircle className="text-[#FF9800]" size={48} />
        <p
          className="text-xl font-semibold text-[#F1F5F9]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          ¡Diagnóstico recibido!
        </p>
        <p className="text-sm text-[#94A3B8] max-w-sm">
          Revisamos tu caso y te escribimos por WhatsApp en menos de 24 horas con los primeros
          hallazgos. Sin compromiso.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="nombre" className={labelClass}>
            Nombre <span className="text-[#FF9800]">*</span>
          </label>
          <input id="nombre" name="nombre" type="text" required placeholder="Tu nombre" autoComplete="name" className={inputClass} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="empresa" className={labelClass}>
            Empresa <span className="text-[#64748B] font-normal">(opcional)</span>
          </label>
          <input id="empresa" name="empresa" type="text" placeholder="Nombre de tu empresa" autoComplete="organization" className={inputClass} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="whatsapp" className={labelClass}>
            WhatsApp <span className="text-[#FF9800]">*</span>
          </label>
          <input id="whatsapp" name="whatsapp" type="tel" required placeholder="+57 300 000 0000" autoComplete="tel" className={inputClass} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className={labelClass}>
            Email <span className="text-[#FF9800]">*</span>
          </label>
          <input id="email" name="email" type="email" required placeholder="tu@empresa.com" autoComplete="email" className={inputClass} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="tipoNegocio" className={labelClass}>
          Tipo de negocio <span className="text-[#FF9800]">*</span>
        </label>
        <select id="tipoNegocio" name="tipoNegocio" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            Selecciona…
          </option>
          <option value="Servicios">Servicios</option>
          <option value="Productos">Productos</option>
          <option value="Ambos">Ambos</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="reto" className={labelClass}>
          ¿Qué te quita más tiempo hoy?
        </label>
        <textarea
          id="reto"
          name="reto"
          rows={3}
          placeholder="Ej: responder los mismos mensajes de WhatsApp, pasar pedidos a Excel a mano, hacer cotizaciones…"
          className={`${inputClass} h-auto py-3 resize-none`}
        />
      </div>

      <div className="flex flex-col gap-3 bg-[#0B1220]/60 border border-[#334155] rounded-lg p-4">
        <span className={labelClass}>¿Quieres agendar una llamada?</span>
        <div className="flex gap-3">
          <label className={`flex-1 flex items-center gap-2 px-4 h-11 rounded-lg border cursor-pointer text-sm transition-colors ${agendar === "no" ? "border-[#1E8BFF] text-[#F1F5F9] bg-[#1E8BFF]/10" : "border-[#334155] text-[#94A3B8]"}`}>
            <input type="radio" name="agendar" value="no" checked={agendar === "no"} onChange={() => setAgendar("no")} className="accent-[#FF9800]" />
            No por ahora
          </label>
          <label className={`flex-1 flex items-center gap-2 px-4 h-11 rounded-lg border cursor-pointer text-sm transition-colors ${agendar === "si" ? "border-[#1E8BFF] text-[#F1F5F9] bg-[#1E8BFF]/10" : "border-[#334155] text-[#94A3B8]"}`}>
            <input type="radio" name="agendar" value="si" checked={agendar === "si"} onChange={() => setAgendar("si")} className="accent-[#FF9800]" />
            Sí, agendar
          </label>
        </div>
        {agendar === "si" && (
          <div className="flex flex-col gap-2">
            <label htmlFor="horario" className={labelClass}>
              Horario que prefieres
            </label>
            <select id="horario" name="horario" defaultValue="Mañana (8am-12pm)" className={inputClass}>
              <option>Mañana (8am-12pm)</option>
              <option>Tarde (12pm-6pm)</option>
              <option>Noche (6pm-8pm)</option>
            </select>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-[#EF4444]">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-grad flex items-center justify-center gap-2 text-white font-semibold h-12 rounded-lg w-full disabled:opacity-60"
      >
        {loading ? (
          "Enviando…"
        ) : (
          <>
            Solicitar diagnóstico gratis
            <ArrowRight size={18} />
          </>
        )}
      </button>
      <p className="text-xs text-center text-[#475569]">
        Sin spam. Tus datos solo se usan para preparar tu diagnóstico.
      </p>
    </form>
  )
}
