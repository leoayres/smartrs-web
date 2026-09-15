import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";

export default function SucessoPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full text-center border border-slate-100 transform transition-all">
        
        <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-green-100">
          <CheckCircle size={48} strokeWidth={2.5} />
        </div>
        
        <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">
          Pagamento Aprovado!
        </h1>
        
        <p className="text-slate-500 text-base mb-10 leading-relaxed">
          Tudo certo! Seus novos créditos já estão liberados na sua conta. Você já pode gerar laudos com Inteligência Artificial.
        </p>
        
        <Link 
          href="/" 
          className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-md flex justify-center items-center gap-2 group"
        >
          Voltar para o Painel 
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </Link>
        
      </div>
    </div>
  );
}
