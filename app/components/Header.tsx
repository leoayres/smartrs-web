"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

// Inicializa o cliente do Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [usuarioEmail, setUsuarioEmail] = useState("");

  useEffect(() => {
    const checarSessao = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUsuarioEmail(session.user.email || "");
      }
    };
    checarSessao();
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // REGRA DE OURO: Ocultar o Header na tela de login e na tela do Laudo Público
  if (pathname === "/login" || pathname?.startsWith("/laudo/")) {
    return null;
  }

  return (
    <header className="bg-white border-b border-gray-200 py-4 shadow-sm w-full">
      <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
        
        {/* LOGO E MENU DE NAVEGAÇÃO */}
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-black text-blue-900 tracking-tighter">
            SMART<span className="text-blue-500">RS</span>
          </Link>
          
          <nav className="hidden md:flex gap-6">
            <Link 
              href="/" 
              className={`text-sm font-semibold transition-colors ${pathname === "/" ? "text-blue-600" : "text-gray-500 hover:text-gray-900"}`}
            >
              Novo Laudo
            </Link>
            <Link 
              href="/meus-laudos" 
              className={`text-sm font-semibold transition-colors ${pathname === "/meus-laudos" ? "text-blue-600" : "text-gray-500 hover:text-gray-900"}`}
            >
              Meus Laudos
            </Link>
          </nav>
        </div>
        
        {/* DADOS DO USUÁRIO E BOTÃO SAIR */}
        <div className="flex items-center gap-5">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Corretor Logado</span>
            <strong className="text-sm text-slate-700">{usuarioEmail}</strong>
          </div>
          <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
          <button 
            onClick={handleLogout}
            className="text-sm bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 px-4 py-2 rounded-lg font-bold transition-colors"
          >
            Sair
          </button>
        </div>

      </div>
    </header>
  );
}
