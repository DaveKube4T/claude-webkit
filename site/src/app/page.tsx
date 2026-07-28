import Navbar from "@/components/Navbar"
import ContactForm from "@/components/ContactForm"
import NeuralCanvas from "@/components/NeuralCanvas"
import Marquee from "@/components/Marquee"
import Dashboard from "@/components/Dashboard"
import MethodOptima from "@/components/MethodOptima"
import ServicesSection from "@/components/ServicesSection"
import AutomationBanner from "@/components/AutomationBanner"
import HeroVideo from "@/components/HeroVideo"
import WhatsAppFloat from "@/components/WhatsAppFloat"
import CardGlowHandler from "@/components/CardGlow"
import Logo from "@/components/Logo"
import { FadeIn, FadeInStagger, FadeInItem } from "@/components/animations/FadeIn"
import { ArrowRight, Star, MessageCircle } from "lucide-react"

function IconFacebook({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function IconInstagram({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  )
}

function IconLinkedin({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

function IconTiktok({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.5 5.82A4.92 4.92 0 0 1 15.46 3h-3.04v12.4a2.59 2.59 0 1 1-1.83-2.48V9.83a5.62 5.62 0 1 0 4.87 5.57V9.01a7.94 7.94 0 0 0 4.62 1.48V7.45a4.92 4.92 0 0 1-3.58-1.63z" />
    </svg>
  )
}

const testimonials = [
  {
    name: "Carlos Mejía",
    role: "CEO, Distribuidora Andina",
    content:
      "Automatizamos el proceso de cotización que nos tomaba 3 horas al día. Ahora tarda 4 minutos. El ROI lo vimos en el primer mes.",
  },
  {
    name: "Laura Ospina",
    role: "Directora Comercial, Clínica Salud+",
    content:
      "El chatbot agenda citas, responde preguntas frecuentes y filtra leads antes de que lleguen a nuestro equipo. Redujimos carga operativa un 60%.",
  },
  {
    name: "Andrés Varela",
    role: "Fundador, AgriTech Colombia",
    content:
      "Pensé que la automatización era solo para empresas grandes. Optima me demostró lo contrario. En 3 semanas teníamos todo funcionando.",
  },
]

const values = [
  { emoji: "🎯", title: "Enfoque en resultados", desc: "Medimos todo. Si no genera impacto, lo cambiamos." },
  { emoji: "⚡", title: "Implementación rápida", desc: "Primeros resultados en 30 días o menos." },
  { emoji: "🔒", title: "Sin dependencia", desc: "Tus flujos son tuyos. Los documentamos para que los mantengas." },
  { emoji: "📈", title: "Escalable desde día 1", desc: "Construimos para que crezca contigo." },
]

export default function Home() {
  return (
    <>
      <NeuralCanvas />
      <CardGlowHandler />
      <main className="flex flex-col min-h-screen bg-transparent relative z-10">
        <Navbar />

        {/* HERO */}
        <section className="relative pt-40 pb-24 px-6 overflow-hidden">
          <HeroVideo />

          <div className="relative mx-auto max-w-6xl grid lg:grid-cols-[1.1fr_1fr] gap-16 items-center z-10">
            <FadeInStagger className="flex flex-col gap-8" staggerDelay={0.12}>
              <FadeInItem>
                <div className="flex items-center gap-3 text-xs font-semibold tracking-wider text-[#94A3B8] uppercase">
                  <span className="w-2 h-2 rounded-full bg-[#FF9800] pulse-dot"></span>
                  IA · Automatización · Desarrollo Web · Marketing
                </div>
              </FadeInItem>

              <FadeInItem>
                <h1 className="hero-title font-bold text-[#F1F5F9]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  Automatiza hoy.<br />
                  <span className="grad-text">Escala mañana.</span>
                </h1>
                <div className="h-px grad-bg mt-4" style={{ width: "100px" }} aria-hidden="true"></div>
              </FadeInItem>

              <FadeInItem>
                <p className="text-lg text-[#94A3B8] leading-relaxed max-w-lg">
                  Eliminamos el trabajo repetitivo de tu negocio con IA. Flujos inteligentes, agentes conversacionales y marketing automatizado para pymes que quieren crecer sin contratar más personas.
                </p>
              </FadeInItem>

              <FadeInItem>
                <div className="flex flex-wrap gap-4">
                  <a href="#contacto" className="btn-grad flex items-center gap-2 text-white font-semibold h-12 px-8 rounded-lg text-base">
                    Agendar llamada gratuita
                    <ArrowRight size={18} />
                  </a>
                  <a href="#servicios" className="btn-outline-grad flex items-center gap-2 border border-[#334155] text-[#F1F5F9] h-12 px-8 rounded-lg text-base">
                    Ver servicios
                  </a>
                </div>
              </FadeInItem>

              <FadeInItem>
                <div className="flex flex-wrap gap-6">
                  {["Diagnóstico gratis", "Sin permanencia", "Resultados en 30 días"].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <span className="grad-text font-bold">✓</span>
                      <span className="text-sm text-[#94A3B8]">{item}</span>
                    </div>
                  ))}
                </div>
              </FadeInItem>
            </FadeInStagger>

            <Dashboard />
          </div>
        </section>

        <Marquee />

        <ServicesSection />

        <MethodOptima />

        {/* NOSOTROS */}
        <section id="nosotros" className="py-24 px-6 bg-[#0F1A2B]/40 backdrop-blur-sm relative">
          <div className="mx-auto max-w-6xl grid lg:grid-cols-2 gap-16 items-center">
            <FadeIn direction="right">
              <div className="flex flex-col gap-8">
                <div className="flex items-center gap-2 text-xs font-semibold tracking-wider grad-text uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF9800]"></span> Nosotros
                </div>
                <h2 className="section-title font-bold text-[#F1F5F9]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  Somos los que hacen que la IA trabaje para tu negocio
                </h2>
                <p className="text-[#94A3B8] text-lg leading-relaxed">
                  Optima Technology nació en Cali con un objetivo claro: hacer que la automatización inteligente sea accesible para pymes que no tienen un departamento de IT pero sí tienen ambición de crecer.
                </p>
                <p className="text-[#94A3B8] leading-relaxed">
                  No somos una agencia de software que factura por horas. Somos socios técnicos que miden su éxito en los resultados de tu negocio.
                </p>
                <a
                  href="https://wa.me/573052278441?text=Hola%2C%20quiero%20hablar%20con%20el%20equipo%20de%20Optima%20Technology."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-grad flex items-center gap-2 w-fit text-white font-semibold h-11 px-8 rounded-lg"
                >
                  Escríbenos por WhatsApp
                  <ArrowRight size={16} />
                </a>
              </div>
            </FadeIn>

            <FadeInStagger className="grid grid-cols-2 gap-4" staggerDelay={0.1}>
              {values.map((v) => (
                <FadeInItem key={v.title}>
                  <div className="card-glow bg-[#152033]/70 backdrop-blur-sm border border-[#334155] rounded-xl p-6 flex flex-col gap-3 h-full">
                    <span className="text-3xl relative z-10" role="img" aria-label={v.title}>{v.emoji}</span>
                    <h4 className="text-base font-semibold text-[#F1F5F9] relative z-10" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                      {v.title}
                    </h4>
                    <p className="text-xs text-[#94A3B8] leading-relaxed relative z-10">{v.desc}</p>
                  </div>
                </FadeInItem>
              ))}
            </FadeInStagger>
          </div>
        </section>

        <AutomationBanner />

        {/* TESTIMONIOS */}
        <section id="testimonios" className="py-24 px-6 bg-[#0F1A2B]/40 backdrop-blur-sm relative">
          <div className="mx-auto max-w-6xl">
            <FadeIn className="mb-16 max-w-2xl">
              <div className="flex items-center gap-2 mb-4 text-xs font-semibold tracking-wider grad-text uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF9800]"></span> Testimonios
              </div>
              <h2 className="section-title font-bold text-[#F1F5F9]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                Lo que dicen los que ya automatizaron
              </h2>
            </FadeIn>

            <FadeInStagger className="grid md:grid-cols-3 gap-6" staggerDelay={0.12}>
              {testimonials.map((t) => (
                <FadeInItem key={t.name}>
                  <article className="card-glow bg-[#152033]/70 backdrop-blur-sm border border-[#334155] rounded-2xl p-8 flex flex-col gap-6 h-full">
                    <div className="flex gap-1 relative z-10" aria-label="5 de 5 estrellas">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} size={16} className="text-[#FFB347] fill-[#FFB347]" aria-hidden="true" />
                      ))}
                    </div>
                    <blockquote className="text-[#CBD5E1] leading-relaxed flex-1 relative z-10">&ldquo;{t.content}&rdquo;</blockquote>
                    <div className="relative z-10">
                      <div className="text-sm font-semibold text-[#F1F5F9]">{t.name}</div>
                      <div className="text-xs text-[#64748B]">{t.role}</div>
                    </div>
                  </article>
                </FadeInItem>
              ))}
            </FadeInStagger>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="py-20 px-6 relative">
          <FadeIn direction="up">
            <div className="mx-auto max-w-4xl card-glow bg-gradient-to-br from-[#1E8BFF]/12 via-[#152033] to-[#FF9800]/12 border border-[#1E8BFF]/25 rounded-3xl p-12 text-center flex flex-col items-center gap-6">
              <h2 className="cta-title font-bold text-[#F1F5F9] max-w-2xl relative z-10" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                ¿Cuántas horas está perdiendo tu equipo esta semana?
              </h2>
              <p className="text-[#94A3B8] text-lg max-w-lg leading-relaxed relative z-10">
                Una sesión de diagnóstico gratuita. Sin compromiso.
              </p>
              <a href="#contacto" className="btn-grad flex items-center gap-2 text-white font-semibold h-12 px-8 rounded-lg relative z-10">
                Quiero mi diagnóstico gratis
                <ArrowRight size={18} />
              </a>
            </div>
          </FadeIn>
        </section>

        {/* CONTACTO */}
        <section id="contacto" className="py-24 px-6 bg-[#0F1A2B]/40 backdrop-blur-sm relative">
          <div className="mx-auto max-w-6xl grid lg:grid-cols-2 gap-16">
            <FadeIn direction="right">
              <div className="flex flex-col gap-8">
                <div className="flex items-center gap-2 text-xs font-semibold tracking-wider grad-text uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF9800]"></span> Contacto
                </div>
                <h2 className="section-title font-bold text-[#F1F5F9]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  Hablemos de tu próximo sistema
                </h2>
                <p className="text-[#94A3B8] text-lg leading-relaxed">
                  Cuéntanos qué proceso te quita más tiempo y te mostraremos cómo automatizarlo.
                </p>
                <a
                  href="mailto:optimatechnology@optima-tech.co"
                  className="flex items-center gap-3 text-[#94A3B8] hover:text-[#FFB347] transition-colors text-sm w-fit"
                >
                  <div className="icon-3d" style={{ width: 40, height: 40, borderRadius: 10 }}>
                    <MessageCircle size={18} className="text-[#FF9800]" />
                  </div>
                  optimatechnology@optima-tech.co
                </a>
              </div>
            </FadeIn>

            <FadeIn direction="left" delay={0.15}>
              <div className="card-glow bg-[#152033]/70 backdrop-blur-sm border border-[#334155] rounded-2xl p-8">
                <ContactForm />
              </div>
            </FadeIn>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-[#334155] py-12 px-6 bg-[#0B1220]/80 backdrop-blur-sm relative z-10">
          <div className="mx-auto max-w-6xl flex flex-col gap-8">
            <div className="flex flex-col md:flex-row justify-between gap-8">
              <div className="flex flex-col gap-3 max-w-xs">
                <a href="#" className="w-fit" aria-label="Optima Technology inicio">
                  <Logo size="md" />
                </a>
                <p className="text-xs text-[#64748B] leading-relaxed mt-2">
                  Automatización, IA y experiencias digitales para empresas que quieren crecer con mejores sistemas.
                </p>
                <address className="not-italic text-xs text-[#94A3B8] leading-relaxed flex flex-col gap-1">
                  <span>Cali, Valle del Cauca, Colombia</span>
                  <a href="tel:+573052278441" className="w-fit hover:text-[#FFB347] transition-colors">
                    +57 305 227 8441
                  </a>
                </address>
              </div>

              <nav aria-label="Footer navegación" className="flex flex-wrap gap-12">
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-semibold text-[#F1F5F9] uppercase tracking-wide">Servicios</span>
                  {["Automatización con IA", "Chatbots y Agentes", "Diseño Web", "Marketing Automatizado"].map((s) => (
                    <a key={s} href="#servicios" className="text-xs text-[#94A3B8] hover:text-[#FFB347] transition-colors">
                      {s}
                    </a>
                  ))}
                </div>
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-semibold text-[#F1F5F9] uppercase tracking-wide">Empresa</span>
                  {[
                    { label: "Proceso", href: "#proceso" },
                    { label: "Nosotros", href: "#nosotros" },
                    { label: "Testimonios", href: "#testimonios" },
                    { label: "Contacto", href: "#contacto" },
                    { label: "Política de Privacidad", href: "/privacy-policy" },
                  ].map((l) => (
                    <a key={l.label} href={l.href} className="text-xs text-[#94A3B8] hover:text-[#FFB347] transition-colors">
                      {l.label}
                    </a>
                  ))}
                </div>
              </nav>

              <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold text-[#F1F5F9] uppercase tracking-wide">Redes sociales</span>
                <div className="flex gap-3">
                  {[
                    { Icon: IconFacebook, label: "Facebook", href: "https://www.facebook.com/profile.php?id=61590679943770" },
                    { Icon: IconInstagram, label: "Instagram", href: "https://www.instagram.com/optima_technology_co/" },
                    { Icon: IconLinkedin, label: "LinkedIn", href: "https://www.linkedin.com/company/optima-technology-co" },
                    { Icon: IconTiktok, label: "TikTok", href: "https://www.tiktok.com/@optima_technology" },
                  ].map(({ Icon, label, href }) => {
                    const external = href.startsWith("http")
                    return (
                    <a
                      key={label}
                      href={href}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noopener noreferrer" : undefined}
                      aria-label={label}
                      className="w-9 h-9 bg-[#152033] border border-[#334155] rounded-lg flex items-center justify-center text-[#64748B] hover:text-[#FFB347] hover:border-[#1E8BFF]/40 transition-all"
                    >
                      <Icon size={16} />
                    </a>
                    )
                  })}
                </div>
              </div>
            </div>

            <hr className="border-[#334155]/50" />

            <div className="flex justify-center text-xs text-[#475569]">
              <span>© {new Date().getFullYear()} Optima Technology. Todos los derechos reservados.</span>
            </div>
          </div>
        </footer>
      </main>
      <WhatsAppFloat />
    </>
  )
}
