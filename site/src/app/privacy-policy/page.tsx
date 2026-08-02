import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"
import NeuralCanvas from "@/components/NeuralCanvas"
import Logo from "@/components/Logo"

export const metadata: Metadata = {
  title: "Política de Privacidad — Optima Technology",
  description: "Política de privacidad de Optima Technology. Cómo recopilamos, usamos y protegemos tu información.",
}

const sections = [
  {
    title: "1. Información que podemos recopilar",
    content: "Podemos recopilar información que el usuario proporciona voluntariamente, incluyendo:",
    list: [
      "Nombre y datos de contacto.",
      "Correo electrónico.",
      "Nombre de empresa o proyecto.",
      "Mensaje o información enviada a través de formularios.",
      "Preferencias relacionadas con servicios solicitados.",
    ],
  },
  {
    title: "2. Uso de la información",
    content: "Utilizamos la información recopilada para:",
    list: [
      "Responder solicitudes de información o cotización.",
      "Contactar al usuario sobre servicios solicitados.",
      "Preparar propuestas comerciales.",
      "Mejorar nuestros servicios, sitio web y experiencia de usuario.",
      "Enviar comunicaciones relacionadas con tecnología, automatización o servicios contratados, cuando aplique.",
    ],
  },
  {
    title: "3. Formularios y comunicaciones",
    content:
      "Si el usuario completa un formulario o inicia una conversación desde la página, los datos enviados pueden ser utilizados para responder su solicitud por correo electrónico, teléfono, herramientas de mensajería o CRM. El usuario puede solicitar que dejemos de contactarlo en cualquier momento.",
  },
  {
    title: "4. Cookies y tecnologías similares",
    content:
      "Nuestro sitio puede utilizar cookies o tecnologías similares para mejorar la navegación, medir el rendimiento del sitio, analizar tráfico y optimizar campañas. El usuario puede configurar su navegador para bloquear o eliminar cookies.",
  },
  {
    title: "5. Protección de la información",
    content:
      "Implementamos medidas razonables para proteger la información contra acceso no autorizado, pérdida, uso indebido o divulgación. Sin embargo, ningún sistema digital puede garantizar seguridad absoluta.",
  },
  {
    title: "6. Compartir información con terceros",
    content:
      "No vendemos la información personal de los usuarios. Podemos compartir datos únicamente cuando sea necesario para operar herramientas de comunicación, formularios, CRM, automatización, analítica, hosting o cuando la ley lo requiera.",
  },
  {
    title: "7. Retención de datos",
    content:
      "Conservamos la información durante el tiempo necesario para responder solicitudes, mantener registros comerciales, cumplir obligaciones legales o mejorar nuestros servicios.",
  },
  {
    title: "8. Derechos del usuario",
    content: "El usuario puede solicitar:",
    list: [
      "Acceso a sus datos personales.",
      "Corrección de información incorrecta.",
      "Eliminación de sus datos, cuando sea aplicable.",
      "Dejar de recibir comunicaciones comerciales.",
    ],
  },
  {
    title: "9. Enlaces externos",
    content:
      "Nuestro sitio puede contener enlaces a plataformas externas. No somos responsables por las prácticas de privacidad, contenido o seguridad de sitios web de terceros.",
  },
  {
    title: "10. Cambios a esta política",
    content:
      "Podemos actualizar esta Política de Privacidad ocasionalmente. La versión más reciente estará disponible en esta página con su fecha de actualización.",
  },
]

export default function PrivacyPolicy() {
  return (
    <>
      <NeuralCanvas />
      <main className="min-h-screen bg-transparent relative z-10">
        {/* Nav */}
        <header className="border-b border-[#334155]/60 bg-[#0B1220]/85 backdrop-blur-md sticky top-0 z-50">
          <div className="mx-auto max-w-4xl px-6 h-20 flex items-center justify-between">
            <Link href="/" aria-label="Volver al inicio">
              <Logo size="md" />
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-[#94A3B8] hover:text-[#FFB347] transition-colors"
            >
              <ArrowLeft size={16} />
              Volver al inicio
            </Link>
          </div>
        </header>

        {/* Content */}
        <article className="mx-auto max-w-4xl px-6 py-16 flex flex-col gap-10">
          {/* Header */}
          <div className="flex flex-col gap-4 border-b border-[#334155] pb-10">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider grad-text uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF9800]"></span>
              Política de Privacidad
            </div>
            <h1
              className="text-4xl lg:text-5xl font-bold text-[#F1F5F9] leading-tight"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Tu privacidad <span className="grad-text">importa</span>
            </h1>
            <p className="text-[#94A3B8] text-lg leading-relaxed max-w-2xl">
              Esta política explica cómo Optima Technology recolecta, usa, protege y administra la información que
              compartes al visitar nuestro sitio o comunicarte con nosotros.
            </p>
            <p className="text-sm text-[#64748B]">Última actualización: 19 de mayo de 2026</p>
          </div>

          {/* Sections */}
          <div className="flex flex-col gap-8">
            {sections.map((section) => (
              <section key={section.title} className="flex flex-col gap-3">
                <h2
                  className="text-xl font-bold text-[#F1F5F9]"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  {section.title}
                </h2>
                <p className="text-[#94A3B8] leading-relaxed">{section.content}</p>
                {section.list && (
                  <ul className="flex flex-col gap-2 mt-1">
                    {section.list.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-[#94A3B8]">
                        <span className="mt-2 w-1.5 h-1.5 rounded-full grad-bg shrink-0" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            {/* Contact section */}
            <section className="flex flex-col gap-3">
              <h2 className="text-xl font-bold text-[#F1F5F9]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                11. Contacto
              </h2>
              <p className="text-[#94A3B8] leading-relaxed">
                Para preguntas sobre esta Política de Privacidad o solicitudes relacionadas con datos personales, puedes
                contactarnos en:{" "}
                <a
                  href="mailto:optimatechnology@optima-tech.co"
                  className="grad-text font-semibold hover:underline transition-all"
                >
                  optimatechnology@optima-tech.co
                </a>
              </p>
            </section>

            {/* Disclaimer */}
            <div className="card-glow bg-[#152033]/70 backdrop-blur-sm border border-[#334155] rounded-xl p-6">
              <p className="text-sm text-[#64748B] leading-relaxed relative z-10">
                <strong className="text-[#94A3B8]">Nota:</strong> Esta política es una plantilla general para uso
                informativo y comercial. Para cumplimiento legal específico según país, industria o tipo de datos
                tratados, se recomienda revisión legal.
              </p>
            </div>
          </div>

          {/* CTA bottom */}
          <div className="border-t border-[#334155] pt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <p className="text-sm text-[#64748B]">¿Tienes preguntas? Escríbenos.</p>
            <Link
              href="/#contacto"
              className="btn-grad inline-flex items-center gap-2 text-white font-semibold h-10 px-6 rounded-lg text-sm"
            >
              Ir al formulario de contacto
              <ArrowRight size={16} />
            </Link>
          </div>
        </article>

        {/* Footer */}
        <footer className="border-t border-[#334155] py-8 px-6 bg-[#0B1220]/80 backdrop-blur-sm">
          <div className="mx-auto max-w-4xl flex justify-center text-xs text-[#475569]">
            <span>© {new Date().getFullYear()} Optima Technology. Todos los derechos reservados.</span>
          </div>
        </footer>
      </main>
    </>
  )
}
