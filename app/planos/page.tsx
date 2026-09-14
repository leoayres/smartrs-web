"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { Check, Zap, Crown, ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PlanosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    async function carregarSessao() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push("/login");

      const { data } = await supabase.from("usuarios").select("*").eq("id", session.user.id).single();
      setUsuario(data);
      setLoading(false);
    }
    carregarSessao();
  }, [router]);

  // Função simulada de checkout (Aqui você integrará Stripe, Mercado Pago ou Asaas no futuro)
  const handleAssinar = (nomePlano: string, valor: string) => {
    alert(`Integração de Pagamento: Você selecionou o plano "${nomePlano}" (${valor}). Em breve, redirecionamento automático para o gateway de pagamento (Pix / Cartão).`);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 font-bold text-slate-500">Carregando planos...</div>;
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans py-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* TOPO E VOLTAR */}
        <div className="flex justify-between items-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-4 py-2 rounded-xl transition-all shadow-sm">
            <ArrowLeft size={16} /> Voltar para o Início
          </Link>
          <div className="text-right">
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Seu Plano Atual</span>
            <p className="text-sm font-extrabold text-blue-600 uppercase">{usuario?.plano || "Degustação"} ({usuario?.creditos || 0} créditos)</p>
          </div>
        </div>

        {/* CABEÇALHO DA VITRINE */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold mb-4 border border-blue-100">
            <Sparkles size={14} /> Expanda sua Produtividade Imobiliária
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Escolha o plano ideal para fechar mais negócios
          </h1>
          <p className="text-slate-500 text-base md:text-lg">
            Adquira créditos avulsos para demandas pontuais ou garanta nossa assinatura mensal com recursos avançados.
          </p>
        </div>

        {/* GRID DE PLANOS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          
          {/* PLANO 1: PACOTE AVULSO (PAY AS YOU GO) */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between relative hover:shadow-md transition-shadow">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6 font-bold">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Pacote Corretor</h3>
              <p className="text-slate-500 text-sm mb-6">Ideal para quem prefere comprar créditos sob demanda, sem mensalidade.</p>
              
              <div className="mb-6">
                <span className="text-4xl font-black text-slate-900">R$ 59</span>
                <span className="text-slate-400 text-sm ml-2">/ 5 dossiês</span>
              </div>

              <ul className="space-y-3 text-sm text-slate-600 mb-8">
                <li className="flex items-center gap-3"><Check size={18} className="text-green-500 flex-shrink-0" /> 5 Dossiês de Inteligência</li>
                <li className="flex items-center gap-3"><Check size={18} className="text-green-500 flex-shrink-0" /> Créditos nunca expiram</li>
                <li className="flex items-center gap-3"><Check size={18} className="text-green-500 flex-shrink-0" /> Geração de PDF em alta resolução</li>
                <li className="flex items-center gap-3"><Check size={18} className="text-green-500 flex-shrink-0" /> Suporte via WhatsApp</li>
              </ul>
            </div>

            <button onClick={() => handleAssinar("Pacote Corretor (5 Créditos)", "R$ 59")} className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-md">
              Comprar 5 Créditos
            </button>
          </div>

          {/* PLANO 2: ASSINATURA PRO (DESTAQUE) */}
          <div className="bg-gradient-to-b from-blue-600 to-blue-700 rounded-3xl p-8 border border-blue-500 shadow-xl flex flex-col justify-between relative text-white transform md:-translate-y-2">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
              Mais Popular &bull; Melhor Custo
            </div>

            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center mb-6 font-bold backdrop-blur-sm">
                <Crown size={24} />
              </div>
              <h3 className="text-xl font-black text-white mb-2">Assinatura Pro</h3>
              <p className="text-blue-100 text-sm mb-6">Para corretores focados em alta performance e fechamento constante.</p>
              
              <div className="mb-6">
                <span className="text-4xl font-black text-white">R$ 127</span>
                <span className="text-blue-200 text-sm ml-2">/ mês</span>
              </div>

              <ul className="space-y-3 text-sm text-blue-50 mb-8">
                <li className="flex items-center gap-3"><Check size={18} className="text-amber-300 flex-shrink-0" /> <strong>20 Dossiês</strong> por mês</li>
                <li className="flex items-center gap-3"><Check size={18} className="text-amber-300 flex-shrink-0" /> Prioridade máxima na IA do Gemini</li>
                <li className="flex items-center gap-3"><Check size={18} className="text-amber-300 flex-shrink-0" /> Histórico ilimitado de dossiês</li>
                <li className="flex items-center gap-3"><Check size={18} className="text-amber-300 flex-shrink-0" /> Suporte VIP dedicado</li>
              </ul>
            </div>

            <button onClick={() => handleAssinar("Assinatura Pro (20 laudos/mês)", "R$ 127/mês")} className="w-full py-3.5 bg-white hover:bg-blue-50 text-blue-700 font-black rounded-xl transition-all shadow-lg">
              Assinar Plano Pro
            </button>
          </div>

          {/* PLANO 3: IMOBILIÁRIA / TEAM */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between relative hover:shadow-md transition-shadow">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6 font-bold">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Imobiliária & Equipe</h3>
              <p className="text-slate-500 text-sm mb-6">Perfeito para escritórios e imobiliárias com múltiplos corretores.</p>
              
              <div className="mb-6">
                <span className="text-4xl font-black text-slate-900">R$ 297</span>
                <span className="text-slate-400 text-sm ml-2">/ mês</span>
              </div>

              <ul className="space-y-3 text-sm text-slate-600 mb-8">
                <li className="flex items-center gap-3"><Check size={18} className="text-green-500 flex-shrink-0" /> <strong>60 Dossiês</strong> compartilhados</li>
                <li className="flex items-center gap-3"><Check size={18} className="text-green-500 flex-shrink-0" /> Multi-corretores vinculados</li>
                <li className="flex items-center gap-3"><Check size={18} className="text-green-500 flex-shrink-0" /> White-Label (Logo da imobiliária no PDF)</li>
                <li className="flex items-center gap-3"><Check size={18} className="text-green-500 flex-shrink-0" /> Gestão centralizada pelo Admin</li>
              </ul>
            </div>

            <button onClick={() => handleAssinar("Plano Imobiliária (60 laudos/mês)", "R$ 297/mês")} className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-md">
              Contratar Equipe
            </button>
          </div>

        </div>

        {/* RODAPÉ DE SEGURANÇA */}
        <div className="mt-16 text-center text-xs text-slate-400 font-medium flex items-center justify-center gap-6">
          <span>🔒 Pagamento 100% Seguro via PIX ou Cartão</span>
          <span>⚡ Liberação imediata dos créditos após a confirmação</span>
        </div>

      </div>
    </div>
  );
}
