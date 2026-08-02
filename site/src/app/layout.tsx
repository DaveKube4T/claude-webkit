import type { Metadata } from "next"
import { Space_Grotesk, Inter } from "next/font/google"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.optima-tech.co'),
  title: "Optima Technology | Automatización con IA para Pymes en Colombia",
  description:
    "Automatizamos procesos de tu negocio con IA. Flujos, chatbots conversacionales, webs de alto impacto y marketing automatizado para pymes.",
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Optima Technology — Automatiza hoy. Escala mañana.",
    description:
      "Automatizamos procesos de tu negocio con IA. Flujos, chatbots conversacionales, webs de alto impacto y marketing automatizado para pymes.",
    url: '/',
    type: "website",
    locale: "es_CO",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Optima Technology",
  url: "https://www.optima-tech.co",
  logo: "https://www.optima-tech.co/logo.png",
  description:
    "Agencia de automatización con IA para pymes: flujos n8n, chatbots WhatsApp, CRM y marketing automatizado.",
  email: "optimatechnology@optima-tech.co",
  telephone: "+573052278441",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Cali",
    addressRegion: "Valle del Cauca",
    addressCountry: "CO",
  },
  areaServed: "Colombia",
  sameAs: [
    "https://www.linkedin.com/company/optima-technology-co",
    "https://www.instagram.com/optima_technology_co/",
    "https://www.tiktok.com/@optima_technology",
    "https://www.facebook.com/profile.php?id=61590679943770",
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`${spaceGrotesk.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0B1220] text-[#F1F5F9]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  )
}
