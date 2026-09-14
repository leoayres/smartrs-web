"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link"; // Adicionado para a navegação do cabeçalho

// Importando nosso novo e poderoso componente centralizado!
import LoadingSteps from "./components/LoadingSteps";

// Inicializa o cliente do Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const router = useRouter();
  
  // Estados de Autenticação
  const [verificandoAuth, setVerificandoAuth] = useState(true);
  const [usuarioEmail, setUsuarioEmail] = useState("");
  const [usuarioId, setUsuarioId] = useState(""); 

  // Estados do Dossiê
  const [endereco, setEndereco] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  
  // Estados do Autocomplete
  const [sugestoes, setSugestoes] = useState<any[]>([]);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);

  // ==========================================
  // 1. GUARDA-COSTAS (Verifica se está logado)
  // ==========================================
  useEffect(() => {
    const checarSessao = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setUsuarioEmail(session.user.email || "");
        setUsuarioId(session.user.id || "");
        setVerificandoAuth(false);
      }
    };
    checarSessao();
  }, [router]);

  // ==========================================
  // 2. LÓGICA DO AUTOCOMPLETE
  // ==========================================
  useEffect(() => {
    if (endereco.length < 4) {
      setSugestoes([]);
      return;
    }
    const buscarSugestoes = async () => {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!token) return;
      try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(endereco)}.json?access_token=${token}&country=br&language=pt&limit=5`;
        const res = await fetch(url);
        const data = await res.json();
        setSugestoes(data.features || []);
      } catch (err) {
        console.error("Erro ao buscar sugestões", err);
      }
    };

    const delayDebounceFn = setTimeout(() => { buscarSugestoes(); }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [endereco]);

  const handleSelecionarSugestao = (enderecoCompleto: string) => {
    setEndereco(enderecoCompleto);
    setSugestoes([]);
    setMostrarSugestoes(false);
  };

  // ==========================================
  // 3. COMANDO DE GERAÇÃO
  // ==========================================
  const handleGerarPdf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!endereco) return setErro("Digite um endereço.");
    
    setLoading(true); 
    setErro("");
    setMostrarSugestoes(false);
    
    try {
      const resposta = await fetch("https://smartrs.onrender.com/laudos/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endereco: endereco, user_id: usuarioId }),
      });
      
      if (!resposta.ok) throw new Error("Falha ao gerar o Laudo. Tente novamente.");

      // Se deu tudo certo, redireciona para a vitrine
      router.push("/meus-laudos");

    } catch (err: any) {
      setLoading(false);
      setErro(err.message);
    }
  };

  // ==========================================
  // 4. RENDERIZAÇÃO DAS TELAS
  // ==========================================

  if (verificandoAuth) {
    return <div className="bg-gray-50 flex items-center justify-center font-bold text-slate-500 min-h-screen">Autenticando...</div>;
  }

  // TELA DE LOADING DA GERAÇÃO (Usando o Componente Centralizado)
  if (loading) {
    return (
      <div className="bg-gray-50 flex flex-col items-center justify-center min-h-screen font-sans p-4">
        <div className="w-full max-w-2xl bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden">
          <LoadingSteps 
            titulo="Gerando Dossiê de Inteligência..." 
            subtitulo="Nossa Inteligência Artificial está vasculhando bancos de dados imobiliários, climáticos e geoespaciais em tempo real." 
            variant="list" 
          />
        </div>
      </div>
    );
  }

  // TELA PRINCIPAL: Busca de Endereço
  return (
    <div className="bg-gray-50 flex flex-col items-center pt-8 md:pt-16 min-h-screen font-sans p-4 relative">
      
      {/* MENU SUPERIOR DIREITO */}
      <div className="absolute top-6 right-6 flex items-center gap-4">
        <div className="text-right hidden md:block">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Usuário Logado</div>
          <div className="text-sm font-semibold text-slate-700">{usuarioEmail}</div>
        </div>
        
        <Link 
          href="/conta" 
          className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-2 px-4 rounded-lg text-sm font-bold transition-all shadow-sm"
        >
          ⚙️ Minha Conta
        </Link>

        <button 
          onClick={async () => {
            await supabase.auth.signOut();
            router.push("/login");
          }}
          className="border border-red-200 text-red-600 hover:bg-red-50 p-2 px-4 rounded-lg text-sm font-bold transition-colors"
        >
          Sair
        </button>
      </div>

      <div className="w-full max-w-2xl bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100 mt-12 md:mt-0">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-3 tracking-tight">Dossiê de Inteligência Imobiliária</h1>
          <p className="text-slate-500 text-sm md:text-base">Transforme endereços em dossiês auditáveis com precificação em tempo real, cálculo de Yield e análise urbana inteligente.</p>
        </div>

        <form onSubmit={handleGerarPdf} className="space-y-6">
          <div className="relative">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Endereço do Imóvel</label>
            <input
              type="text"
              value={endereco}
              onChange={(e) => {
                setEndereco(e.target.value);
                setMostrarSugestoes(true);
              }}
              placeholder="Ex: Av. Beira Mar, 100, Fortaleza"
              className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
            />
            
            {mostrarSugestoes && sugestoes.length > 0 && (
              <ul className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                {sugestoes.map((sugestao) => (
                  <li 
                    key={sugestao.id}
                    onClick={() => handleSelecionarSugestao(sugestao.place_name)}
                    className="p-4 hover:bg-blue-50 cursor-pointer border-b border-slate-100 text-sm text-slate-700 font-medium last:border-b-0 transition-colors"
                  >
                    {sugestao.place_name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {erro && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
              ⚠️ {erro}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 rounded-xl text-white font-bold text-lg flex justify-center items-center bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5"
          >
            Gerar Dossiê de Inteligência
          </button>
        </form>
      </div>
    </div>
  );
}
