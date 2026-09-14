"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { Users, MessageCircle, MapPin, Calendar, ArrowLeft, Search, Inbox } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MeusLeadsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<any[]>([]);

  useEffect(() => {
    async function carregarLeads() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      // Faz a busca na tabela de leads cruzando com a tabela de laudos para pegar o endereço
      const { data, error } = await supabase
        .from("leads")
        .select(`
          *,
          meus_laudos (
            endereco
          )
        `)
        .order("criado_em", { ascending: false });

      if (data) {
        setLeads(data);
      }
      setLoading(false);
    }
    carregarLeads();
  }, [router]);

  const abrirWhatsAppCliente = (telefone: string, nome: string, endereco: string) => {
    const numeroLimpo = telefone.replace(/\D/g, "");
    const enderecoResumido = endereco ? endereco.split(",")[0] : "sua região";
    
    // Mensagem inteligente pré-programada para o corretor
    const texto = encodeURIComponent(`Olá, ${nome}! Tudo bem? Sou o especialista da região e vi que você se interessou pelo Dossiê Inteligente do imóvel em ${enderecoResumido}. Como posso te ajudar hoje?`);
    
    window.open(`https://wa.me/55${numeroLimpo}?text=${texto}`, "_blank");
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-500">Carregando seus contatos...</div>;
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* CABEÇALHO */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
              <Users className="text-blue-600" size={36} />
              Meus Leads
            </h1>
            <p className="text-slate-500 mt-2">
              Clientes que se interessaram pelos seus dossiês e deixaram contato.
            </p>
          </div>
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-5 py-2.5 rounded-xl transition-all shadow-sm">
            <ArrowLeft size={16} /> Voltar para a Home
          </Link>
        </div>

        {/* ESTADO VAZIO (NENHUM LEAD AINDA) */}
        {leads.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center shadow-sm">
            <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
              <Inbox size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Sua caixa de leads está vazia</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-8">
              Você ainda não captou nenhum cliente. Comece compartilhando os links dos seus Dossiês de Inteligência nas suas redes sociais, campanhas ou grupos de WhatsApp!
            </p>
            <Link href="/meus-laudos" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all">
              Compartilhar meus Dossiês
            </Link>
          </div>
        ) : (
          /* GRID DE CARDS DE LEADS */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leads.map((lead) => {
              const dataCriacao = new Date(lead.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
              const enderecoOrigem = lead.meus_laudos?.endereco || "Dossiê Excluído/Desconhecido";

              return (
                <div key={lead.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full relative overflow-hidden">
                  
                  {/* Etiqueta de "Novo" decorativa (opcional, baseada na data) */}
                  <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden rounded-tr-2xl">
                    <div className="bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-wider text-center py-1 absolute w-24 top-3 -right-6 rotate-45 shadow-sm">
                      Lead
                    </div>
                  </div>

                  <div className="mb-4 pr-8">
                    <h4 className="text-xl font-black text-slate-800 tracking-tight">{lead.nome_cliente}</h4>
                    <p className="text-slate-500 font-medium text-sm mt-1">{lead.telefone_cliente}</p>
                  </div>

                  <div className="space-y-3 mb-8 flex-1">
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                      <MapPin size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                      <span className="leading-tight">
                        <strong className="block text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">Origem do Contato</strong>
                        {enderecoOrigem}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar size={16} className="text-slate-400 flex-shrink-0" />
                      <span>
                        <strong className="block text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">Data da Captação</strong>
                        {dataCriacao}
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => abrirWhatsAppCliente(lead.telefone_cliente, lead.nome_cliente, enderecoOrigem)}
                    className="w-full py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-green-600/20"
                  >
                    <MessageCircle size={18} />
                    Chamar no WhatsApp
                  </button>
                  
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
