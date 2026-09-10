import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer"; // <-- 1. IMPORTAMOS O FOOTER AQUI

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SmartRS | Dossiê Imobiliário",
  description: "Plataforma de Inteligência e Valorização Imobiliária",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      {/* 2. ADICIONAMOS FLEXBOX NO BODY PARA EMPURRAR O FOOTER PRO FINAL */}
      <body className={`${inter.className} flex flex-col min-h-screen bg-gray-50`}>
        
        {/* 3. O CONTEÚDO PRINCIPAL (As páginas vão renderizar aqui dentro) */}
        <main className="flex-grow">
          {children}
        </main>

        {/* 4. O NOSSO FOOTER NO FINAL DE TUDO */}
        <Footer />
        
      </body>
    </html>
  );
}
