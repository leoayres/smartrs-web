"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Eye, Clock, MapPin, Download, ExternalLink } from "lucide-react"; // Importando ícones úteis

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
  const [userId, setUserId] = useState<string | null>(null);
  const [baixandoId, setBaixandoId] = useState<string | null>(null);

  const API_URL = "https://smartrs.onrender.com";

  useEffect(() => {
    const checarSessao = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setUserId(session.user.id);
      }
    };
    checarSessao();
  }, [router]);

  useEffect(() => {
    if (!userId) return;
    const buscarLaudos = async () => {
      try {
        const resposta = await fetch(`${API_URL}/laudos/meus/${userId}`);
        if (!resposta.ok) throw new Error("Falha ao buscar os laudos.");
        const data = await resposta.json();
        setLaudos(data.laudos || []);
      } catch (err: any) {
        setErro(err.message);
      } finally {
        setLoading(false);
      }
    };
    buscarLaudos();
  }, [userId]);

  const handleBaixarPdf = async (id: string, endereco: string) => {
    setBaixandoId(id);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-600 animate-pulse font-medium">Carregando sua vitrine de laudos...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl shadow-sm border border-red-100 text-center w-full max-w-md">
          ⚠️ Ocorreu um erro: {erro}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Minha Vitrine de Laudos</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1 md:mt-2">Acompanhe o status dos vídeos 3D e as visualizações dos seus clientes.</p>
        </div>
        
        {laudos.length === 0 ? (
          <div className="bg-white p-8 md:p-12 text-center rounded-2xl shadow-sm border border-gray-200">
            <span className="text-5xl mb-4 block opacity-50">📄</span>
            <h3 className="text-lg md:text-xl font-medium text-gray-700 mb-2">Nenhum laudo encontrado</h3>
            <p className="text-sm md:text-base text-gray-500">Você ainda não gerou nenhum Dossiê de Inteligência.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {laudos.map((laudo) => (
              <div key={laudo.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                
                {/* Header do Card */}
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-start gap-2">
                    <div className="flex items-start gap-2 overflow-hidden">
                        <MapPin className="text-blue-500 shrink-0 mt-1" size={18} />
                        <h3 className="font-semibold text-gray-800 text-sm md:text-base line-clamp-2" title={laudo.endereco}>
                            {laudo.endereco}
                        </h3>
                    </div>
                </div>

                {/* Corpo do Card */}
                <div className="p-4 flex-grow flex flex-col gap-4">
                    <div className="flex items-center justify-between text-xs md:text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                            <Clock size={14} className="text-gray-400" />
                            <span>
                                {new Date(laudo.criado_em).toLocaleDateString('pt-BR', {
                                    day: '2-digit', month: 'short', year: '2-digit'
                                })}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium border border-blue-100">
                            <Eye size={14} />
                            <span>{laudo.visualizacoes}</span>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 text-xs md:text-sm border border-gray-100">
                        <span className="block text-gray-500 mb-1 font-medium text-xs">Status do Tour 3D</span>
                        {laudo.status_video === 'ACTIVE' && (
                            <span className="inline-flex items-center gap-1.5 text-green-700 font-semibold">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span> Disponível
                            </span>
                        )}
                        {laudo.status_video === 'PROCESSING' && (
                            <span className="inline-flex items-center gap-1.5 text-yellow-700 font-semibold" title="Processamento em andamento (2 a 24h)">
                                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span> Em Processamento
                            </span>
                        )}
                        {laudo.status_video === 'UNSUPPORTED' && (
                            <span className="inline-flex items-center gap-1.5 text-gray-500 font-medium">
                                <span className="w-2 h-2 rounded-full bg-gray-400"></span> Indisponível
                            </span>
                        )}
                    </div>
                </div>

                {/* Footer do Card (Ações) */}
                <div className="p-4 border-t border-gray-100 flex items-center justify-between gap-3 bg-white mt-auto">
                    <Link 
                        href={`/laudo/${laudo.id}`} 
                        className="flex-1 flex items-center justify-center gap-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 font-medium text-sm py-2 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                        target="_blank"
                    >
                        <ExternalLink size={16} /> Web
                    </Link>
                    <div className="w-px h-6 bg-gray-200"></div>
                    <button 
                        onClick={() => handleBaixarPdf(laudo.id, laudo.endereco)}
                        disabled={baixandoId === laudo.id}
                        className="flex-1 flex items-center justify-center gap-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm py-2 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                    >
                        <Download size={16} /> 
                        {baixandoId === laudo.id ? "..." : "PDF"}
                    </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
