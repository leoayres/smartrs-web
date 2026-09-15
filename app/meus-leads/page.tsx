"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { 
  Users, MessageCircle, MapPin, Calendar, ArrowLeft, 
  Search, Inbox, LayoutGrid, List, FileText, TrendingUp 
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MeusLeadsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<any[]>([]);
  
  // Dashboard Metrics
  const [totalLaudos, setTotalLaudos] = useState(0);
  
  // Controle de Visualização (cards ou table)
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  useEffect(() => {
    async function carregarDados() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      // 1. Busca os Leads
      const { data: leadsData } = await supabase
        .from("leads")
        .select(`*, meus_laudos (endereco)`)
        .order("criado_em", { ascending: false });

      // 2. Busca a quantidade de Dossiês (para as métricas)
      const { count: laudosCount } = await supabase
        .from("meus_laudos")
        .select("*", { count: 'exact', head: true });

      if (leadsData) {
        setLeads(leadsData);
        // Inteligência: Se tiver mais de 6 leads, muda pra tabela automaticamente
        if (leadsData.length > 6) {
          setViewMode("table");
        }
      }
      
      setTotalLaudos(laudosCount || 0);
      setLoading(false);
    }
    carregarDados();
  }, [router]);

  const abrirWhatsAppCliente = (telefone: string, nome: string, endereco: string) => {
    const numeroLimpo = telefone.replace(/\D/g, "");
    const enderecoResumido = endereco ? endereco.split(",")[0] : "sua região";
    const texto = encodeURIComponent(`Olá, ${nome}! Tudo bem? Sou o especialista da região e vi que você se interessou pelo Dossiê Inteligente do imóvel em ${enderecoResumido}. Como posso te ajudar hoje?`);
    window.open(`https://wa.me/55${numeroLimpo}?text=${texto}`, "_blank");
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-500">Carregando seu CRM...</div>;
  }

  // Cálculos das Métricas
  const mediaLeadsPorDossie = totalLaudos > 0 ? (leads.length / totalLaudos).toFixed(1) : "0";

  return (
    <div className="bg-slate-50 min-h-screen font-sans py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* CABEÇALHO */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
              <Users className="text-blue-600" size={36} />
              Meus Leads
            </h1>
            <p className="text-slate-500 mt-2">
              Gerencie os clientes que se interessaram pelos seus dossiês.
            </p>
          </div>
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-5 py-2.5 rounded-xl transition-all shadow-sm">
            <ArrowLeft size={16} /> Voltar para a Home
          </Link>
        </div>

        {/* BARRA DE MÉTRICAS (DASHBOARD) */}
        {leads.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><Users size={24} /></div>
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total de Leads</p>
                <p className="text-2xl font-black text-slate-800">{leads.length}</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center"><FileText size={24} /></div>
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Dossiês Ativos</p>
                <p className="text-2xl font-black text-slate-800">{totalLaudos}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><TrendingUp size={24} /></div>
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Média / Dossiê</p>
                <p className="text-2xl font-black text-slate-800">{mediaLeadsPorDossie} <span className="text-sm font-medium text-slate-500 lowercase">leads</span></p>
              </div>
            </div>
          </div>
        )}

        {/* CONTROLES E ESTADO VAZIO */}
        {leads.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center shadow-sm mt-10">
            <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
              <Inbox size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Sua caixa de leads está vazia</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-8">
              Você ainda não captou nenhum cliente. Compartilhe seus Dossiês de Inteligência para começar a receber contatos!
            </p>
            <Link href="/meus-laudos" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all">
              Ver meus Dossiês
            </Link>
          </div>
        ) : (
          <>
            {/* TOGGLE DE VISUALIZAÇÃO */}
            <div className="flex justify-end mb-6">
              <div className="bg-white border border-slate-200 p-1 rounded-lg inline-flex shadow-sm">
                <button 
                  onClick={() => setViewMode("cards")}
                  className={`px-4 py-2 rounded-md flex items-center gap-2 text-sm font-bold transition-all ${viewMode === "cards" ? "bg-slate-100 text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <LayoutGrid size={18} /> Cards
                </button>
                <button 
                  onClick={() => setViewMode("table")}
                  className={`px-4 py-2 rounded-md flex items-center gap-2 text-sm font-bold transition-all ${viewMode === "table" ? "bg-slate-100 text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <List size={18} /> Tabela
                </button>
              </div>
            </div>

            {/* RENDERIZAÇÃO: CARDS */}
            {viewMode === "cards" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {leads.map((lead) => {
                  const dataCriacao = new Date(lead.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
                  const enderecoOrigem = lead.meus_laudos?.endereco || "Dossiê Excluído";

                  return (
                    <div key={lead.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden rounded-tr-2xl">
                        <div className="bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-wider text-center py-1 absolute w-24 top-3 -right-6 rotate-45 shadow-sm">Lead</div>
                      </div>
                      <div className="mb-4 pr-8">
                        <h4 className="text-xl font-black text-slate-800 tracking-tight">{lead.nome_cliente}</h4>
                        <p className="text-slate-500 font-medium text-sm mt-1">{lead.telefone_cliente}</p>
                      </div>
                      <div className="space-y-3 mb-8 flex-1">
                        <div className="flex items-start gap-2 text-sm text-slate-600">
                          <MapPin size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                          <span className="leading-tight">
                            <strong className="block text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">Origem</strong>
                            {enderecoOrigem}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar size={16} className="text-slate-400 flex-shrink-0" />
                          <span>
                            <strong className="block text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">Data</strong>
                            {dataCriacao}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => abrirWhatsAppCliente(lead.telefone_cliente, lead.nome_cliente, enderecoOrigem)}
                        className="w-full py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
                      >
                        <MessageCircle size={18} /> Chamar
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* RENDERIZAÇÃO: TABELA (CRM) */}
            {viewMode === "table" && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                        <th className="p-4 pl-6">Cliente</th>
                        <th className="p-4">Dossiê de Origem</th>
                        <th className="p-4">Data da Captação</th>
                        <th className="p-4 pr-6 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {leads.map((lead) => {
                        const dataCriacao = new Date(lead.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
                        const enderecoOrigem = lead.meus_laudos?.endereco || "Dossiê Excluído";
                        
                        return (
                          <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 pl-6">
                              <div className="font-bold text-slate-800">{lead.nome_cliente}</div>
                              <div className="text-sm text-slate-500">{lead.telefone_cliente}</div>
                            </td>
                            <td className="p-4 text-sm text-slate-600 max-w-xs truncate">
                              <span title={enderecoOrigem}>{enderecoOrigem}</span>
                            </td>
                            <td className="p-4 text-sm text-slate-500 whitespace-nowrap">
                              {dataCriacao}
                            </td>
                            <td className="p-4 pr-6 text-right">
                              <button 
                                onClick={() => abrirWhatsAppCliente(lead.telefone_cliente, lead.nome_cliente, enderecoOrigem)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-bold rounded-lg transition-all shadow-sm"
                              >
                                <MessageCircle size={16} /> Contatar
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
