"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Eye, Clock, MapPin, Download, ExternalLink, RefreshCw, Archive, CheckCircle } from "lucide-react";

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
  status?: string; // Novo campo para identificar Ativo/Arquivado
}

export default function MeusLaudos() {
  const router = useRouter();
  const [laudos, setLaudos] = useState<Laudo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [baixandoId, setBaixandoId] = useState<string | null>(null);

  // Estados do Modal de Atualização
  const [modalOpen, setModalOpen] = useState(false);
  const [laudoSelecionado, setLaudoSelecionado] = useState<string | null>(null);
  const [atualizando, setAtualizando] = useState(false);

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

  // 1. CARREGA A LISTA DO BANCO DE DADOS
  const buscarLaudos = useCallback(async (isInitial = false) => {
    if (!userId) return;
    if (isInitial) setLoading(true);
    try {
      const resposta = await fetch(`${API_URL}/laudos/meus/${userId}`);
      if (!resposta.ok) throw new Error("Falha ao buscar os laudos.");
      const data = await resposta.json();
      setLaudos(data.laudos || []);
    } catch (err: any) {
      setErro(err.message);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    buscarLaudos(true);
  }, [buscarLaudos]);

  // 2. MÁGICA: BACKGROUND POLLING PARA AUTO-CURA
  useEffect(() => {
    const checarStatusPendentes = () => {
      const pendentes = laudos.filter(l => l.status_video === 'PROCESSING');
      
      pendentes.forEach(async (laudo) => {
        try {
          const res = await fetch(`${API_URL}/laudos/${laudo.id}/status`);
          if (res.ok) {
            const data = await res.json();
            if (data.status_video !== 'PROCESSING') {
              setLaudos(prevLaudos => 
                prevLaudos.map(l => l.id === laudo.id ? { ...l, status_video: data.status_video } : l)
              );
            }
          }
        } catch (err) {
          console.error("Erro na verificação silenciosa:", err);
        }
      });
    };

    if (laudos.length > 0) {
      checarStatusPendentes();
    }
  }, [laudos.length]);

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

  // =========================================================================
  // FUNÇÕES DO NOVO RECURSO DE ATUALIZAÇÃO E ARQUIVAMENTO
  // =========================================================================
  const abrirModalAtualizacao = (id: string) => {
    setLaudoSelecionado(id);
    setModalOpen(true);
  };

  const confirmarAtualizacao = async (manterLink: boolean) => {
    if (!laudoSelecionado) return;
    setAtualizando(true);
    
    try {
      const res = await fetch(`${API_URL}/laudos/${laudoSelecionado}/atualizar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manter_link: manterLink })
      });
      
      if (!res.ok) throw new Error("Erro ao atualizar laudo");
      
      // Atualiza a tabela silenciosamente por trás
      await buscarLaudos(false);
      
    } catch (err) {
      alert("Ocorreu um erro ao tentar atualizar o dossiê. Tente novamente.");
    } finally {
      setAtualizando(false);
      setModalOpen(false);
      setLaudoSelecionado(null);
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
          <p className="text-sm md:text-base text-gray-500 mt-1 md:mt-2">Acompanhe o status da renderização 3D, gere relatórios e atualize dossiês existentes.</p>
        </div>
        
        {laudos.length === 0 ? (
          <div className="bg-white p-8 md:p-12 text-center rounded-2xl shadow-sm border border-gray-200">
            <span className="text-5xl mb-4 block opacity-50">📄</span>
            <h3 className="text-lg md:text-xl font-medium text-gray-700 mb-2">Nenhum laudo encontrado</h3>
            <p className="text-sm md:text-base text-gray-500">Você ainda não gerou nenhum Dossiê de Inteligência.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {laudos.map((laudo) => {
              const isArquivado = laudo.status === 'Arquivado';
              
              return (
                <div key={laudo.id} className={`bg-white rounded-xl shadow-sm border ${isArquivado ? 'border-yellow-200 opacity-80' : 'border-gray-200'} overflow-hidden hover:shadow-md transition-all flex flex-col`}>
                  
                  {/* Header do Card */}
                  <div className={`p-4 border-b ${isArquivado ? 'bg-yellow-50/50 border-yellow-100' : 'bg-gray-50 border-gray-100'} flex justify-between items-start gap-2`}>
                      <div className="flex items-start gap-2 overflow-hidden">
                          <MapPin className={`${isArquivado ? 'text-yellow-600' : 'text-blue-500'} shrink-0 mt-1`} size={18} />
                          <h3 className={`font-semibold text-sm md:text-base line-clamp-2 ${isArquivado ? 'text-yellow-900' : 'text-gray-800'}`} title={laudo.endereco}>
                              {laudo.endereco}
                          </h3>
                      </div>
                      
                      {/* Distintivo de Arquivado ou Botão de Atualizar */}
                      {isArquivado ? (
                        <span className="shrink-0 bg-yellow-100 text-yellow-800 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded border border-yellow-200 flex items-center gap-1" title="Este dossiê está obsoleto">
                          <Archive size={12} /> Arquivado
                        </span>
                      ) : (
                        <button 
                          onClick={() => abrirModalAtualizacao(laudo.id)}
                          className="shrink-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors p-1.5 rounded-md"
                          title="Gerar versão atualizada (Inteligência Artificial)"
                        >
                          <RefreshCw size={18} />
                        </button>
                      )}
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

                      <div className={`rounded-lg p-3 text-xs md:text-sm border ${isArquivado ? 'bg-yellow-50/30 border-yellow-100' : 'bg-gray-50 border-gray-100'}`}>
                          <span className="block text-gray-500 mb-1 font-medium text-[10px] uppercase tracking-wider">Motor 3D</span>
                          
                          {laudo.status_video === 'ACTIVE' && (
                              <span className="inline-flex items-center gap-1.5 text-green-700 font-semibold">
                                  <span className="w-2 h-2 rounded-full bg-green-500"></span> Vídeo Cinematográfico
                              </span>
                          )}
                          
                          {laudo.status_video === 'PROCESSING' && (
                              <span className="inline-flex items-center gap-1.5 text-yellow-700 font-semibold" title="O Google está renderizando o vídeo">
                                  <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span> Renderizando Vídeo...
                              </span>
                          )}
                          
                          {laudo.status_video === 'UNSUPPORTED' && (
                              <span className="inline-flex items-center gap-1.5 text-indigo-700 font-semibold" title="Motor interativo ativado para esta região">
                                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Tour Interativo
                              </span>
                          )}
                      </div>
                  </div>

                  {/* Footer do Card */}
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
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL DE ATUALIZAÇÃO E ARQUIVAMENTO */}
      {/* ========================================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 md:p-8 relative overflow-hidden">
            
            {atualizando ? (
              <div className="text-center py-12">
                <RefreshCw className="animate-spin text-blue-600 mx-auto mb-6" size={48} />
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">Reescrevendo Dossiê...</h3>
                <p className="text-gray-500 text-sm md:text-base leading-relaxed">
                  A Inteligência Artificial está reprocessando os dados geoespaciais e de mercado atualizados da região.<br/>
                  <strong className="text-gray-700 block mt-2">Isso pode levar de 10 a 15 segundos.</strong>
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Atualizar Dossiê de Inteligência</h2>
                <p className="text-gray-600 text-sm md:text-base mb-8">
                  Você está prestes a gerar uma versão atualizada deste estudo. Como você deseja gerenciar os links de compartilhamento?
                </p>

                <div className="space-y-4">
                  {/* Opção 1: Manter Link Atual */}
                  <button 
                    onClick={() => confirmarAtualizacao(true)} 
                    className="w-full text-left p-5 border-2 border-blue-200 bg-blue-50/50 hover:bg-blue-100/50 rounded-xl transition-all hover:border-blue-400 group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5">
                        <CheckCircle className="text-blue-600 group-hover:scale-110 transition-transform" size={24} />
                      </div>
                      <div>
                        <span className="block font-bold text-blue-900 text-base mb-1">Manter o link de compartilhamento atual</span>
                        <span className="block text-sm text-blue-800/80 leading-relaxed">
                          Recomendado. Quem acessar o link antigo verá a versão nova imediatamente. A versão velha será salva no seu histórico como "Arquivada".
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* Opção 2: Gerar Novo Link */}
                  <button 
                    onClick={() => confirmarAtualizacao(false)} 
                    className="w-full text-left p-5 border-2 border-gray-200 bg-white hover:bg-gray-50 rounded-xl transition-all hover:border-gray-300 group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5">
                        <ExternalLink className="text-gray-500 group-hover:scale-110 transition-transform" size={24} />
                      </div>
                      <div>
                        <span className="block font-bold text-gray-800 text-base mb-1">Gerar um novo link separado</span>
                        <span className="block text-sm text-gray-500 leading-relaxed">
                          O dossiê antigo receberá uma marca d'água alertando os clientes de que o arquivo está desatualizado, obrigando-os a pedir a versão nova a você.
                        </span>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
                  <button 
                    onClick={() => { setModalOpen(false); setLaudoSelecionado(null); }} 
                    className="px-5 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
