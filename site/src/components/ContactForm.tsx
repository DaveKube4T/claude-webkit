"use client"

import { useState } from "react"
import { CheckCircle, ArrowRight } from "lucide-react"

export default function ContactForm() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = e.currentTarget
    const data = new FormData(form)

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          company: data.get("company"),
          service: data.get("service"),
          message: data.get("message"),
        }),
      })
      if (!res.ok) throw new Error("Error")
    } catch {
      // silencioso — no bloqueamos al usuario por error de CRM
    }

    setLoading(false)
    setSent(true)
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <CheckCircle className="text-[#FF9800]" size={48} />
        <p className="text-lg font-semibold text-[#F1F5F9]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
          ¡Mensaje enviado!
        </p>
        <p className="text-sm text-[#94A3B8]">Te respondemos en menos de 24 horas.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium text-[#CBD5E1]">
            Nombre
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="Tu nombre"
            autoComplete="name"
            className="bg-[#0B1220] border border-[#334155] rounded-lg px-4 h-11 text-sm text-[#F1F5F9] placeholder:text-[#475569] focus:outline-none focus:border-[#1E8BFF] transition-colors"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="company" className="text-sm font-medium text-[#CBD5E1]">
            Empresa <span className="text-[#64748B] font-normal">(opcional)</span>
          </label>
          <input
            id="company"
            name="company"
            type="text"
            placeholder="Nombre de tu empresa"
            autoComplete="organization"
            className="bg-[#0B1220] border border-[#334155] rounded-lg px-4 h-11 text-sm text-[#F1F5F9] placeholder:text-[#475569] focus:outline-none focus:border-[#1E8BFF] transition-colors"
          />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium text-[#CBD5E1]">
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="tu@empresa.com"
            autoComplete="email"
            className="bg-[#0B1220] border border-[#334155] rounded-lg px-4 h-11 text-sm text-[#F1F5F9] placeholder:text-[#475569] focus:outline-none focus:border-[#1E8BFF] transition-colors"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="phone" className="text-sm font-medium text-[#CBD5E1]">
            Teléfono <span className="text-[#64748B] font-normal">(opcional)</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+57 300 000 0000"
            autoComplete="tel"
            className="bg-[#0B1220] border border-[#334155] rounded-lg px-4 h-11 text-sm text-[#F1F5F9] placeholder:text-[#475569] focus:outline-none focus:border-[#1E8BFF] transition-colors"
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="service" className="text-sm font-medium text-[#CBD5E1]">
          Servicio de interés
        </label>
        <select
          id="service"
          name="service"
          defaultValue="Automatización con IA"
          className="bg-[#0B1220] border border-[#334155] rounded-lg px-4 h-11 text-sm text-[#F1F5F9] focus:outline-none focus:border-[#1E8BFF] transition-colors"
        >
          <option>Automatización con IA</option>
          <option>Chatbot / WhatsApp</option>
          <option>Landing page / página web</option>
          <option>Marketing automatizado</option>
          <option>No estoy seguro, necesito diagnóstico</option>
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="message" className="text-sm font-medium text-[#CBD5E1]">
          ¿Qué proceso quieres automatizar?
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          placeholder="Cuéntanos brevemente tu negocio y qué proceso te quita más tiempo..."
          className="bg-[#0B1220] border border-[#334155] rounded-lg px-4 py-3 text-sm text-[#F1F5F9] placeholder:text-[#475569] focus:outline-none focus:border-[#1E8BFF] transition-colors resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="btn-grad flex items-center justify-center gap-2 text-white font-semibold h-12 rounded-lg w-full disabled:opacity-60"
      >
        {loading ? "Enviando..." : (
          <>
            Enviar y agendar sesión
            <ArrowRight size={18} />
          </>
        )}
      </button>
      <p className="text-xs text-center text-[#475569]">Sin spam. Te respondemos en menos de 24 horas.</p>
    </form>
  )
}
