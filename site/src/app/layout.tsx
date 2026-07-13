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
