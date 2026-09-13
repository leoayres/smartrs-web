import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/Header"; // <-- NOVO IMPORT
import Footer from "./components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SmartRS | Inteligência Imobiliária",
  description: "Plataforma institucional de valuation, auditoria de precificação e análise geoespacial de ativos imobiliários.",
  openGraph: {
    title: "SmartRS | Inteligência Imobiliária",
    description: "Plataforma institucional de valuation, auditoria de precificação e análise geoespacial.",
    url: "https://smartrs-web.vercel.app",
    siteName: "SmartRS",
    images: [
      {
        url: "https://smartrs-web.vercel.app/og-image.jpg", // A imagem que você colocou no /public
        width: 1200,
        height: 630,
        alt: "Dossiê SmartRS",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} flex flex-col min-h-screen bg-gray-50`}>
        
        {/* CABEÇALHO GLOBAL */}
        <Header />
        
        <main className="flex-grow">
          {children}
        </main>

        <Footer />
        
      </body>
    </html>
  );
}
