"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { MessageCircle, Phone, User, Send, CheckCircle } from "lucide-react";

// Cliente Supabase apenas para INSERIR o lead na tabela de captação
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const formatarWhatsApp = (valor: string) => {
  let v = valor.replace(/\D/g, "");
  if (v.length > 11) v = v.substring(0, 11);
  v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
  v = v.replace(/(\d{4,5})(\d)/, "$1-$2");
  return v;
};

export default function LaudoClient() {
  const params = useParams();
  const laudoId = params.id as string;

  // Guarda todos os dados da API (html, views, corretor, endereço)
  const [dossie, setDossie] = useState<any>(null);
  const [erro, setErro] = useState("");

  // Estados do Formulário de Lead
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [enviandoLead, setEnviandoLead] = useState(false);
  const [leadSucesso, setLeadSucesso] = useState(false);

  useEffect(() => {
    // Trava de segurança: só faz o fetch se o laudoId existir
    if (!laudoId) return;

    const fetchLaudo = async () => {
      try {
        const res = await fetch(`https://smartrs.onrender.com/laudos/virtual/${laudoId}`);
        if (!res.ok) throw new Error("Laudo não encontrado ou indisponível.");
        
        const data = await res.json();
        setDossie(data); // Salva o pacote completo vindo do Python
      } catch (e: any) {
        setErro(e.message);
      }
    };

    fetchLaudo();
  }, [laudoId]);

  // ==========================================
  // FUNÇÕES DE CAPTAÇÃO DE LEADS
  // ==========================================
  const handleEnviarLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || telefone.length < 14) return;
    setEnviandoLead(true);

    try {
      const { error } = await supabase.from("leads").insert({
        laudo_id: laudoId,
        corretor_id: dossie.user_id,
        nome_cliente: nome,
        telefone_cliente: telefone,
      });

      if (error) throw error;
      setLeadSucesso(true);

      // NOVO: Dispara a notificação de e-mail em background sem travar a UI
      fetch("/api/notificar-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          laudoId,
          corretorId: dossie.user_id,
          nomeCliente: nome,
          telefoneCliente: telefone,
        }),
      }).catch((err) => console.error("Falha silenciosa ao notificar por email:", err));

    } catch (err) {
      alert("Houve um problema ao enviar o contato. Tente clicando no botão do WhatsApp!");
    } finally {
      setEnviandoLead(false);
    }
  };

  const abrirWhatsAppCorretor = () => {
    const numeroLimpo = dossie?.corretor?.whatsapp?.replace(/\D/g, "");
    if (!numeroLimpo) return alert("WhatsApp do corretor indisponível.");
    const texto = encodeURIComponent(`Olá, ${dossie.corretor.nome}! Vi o Dossiê de Inteligência do endereço (${dossie.endereco}) e gostaria de mais informações.`);
    window.open(`https://wa.me/55${numeroLimpo}?text=${texto}`, "_blank");
  };

  // ==========================================
  // RENDERIZAÇÃO DE STATUS
  // ==========================================
  if (erro) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 text-red-600 p-8 rounded-xl font-bold border border-red-100 shadow-sm text-center">
          ⚠️ {erro}
        </div>
      </div>
    );
  }

  if (!dossie) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-blue-600 animate-pulse font-medium">Carregando Dossiê Digital...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 flex flex-col items-center py-12 font-sans pb-24 px-4">
      
      {/* 1. O DOSSIÊ PRINCIPAL */}
      <div className="w-full max-w-4xl bg-white p-8 md:p-14 rounded-2xl shadow-lg border border-gray-100 relative">
        <div className="absolute top-6 right-6 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold border border-blue-100 shadow-sm flex items-center gap-2">
          👁️ {dossie.estatisticas.visualizacoes} {dossie.estatisticas.visualizacoes === 1 ? "visualização" : "visualizações"}
        </div>

        <div dangerouslySetInnerHTML={{ __html: dossie.html_completo }} />
      </div>

      {/* 2. MÁQUINA DE VENDAS (CAPTAÇÃO DE LEADS) */}
      {dossie.corretor && Object.keys(dossie.corretor).length > 0 && (
        <div className="w-full max-w-4xl mt-10">
          <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-200 overflow-hidden">
            
            {/* Banner Superior - BLINDADO CONTRA CSS GLOBAL */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-8 text-center relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-500"></div>
              
              <h3 className="text-2xl font-black tracking-tight mb-2 !text-white">
                Tem interesse nesta região?
              </h3>
              
              <div className="!text-white font-medium text-sm opacity-90">
                Fale com o especialista responsável por este mapeamento.
              </div>
            </div>

            <div className="p-8 md:p-10 flex flex-col md:flex-row gap-10">
              
              {/* LADO ESQUERDO: Perfil do Corretor & Botão Direto */}
              <div className="flex-1 flex flex-col items-center justify-center text-center md:border-r md:border-slate-100 md:pr-10">
                <div className="w-24 h-24 rounded-full border-4 border-slate-100 shadow-md overflow-hidden bg-slate-200 mb-4 flex items-center justify-center">
                  {dossie.corretor.avatar_url ? (
                    <img src={dossie.corretor.avatar_url} alt="Corretor" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-slate-400" />
                  )}
                </div>
                <h4 className="text-lg font-bold text-slate-800">{dossie.corretor.nome || "Corretor Parceiro"}</h4>
                {dossie.corretor.creci && (
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 mt-1 block">CRECI: {dossie.corretor.creci}</span>
                )}

                <button 
                  onClick={abrirWhatsAppCorretor}
                  className="w-full py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-600/20"
                >
                  <MessageCircle size={20} />
                  Falar no WhatsApp
                </button>
              </div>

              {/* LADO DIREITO: Formulário de Captação Passiva */}
              <div className="flex-1 flex flex-col justify-center">
                {leadSucesso ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-green-50 rounded-2xl border border-green-100">
                    <CheckCircle size={48} className="text-green-500 mb-4" />
                    <h4 className="text-lg font-bold text-green-800 mb-2">Contato Enviado!</h4>
                    <div className="text-sm text-green-700">O corretor foi notificado e entrará em contato em breve.</div>
                  </div>
                ) : (
                  <form onSubmit={handleEnviarLead} className="flex flex-col h-full justify-center">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="h-px bg-slate-200 flex-1"></div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ou deixe seu contato</span>
                      <div className="h-px bg-slate-200 flex-1"></div>
                    </div>

                    <div className="space-y-4">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><User size={18} /></div>
                        <input 
                          type="text" required placeholder="Seu Nome"
                          value={nome} onChange={(e) => setNome(e.target.value)}
                          className="w-full pl-11 p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 hover:bg-white transition-colors text-slate-800"
                        />
                      </div>
                      
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><Phone size={18} /></div>
                        <input 
                          type="tel" required placeholder="(00) 00000-0000"
                          value={telefone} onChange={(e) => setTelefone(formatarWhatsApp(e.target.value))}
                          className="w-full pl-11 p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 hover:bg-white transition-colors text-slate-800"
                        />
                      </div>
                      
                      <button 
                        type="submit" disabled={enviandoLead}
                        className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
                      >
                        {enviandoLead ? "Enviando..." : <><Send size={18} /> Solicitar Contato</>}
                      </button>
                    </div>
                    <div className="text-[10px] text-slate-400 text-center mt-4">
                      Seus dados estão seguros e serão enviados diretamente ao corretor responsável.
                    </div>
                  </form>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
