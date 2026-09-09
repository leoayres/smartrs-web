"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// Inicializa o Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  
  const router = useRouter();
  const [verificandoAuth, setVerificandoAuth] = useState(true);

  // O Guarda-Costas: Verifica se o usuário está logado
  useEffect(() => {
    const checarSessao = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login"); // Chuta para o login se não tiver conta
      } else {
        setVerificandoAuth(false); // Libera o acesso
      }
    };
    checarSessao();
  }, [router]);

  // Restante dos seus estados (endereco, loading, erro, etc)...
  const [endereco, setEndereco] = useState("");
  
  // Novos estados para o Autocomplete
  const [sugestoes, setSugestoes] = useState<any[]>([]);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);

  const [htmlPreview, setHtmlPreview] = useState("");
  const [pdfData, setPdfData] = useState("");

  // Efeito de Debounce: Busca sugestões no Mapbox enquanto o usuário digita
  useEffect(() => {
    if (endereco.length < 4) {
      setSugestoes([]);
      return;
    }

    const buscarSugestoes = async () => {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!token) return;

      try {
        // Restringimos a busca ao Brasil (country=br) para maior precisão
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(endereco)}.json?access_token=${token}&country=br&language=pt&limit=5`;
        const res = await fetch(url);
        const data = await res.json();
        setSugestoes(data.features || []);
      } catch (err) {
        console.error("Erro ao buscar sugestões", err);
      }
    };

    // Aguarda 500ms após o usuário parar de digitar para chamar a API (economiza requisições)
    const delayDebounceFn = setTimeout(() => {
      buscarSugestoes();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [endereco]);

  // Quando o usuário clica em uma sugestão da lista
  const handleSelecionarSugestao = (enderecoCompleto: string) => {
    setEndereco(enderecoCompleto);
    setSugestoes([]);
    setMostrarSugestoes(false);
  };

  const handleGerarPdf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!endereco) return setErro("Digite um endereço.");
    
    setLoading(true); setErro("");
    setMostrarSugestoes(false);
    
    try {
      const resposta = await fetch("https://smartrs.onrender.com/gerar-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endereco }),
      });

      if (!resposta.ok) throw new Error("Falha ao gerar relatório.");

      const data = await resposta.json();
      setHtmlPreview(data.html_preview);
      setPdfData(data.pdf_base64);
      
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  const baixarPdf = () => {
    const linkSource = `data:application/pdf;base64,${pdfData}`;
    const downloadLink = document.createElement("a");
    downloadLink.href = linkSource;
    downloadLink.download = `Laudo_${endereco.substring(0, 15).replace(/\s+/g, '_')}.pdf`;
    downloadLink.click();
  };

  const voltar = () => {
    setHtmlPreview("");
    setPdfData("");
    setEndereco("");
  };

  // TELA 2: MODO RESULTADO
  if (htmlPreview) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 font-sans">
        <div className="w-full max-w-3xl bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-8 border-b pb-4">
            <h2 className="text-xl font-bold text-slate-800">Preview do Laudo</h2>
            <div className="flex gap-4">
              <button onClick={voltar} className="text-slate-500 hover:text-slate-800 font-semibold px-4 py-2">
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

  // TELA DE ESPERA ENQUANTO VERIFICA O LOGIN
  if (verificandoAuth) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-bold text-slate-500">Autenticando...</div>;
  }

  // TELA 1: MODO BUSCA
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-20 font-sans">
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
              className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
            
            {/* Dropdown de Sugestões de Endereço */}
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

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl text-white font-bold text-lg flex justify-center items-center ${
              loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Mapeando região e redigindo laudo..." : "Gerar Relatório Profissional"}
          </button>
        </form>
      </div>
    </div>
  );
}
