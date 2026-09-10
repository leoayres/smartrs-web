"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// 1. Inicializa o cliente do Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Tipagem TypeScript garantindo que o front-end saiba o formato dos dados
interface Laudo {
  id: string;
  endereco: string;
  status_video: string;
  visualizacoes: number;
  criado_em: string;
}

export default function MeusLaudos() {
  const router = useRouter();
  
  const [laudos, setLaudos] = useState<Laudo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  
  // Novo estado para guardar o ID do Supabase
  const [userId, setUserId] = useState<string | null>(null);

  // Lembre-se de verificar se essa é sua URL real no Render
  const API_URL = "https://smartrs.onrender.com";

  const [baixandoId, setBaixandoId] = useState<string | null>(null);

  // Adicione esta função logo acima do return()
  const handleBaixarPdf = async (id: string, endereco: string) => {
    setBaixandoId(id); // Muda o botão para "Gerando..."
    try {
      const res = await fetch(`${API_URL}/laudos/${id}/pdf`);
      if (!res.ok) throw new Error("Erro ao gerar PDF.");
      const data = await res.json();
      
      const linkSource = `data:application/pdf;base64,${data.pdf_base64}`;
      const downloadLink = document.createElement("a");
      downloadLink.href = linkSource;
      downloadLink.download = `Dossie_${endereco.substring(0, 15).replace(/\s+/g, '_')}.pdf`;
      downloadLink.click();
    } catch (error) {
      alert("Erro ao baixar o PDF. Tente novamente.");
    } finally {
      setBaixandoId(null);
    }
  };
  // ==========================================
  // ETAPA 1: GUARDA-COSTAS (Verifica quem está logado)
  // ==========================================
  useEffect(() => {
    const checarSessao = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Se não tem sessão, expulsa para o login
        router.push("/login");
      } else {
        // Se tem sessão, salva o ID do corretor
        setUserId(session.user.id);
      }
    };

    checarSessao();
  }, [router]);

  // ==========================================
  // ETAPA 2: BUSCA OS LAUDOS (Só roda quando descobre o userId)
  // ==========================================
  useEffect(() => {
    // Se ainda não temos o ID do usuário, não faz nada
    if (!userId) return;

    const buscarLaudos = async () => {
      try {
        const resposta = await fetch(`${API_URL}/laudos/meus/${userId}`);
        if (!resposta.ok) {
          throw new Error("Falha ao buscar os laudos.");
        }
        const data = await resposta.json();
        setLaudos(data.laudos || []);
      } catch (err: any) {
        setErro(err.message);
      } finally {
        setLoading(false);
      }
    };

    buscarLaudos();
  }, [userId]); // O gatilho desta função é a descoberta do userId


  // ==========================================
  // RENDERIZAÇÃO DA TELA
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-600 animate-pulse">Carregando sua vitrine de laudos...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg shadow-sm border border-red-100">
          ⚠️ Ocorreu um erro: {erro}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Minha Vitrine de Laudos</h1>
          <p className="text-gray-500 mt-2">Acompanhe o status dos vídeos 3D e as visualizações dos seus clientes.</p>
        </div>
        
        {laudos.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-gray-200">
            <span className="text-4xl mb-4 block">📄</span>
            <h3 className="text-xl font-medium text-gray-700 mb-2">Nenhum laudo encontrado</h3>
            <p className="text-gray-500">Você ainda não gerou nenhum Dossiê de Inteligência.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200 text-gray-600 uppercase text-xs tracking-wider">
                  <th className="p-4 font-semibold">Endereço Analisado</th>
                  <th className="p-4 font-semibold">Gerado em</th>
                  <th className="p-4 font-semibold">Visualizações</th>
                  <th className="p-4 font-semibold">Tour 3D</th>
                  <th className="p-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {laudos.map((laudo) => (
                  <tr key={laudo.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 text-gray-800 font-medium">{laudo.endereco}</td>
                    <td className="p-4 text-gray-600">
                      {new Date(laudo.criado_em).toLocaleDateString('pt-BR', {
                        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="p-4">
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-100">
                        👁️ {laudo.visualizacoes} views
                      </span>
                    </td>
                    <td className="p-4">
                      {laudo.status_video === 'ACTIVE' && (
                         <span className="text-green-700 bg-green-50 px-3 py-1 rounded-full text-sm font-medium border border-green-200">✅ Pronto</span>
                      )}
                      {laudo.status_video === 'PROCESSING' && (
                         <span className="text-yellow-700 bg-yellow-50 px-3 py-1 rounded-full text-sm font-medium border border-yellow-200" title="Processamento via satélite em andamento (2 a 24h)">⏳ Em Proc.</span>
                      )}
                      {laudo.status_video === 'UNSUPPORTED' && (
                         <span className="text-gray-500 bg-gray-100 px-3 py-1 rounded-full text-sm font-medium border border-gray-200">Indisponível</span>
                      )}
                    </td>
                    <td className="p-4 text-right flex justify-end gap-3">
                      <Link 
                        href={`/laudo/${laudo.id}`} 
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
                        target="_blank"
                      >
                        🔗 Link Público
                      </Link>
                  <button 
                        onClick={() => handleBaixarPdf(laudo.id, laudo.endereco)}
                    disabled={baixandoId === laudo.id}
                  className="bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white px-3 py-1.5 rounded text-sm font-medium transition">
                  {baixandoId === laudo.id ? "Gerando..." : "Baixar PDF"}
                  </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
