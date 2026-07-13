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
  title: "Optima Technology — Automatiza hoy. Escala mañana.",
  description:
    "Automatizamos procesos de tu negocio con IA. Flujos, chatbots conversacionales, webs de alto impacto y marketing automatizado para pymes.",
  keywords: ["automatización", "inteligencia artificial", "chatbots", "pymes", "n8n", "Colombia"],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Optima Technology — Automatiza hoy. Escala mañana.",
    description:
      "Automatizamos procesos de tu negocio con IA. Flujos, chatbots conversacionales, webs de alto impacto y marketing automatizado para pymes.",
    type: "website",
    locale: "es_CO",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Optima Technology",
      },
    ],
  },
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
        {children}
      </body>
    </html>
  )
}
