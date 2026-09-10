"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

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
  const [usuarioId, setUsuarioId] = useState(""); // NOVO: Precisamos do ID para o Banco de Dados

  // Estados do Dossiê
  const [endereco, setEndereco] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  
  // Estados do Autocomplete
  const [sugestoes, setSugestoes] = useState<any[]>([]);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);

  // Estados da Barra de Progresso
  const [progresso, setProgresso] = useState(0);
  const [mensagemProgresso, setMensagemProgresso] = useState("");

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
        setUsuarioId(session.user.id || ""); // Guarda o ID para enviar ao back-end
        setVerificandoAuth(false);
      }
    };
    checarSessao();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

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
  // 3. COMANDO DE GERAÇÃO (INTEGRAÇÃO COM NOVO BACK-END)
  // ==========================================
  const handleGerarPdf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!endereco) return setErro("Digite um endereço.");
    
    setLoading(true); 
    setErro("");
    setMostrarSugestoes(false);
    
    // Inicia a barra
    setProgresso(2);
    setMensagemProgresso("Iniciando varredura geoespacial...");

    const etapas = [
      { prog: 15, msg: "Cruzando coordenadas no Mapbox API...", tempo: 1500 },
      { prog: 28, msg: "Mapeando infraestrutura no Google Places...", tempo: 3500 },
      { prog: 40, msg: "Calculando Walk Score e facilidades...", tempo: 5500 },
      { prog: 52, msg: "Consultando topografia, relevo e face solar...", tempo: 7500 },
      { prog: 63, msg: "Analisando Qualidade do Ar (AQI)...", tempo: 9500 },
      { prog: 71, msg: "Mapeando Telhado e Potencial Solar...", tempo: 11500 },
      { prog: 78, msg: "Sincronizando satélites para Tour 3D (Aerial View)...", tempo: 13500 },
      { prog: 85, msg: "Iniciando motor de Inteligência Artificial...", tempo: 16000 },
      { prog: 92, msg: "Redigindo copy imobiliário de alto padrão...", tempo: 20000 },
      { prog: 96, msg: "Revisando gatilhos mentais e montando Laudo...", tempo: 25000 }
    ];

    const timeouts: any[] = [];
    
    etapas.forEach((etapa) => {
      const timeout = setTimeout(() => {
        setProgresso(etapa.prog);
        setMensagemProgresso(etapa.msg);
      }, etapa.tempo);
      timeouts.push(timeout);
    });

    try {
      // ATUALIZAÇÃO 1: A Rota nova do Back-end
      const resposta = await fetch("https://smartrs.onrender.com/laudos/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ATUALIZAÇÃO 2: Enviamos o user_id para o banco de dados saber de quem é
        body: JSON.stringify({ endereco: endereco, user_id: usuarioId }),
      });
      
      if (!resposta.ok) throw new Error("Falha ao gerar o Laudo. Tente novamente.");

      const data = await resposta.json();
      
      timeouts.forEach(clearTimeout);
      setProgresso(100);
      setMensagemProgresso("Dossiê gerado com sucesso! Redirecionando...");
      
      // ATUALIZAÇÃO 3: Redireciona o usuário para o painel de laudos
      setTimeout(() => {
        router.push("/meus-laudos");
      }, 1500);

    } catch (err: any) {
      timeouts.forEach(clearTimeout);
      setLoading(false);
      setErro(err.message);
    }
  };

  // ==========================================
  // 4. RENDERIZAÇÃO DAS TELAS
  // ==========================================

  // TELA DE ESPERA: Enquanto checa o Supabase
  if (verificandoAuth) {
    return <div className="bg-gray-50 flex items-center justify-center font-bold text-slate-500">Autenticando...</div>;
  }

  // TELA PRINCIPAL: Busca de Endereço
  return (
    <div className="bg-gray-50 flex flex-col items-center pt-8 font-sans">
      
      {/* CABEÇALHO DO USUÁRIO */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-8 px-4">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-slate-500">Logado como:</span>
          <strong className="text-slate-800">{usuarioEmail}</strong>
        </div>
        
        <div className="flex gap-4 items-center">
          <Link 
            href="/meus-laudos" 
            className="text-sm bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            📋 Meus Laudos
          </Link>
          <button 
            onClick={handleLogout}
            className="text-sm text-red-500 hover:text-red-700 font-semibold transition-colors"
          >
            Sair
          </button>
        </div>
      </div>

      <div className="w-full max-w-2xl bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-800 mb-3">Dossiê Climático & Valorização</h1>
          <p className="text-slate-500">Gere laudos impressionantes e feche vendas mais rápido.</p>
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
              className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50"
              disabled={loading}
            />
            
            {mostrarSugestoes && sugestoes.length > 0 && (
              <ul className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {sugestoes.map((sugestao) => (
                  <li 
                    key={sugestao.id}
                    onClick={() => handleSelecionarSugestao(sugestao.place_name)}
                    className="p-3 hover:bg-blue-50 cursor-pointer border-b border-slate-100 text-sm text-slate-700 last:border-b-0"
                  >
                    {sugestao.place_name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {erro && <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">{erro}</div>}

          {/* BARRA DE PROGRESSO OU BOTÃO DE AÇÃO */}
          {loading ? (
            <div className="w-full bg-slate-50 p-6 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-slate-600 animate-pulse">{mensagemProgresso}</span>
                <span className="text-sm font-bold text-blue-600">{progresso}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-700 ease-out" 
                  style={{ width: `${progresso}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <button
              type="submit"
              className="w-full py-4 rounded-xl text-white font-bold text-lg flex justify-center items-center bg-blue-600 hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              Gerar Relatório Profissional
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
