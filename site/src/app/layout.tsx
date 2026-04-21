import type { Metadata } from "next";
import { Oswald, Lato } from "next/font/google";
import "./globals.css";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-oswald",
  display: "swap",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-lato",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Carnívoros Grill House | Tronadora, Tilarán",
  description:
    "Parrilla artesanal con cortes seleccionados y cerveza artesanal en Tronadora, Tilarán, Guanacaste. El #1 restaurante cerca del Lago Arenal.",
  keywords: [
    "Carnívoros Grill House",
    "restaurante Tronadora",
    "parrilla Tilarán",
    "carne Guanacaste",
    "Lago Arenal restaurante",
  ],
  openGraph: {
    title: "Carnívoros Grill House | Tronadora, Tilarán",
    description:
      "Cortes seleccionados a la parrilla y cerveza artesanal en Tronadora, junto al Lago Arenal.",
    type: "website",
    locale: "es_CR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${oswald.variable} ${lato.variable}`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
