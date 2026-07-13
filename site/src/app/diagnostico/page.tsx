import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Clock, ShieldCheck, Zap } from "lucide-react"
import Logo from "@/components/Logo"
import DiagnosticoForm from "@/components/DiagnosticoForm"

export const metadata: Metadata = {
  title: "Diagnóstico gratis de automatización | Optima Technology",
  description:
    "Cuéntanos qué procesos te quitan tiempo y te entregamos un diagnóstico de automatización con IA para tu negocio. Sin costo, sin compromiso.",
  alternates: { canonical: "/diagnostico" },
  openGraph: {
    title: "Diagnóstico gratis de automatización | Optima Technology",
    description:
      "Cuéntanos qué procesos te quitan tiempo y te entregamos un diagnóstico de automatización con IA. Sin costo.",
    type: "website",
    locale: "es_CO",
  },
}

const beneficios = [
  { Icon: Clock, text: "Respuesta en menos de 24 horas" },
  { Icon: Zap, text: "Diagnóstico accionable, no genérico" },
  { Icon: ShieldCheck, text: "Sin costo y sin compromiso" },
]

export default function DiagnosticoPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header slim */}
      <header className="w-full border-b border-[#334155]/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" aria-label="Optima Technology inicio">
            <Logo size="sm" />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
          >
            <ArrowLeft size={16} />
            Volver al inicio
          </Link>
        </div>
      </header>

      <div className="flex-1 max-w-6xl mx-auto px-6 py-12 md:py-20 w-full grid lg:grid-cols-[1fr_minmax(420px,520px)] gap-12 lg:gap-16 items-start">
        {/* Columna izquierda — propuesta de valor */}
        <div className="flex flex-col gap-6 lg:pt-6">
          <span className="tag-tech w-fit">Diagnóstico gratuito</span>
          <h1
            className="section-title font-bold text-[#F1F5F9]"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Descubre qué puedes <span className="grad-text">automatizar</span> en tu negocio.
          </h1>
          <p className="text-lg text-[#94A3B8] max-w-md">
            Responde 6 preguntas cortas. Analizamos tus procesos y te decimos exactamente dónde
            estás perdiendo tiempo y cómo recuperarlo con IA y automatización.
          </p>

          <ul className="flex flex-col gap-3 mt-2">
            {beneficios.map(({ Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-[#CBD5E1]">
                <span className="w-9 h-9 rounded-lg bg-[#152033] border border-[#334155] flex items-center justify-center text-[#FF9800] shrink-0">
                  <Icon size={18} />
                </span>
                <span className="text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Columna derecha — formulario */}
        <div className="card-glow bg-[#152033]/70 backdrop-blur-sm border border-[#334155] rounded-2xl p-6 sm:p-8">
          <DiagnosticoForm />
        </div>
      </div>

      <footer className="border-t border-[#334155]/50">
        <div className="max-w-6xl mx-auto px-6 py-6 flex justify-center text-xs text-[#475569]">
          <span>© {new Date().getFullYear()} Optima Technology. Todos los derechos reservados.</span>
        </div>
      </footer>
    </main>
  )
}
