"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

  // Estados de Resultado
  const [htmlPreview, setHtmlPreview] = useState("");
  const [pdfData, setPdfData] = useState("");

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
  // 2. LÓGICA DO AUTOCOMPLETE E PDF
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

  const handleGerarPdf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!endereco) return setErro("Digite um endereço.");
    
    setLoading(true); 
    setErro("");
    setMostrarSugestoes(false);
    
    // Inicia a barra
    setProgresso(2);
    setMensagemProgresso("Iniciando varredura geoespacial...");

    // Cronograma rebalanceado: Tempos específicos para cada etapa (em milissegundos)
    // Isso "mascara" o tempo real de 15 a 25s que a IA leva para escrever o copy.
    const etapas = [
      { prog: 12, msg: "Cruzando coordenadas no Mapbox API...", tempo: 1500 },
      { prog: 25, msg: "Mapeando infraestrutura no Google Places...", tempo: 3500 },
      { prog: 38, msg: "Calculando Walk Score e proximidades...", tempo: 5500 },
      { prog: 48, msg: "Consultando topografia, relevo e face solar...", tempo: 7500 },
      { prog: 58, msg: "Analisando vocação turística e lazer...", tempo: 10000 },
      { prog: 68, msg: "Iniciando motor de Inteligência Artificial (Gemini)...", tempo: 13000 },
      { prog: 77, msg: "Redigindo copy imobiliário de alto padrão...", tempo: 17000 },
      { prog: 85, msg: "Revisando gatilhos mentais e persuasão...", tempo: 22000 },
      { prog: 92, msg: "Processando imagens de Satélite e Street View...", tempo: 26000 },
      { prog: 97, msg: "Diagramando Dossiê final em formato PDF...", tempo: 30000 },
    ];

    const timeouts: any[] = [];
    
    // Dispara todas as mensagens nos tempos programados
    etapas.forEach((etapa) => {
      const timeout = setTimeout(() => {
        setProgresso(etapa.prog);
        setMensagemProgresso(etapa.msg);
      }, etapa.tempo);
      timeouts.push(timeout);
    });

    try {
      const resposta = await fetch("https://smartrs.onrender.com/gerar-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endereco }),
      });
      
      if (!resposta.ok) throw new Error("Falha ao gerar relatório.");

      const data = await resposta.json();
      
      // Se o servidor for super rápido e terminar antes, cancelamos as mensagens que faltaram
      timeouts.forEach(clearTimeout);
      
      setProgresso(100);
      setMensagemProgresso("Dossiê gerado com sucesso!");
      
      // Um pequeno delay para o usuário ver o 100% antes da tela mudar
      setTimeout(() => {
        setHtmlPreview(data.html_preview);
        setPdfData(data.pdf_base64);
        setLoading(false);
      }, 800);

    } catch (err: any) {
      timeouts.forEach(clearTimeout);
      setLoading(false);
      setErro(err.message);
    }
  };

  const baixarPdf = () => {
    const linkSource = `data:application/pdf;base64,${pdfData}`;
    const downloadLink = document.createElement("a");
    downloadLink.href = linkSource;
    downloadLink.download = `Laudo_${endereco.substring(0, 15).replace(/\s+/g, '_')}.pdf`;
    downloadLink.click();
  };

  // ==========================================
  // 3. RENDERIZAÇÃO DAS TELAS
  // ==========================================

  // TELA DE ESPERA: Enquanto checa o Supabase
  if (verificandoAuth) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-bold text-slate-500">Autenticando...</div>;
  }

  // TELA DE RESULTADO: Mostra o Dossiê
  if (htmlPreview) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 font-sans">
        <div className="w-full max-w-3xl bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-8 border-b pb-4">
            <h2 className="text-xl font-bold text-slate-800">Preview do Laudo</h2>
            <div className="flex gap-4">
              <button onClick={() => { setHtmlPreview(""); setPdfData(""); setEndereco(""); }} className="text-slate-500 hover:text-slate-800 font-semibold px-4 py-2">
                Novo Endereço
              </button>
              <button onClick={baixarPdf} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all">
                📥 Baixar PDF
              </button>
            </div>
          </div>
          <div dangerouslySetInnerHTML={{ __html: htmlPreview }} />
        </div>
      </div>
    );
  }

  // TELA PRINCIPAL: Busca de Endereço
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-8 font-sans">
      
      {/* CABEÇALHO DO USUÁRIO */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-8 px-4">
        <span className="text-sm font-medium text-slate-500">
          Usuário: <strong className="text-slate-700">{usuarioEmail}</strong>
        </span>
        <button 
          onClick={handleLogout}
          className="text-sm text-red-500 hover:text-red-700 font-semibold transition-colors"
        >
          Sair da conta
        </button>
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
              className="w-full py-4 rounded-xl text-white font-bold text-lg flex justify-center items-center bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Gerar Relatório Profissional
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
