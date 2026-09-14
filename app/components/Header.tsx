"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { Menu, X, Settings, ShieldCheck, Coins } from "lucide-react"; 

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [usuarioEmail, setUsuarioEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false); 
  const [creditos, setCreditos] = useState<number | null>(null); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 

  useEffect(() => {
    const checarSessao = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUsuarioEmail(session.user.email || "");
        
        const { data } = await supabase.from("usuarios").select("nivel_acesso, creditos").eq("id", session.user.id).single();
        if (data) {
          if (data.nivel_acesso === 'admin') setIsAdmin(true);
          setCreditos(data.creditos);
        }
      }
    };
    checarSessao();
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // HEADER PÚBLICO
  if (pathname === "/login" || pathname?.startsWith("/laudo/")) {
    return (
      <header className="bg-white border-b border-gray-200 py-5 shadow-sm w-full">
        <div className="max-w-6xl mx-auto px-6 flex justify-center items-center">
          <Link href="/" className="text-2xl font-black text-blue-900 tracking-tighter" select-none="true">
            SMART<span className="text-blue-500">RS</span>
          </Link>
        </div>
      </header>
    );
  }

  // HEADER PRIVADO
  return (
    <header className="bg-white border-b border-gray-200 py-4 shadow-sm w-full relative z-50">
      <div className="max-w-6xl mx-auto px-4 md:px-6 flex justify-between items-center">
        
        <div className="flex items-center gap-4">
          <Link href="/" className="text-2xl font-black text-blue-900 tracking-tighter" onClick={() => setIsMobileMenuOpen(false)}>
            SMART<span className="text-blue-500">RS</span>
          </Link>
        </div>

        {/* NAVEGAÇÃO DESKTOP */}
        <nav className="hidden md:flex gap-6 items-center flex-1 ml-8">
            <Link href="/" className={`text-sm font-semibold transition-colors ${pathname === "/" ? "text-blue-600" : "text-gray-500 hover:text-gray-900"}`}>
              Novo Laudo
            </Link>
            <Link href="/meus-laudos" className={`text-sm font-semibold transition-colors ${pathname === "/meus-laudos" ? "text-blue-600" : "text-gray-500 hover:text-gray-900"}`}>
              Meus Laudos
            </Link>
        </nav>
        
        {/* DADOS DESKTOP E BOTOES */}
        <div className="flex items-center gap-3 md:gap-5">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
              {isAdmin ? "Administrador" : "Corretor Logado"}
            </span>
            <strong className="text-sm text-slate-700">{usuarioEmail}</strong>
          </div>
          
          <div className="h-8 w-px bg-gray-200 hidden md:block"></div>
          
          {/* Badge de Créditos com Ícone Profissional (Oculto para Admins) */}
          {creditos !== null && !isAdmin && (
            <Link href="/planos" className={`hidden md:flex items-center gap-2 text-sm px-3.5 py-2 rounded-xl font-bold transition-all shadow-sm border ${creditos <= 0 ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'}`}>
              <Coins size={16} className={creditos <= 0 ? 'text-red-600' : 'text-amber-600'} />
              <span>{creditos} {creditos === 1 ? 'Dossiê' : 'Dossiês'}</span>
            </Link>
          )}

          {/* Botão Admin */}
          {isAdmin && (
            <Link href="/admin" className="hidden md:flex items-center gap-2 text-sm bg-purple-50 text-purple-700 hover:bg-purple-100 px-3.5 py-2 rounded-xl font-bold transition-all shadow-sm border border-purple-100">
              <ShieldCheck size={16} />
              Admin
            </Link>
          )}

          {/* Botão Minha Conta */}
          <Link href="/conta" className="hidden md:flex items-center gap-2 text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 px-4 py-2 rounded-xl font-bold transition-colors">
            <Settings size={16} />
            Conta
          </Link>

          <button onClick={handleLogout} className="hidden md:block text-sm bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-xl font-bold transition-colors">
            Sair
          </button>

          {/* Botão Hamburger (Mobile) */}
          <button onClick={toggleMobileMenu} className="md:hidden p-2 text-gray-600 hover:text-gray-900 focus:outline-none">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MENU MOBILE EXPANDIDO */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-lg py-4 px-4 flex flex-col gap-4">
            <div className="flex flex-col text-left mb-2 border-b border-gray-100 pb-2">
               <span className="text-xs uppercase tracking-wider font-bold text-slate-400">{isAdmin ? "Administrador" : "Corretor"}</span>
               <strong className="text-sm text-slate-700 truncate">{usuarioEmail}</strong>
            </div>
            
            {creditos !== null && !isAdmin && (
              <Link href="/planos" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-2 text-base font-bold transition-colors ${creditos <= 0 ? 'text-red-600' : 'text-amber-600'}`}>
                <Coins size={18} />
                <span>{creditos} {creditos === 1 ? 'Dossiê Disponível' : 'Dossiês Disponíveis'}</span>
              </Link>
            )}

            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className={`text-base font-semibold transition-colors ${pathname === "/" ? "text-blue-600" : "text-gray-700 hover:text-gray-900"}`}>
              Novo Laudo
            </Link>
            <Link href="/meus-laudos" onClick={() => setIsMobileMenuOpen(false)} className={`text-base font-semibold transition-colors ${pathname === "/meus-laudos" ? "text-blue-600" : "text-gray-700 hover:text-gray-900"}`}>
              Meus Laudos
            </Link>
            
            <div className="w-full h-px bg-gray-100 my-1"></div>

            {isAdmin && (
              <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-2 text-base font-semibold transition-colors ${pathname === "/admin" ? "text-purple-600" : "text-purple-700 hover:text-purple-900"}`}>
                <ShieldCheck size={18} />
                Painel Admin
              </Link>
            )}

            <Link href="/conta" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-2 text-base font-semibold transition-colors ${pathname === "/conta" ? "text-blue-600" : "text-gray-700 hover:text-gray-900"}`}>
              <Settings size={18} />
              Minha Conta
            </Link>

            <button onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }} className="mt-2 text-sm bg-red-50 text-red-600 hover:bg-red-100 w-full py-3 rounded-xl font-bold transition-colors text-center">
              Sair da Conta
            </button>
        </div>
      )}
    </header>
  );
}
