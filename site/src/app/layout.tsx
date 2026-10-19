import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MemberAuthProvider } from "@/lib/member-auth-context";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Resonancia Global — Portal de Verificación",
  description:
    "Portal de verificación de compras y pagos para la comunidad Resonancia Global.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={inter.variable} style={{ height: "100%" }}>
      <body style={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>
        <MemberAuthProvider>{children}</MemberAuthProvider>
      </body>
    </html>
  );
}
