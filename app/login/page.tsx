"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const formatarCPF = (valor: string) => {
  let v = valor.replace(/\D/g, "");
  if (v.length > 11) v = v.substring(0, 11);
  v = v.replace(/(\d{3})(\d)/, "$1.$2");
  v = v.replace(/(\d{3})(\d)/, "$1.$2");
  v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  return v;
};

const formatarWhatsApp = (valor: string) => {
  let v = valor.replace(/\D/g, "");
  if (v.length > 11) v = v.substring(0, 11);
  v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
  v = v.replace(/(\d{4,5})(\d)/, "$1-$2");
  return v;
};

export default function Login() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showResend, setShowResend] = useState(false); 

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [creci, setCreci] = useState("");
  const [foto, setFoto] = useState<File | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });
    setShowResend(false);

    try {
      if (isLogin) {
        // ==========================================
        // LÓGICA DE LOGIN
        // ==========================================
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) {
          setShowResend(true);
          if (error.message.toLowerCase().includes("email not confirmed")) {
            throw new Error("Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada (ou lixeira/spam).");
          } else if (error.message.toLowerCase().includes("invalid login credentials")) {
            throw new Error("Credenciais inválidas. Se você acabou de se cadastrar, não esqueça de confirmar o link enviado para o seu e-mail.");
          } else {
            throw new Error("Erro de acesso. Verifique seus dados e tente novamente.");
          }
        }
        
        if (data.session) {
          try {
            const userId = data.session.user.id;
            const resposta = await fetch(`https://smartrs.onrender.com/laudos/meus/${userId}`);
            if (resposta.ok) {
              const json = await resposta.json();
              if (json.laudos && json.laudos.length > 0) {
                router.push("/meus-laudos");
                return; 
              }
            }
            router.push("/");
          } catch (err) {
            router.push("/");
          }
        }
      } else {
        // ==========================================
        // LÓGICA DE CADASTRO (COM PROTEÇÃO RPC)
        // ==========================================
        if (!nome || !cpf || !whatsapp) throw new Error("Nome, CPF e WhatsApp são obrigatórios.");
        if (cpf.length < 14) throw new Error("CPF inválido.");
        if (whatsapp.length < 14) throw new Error("WhatsApp inválido.");

        // 1. Usa a nossa Função Segura (RPC) no banco para checar o CPF
        const { data: cpfExistente, error: rpcError } = await supabase.rpc('checar_cpf_existente', { cpf_check: cpf });

        if (rpcError) throw new Error("Erro ao validar dados no servidor.");
        if (cpfExistente) throw new Error("Atenção: Este CPF já está cadastrado em outra conta.");

        // 2. Dispara o cadastro
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              nome: nome,
              cpf: cpf,
              whatsapp: whatsapp,
              creci: creci
            }
          }
        });

        if (authError) throw authError;

        setMessage({
          text: "✅ Conta criada com sucesso! Acesse seu e-mail e clique no link de confirmação para liberar o acesso.",
          type: "success",
        });
      }
    } catch (error: any) {
      setMessage({ text: error.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      setMessage({ text: "Digite seu e-mail no campo acima antes de solicitar o reenvio.", type: "error" });
      return;
    }
    setLoading(true);
    setMessage({ text: "Reenviando e-mail...", type: "info" });
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email: email });
      if (error) throw error;
      setMessage({ text: "E-mail reenviado com sucesso! Verifique sua caixa de entrada e Spam.", type: "success" });
      setShowResend(false);
    } catch (err: any) {
      setMessage({ text: "Erro ao reenviar: " + err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 flex flex-col justify-center items-center font-sans min-h-screen py-10 px-4">
      <div className={`w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 ease-in-out ${isLogin ? 'max-w-md' : 'max-w-2xl'}`}>
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            {isLogin ? "Acesse sua conta" : "Crie sua conta"}
          </h2>
          <p className="text-slate-500 mt-2 text-sm md:text-base">
            {isLogin ? "Bem-vindo de volta ao SmartRS" : "Comece a gerar laudos institucionais de alto nível"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          
          <div className={`grid gap-5 ${!isLogin ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">E-mail *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div> 

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Senha *</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required minLength={6} />
            </div>
          </div>

          {!isLogin && (
            <div className="grid gap-5 md:grid-cols-2 pt-4 border-t border-slate-100">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nome Completo / Exibição *</label>
                <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: João da Silva" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required={!isLogin} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">CPF *</label>
                <input type="text" value={cpf} onChange={(e) => setCpf(formatarCPF(e.target.value))} placeholder="000.000.000-00" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required={!isLogin} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">WhatsApp *</label>
                <input type="text" value={whatsapp} onChange={(e) => setWhatsapp(formatarWhatsApp(e.target.value))} placeholder="(00) 00000-0000" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required={!isLogin} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">CRECI <span className="text-slate-400 font-normal">(Opcional)</span></label>
                <input type="text" value={creci} onChange={(e) => setCreci(e.target.value)} placeholder="Ex: 12345-F" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Foto de Perfil <span className="text-slate-400 font-normal">(Opcional)</span></label>
                <input type="file" accept="image/*" onChange={(e) => setFoto(e.target.files ? e.target.files[0] : null)} disabled className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 cursor-not-allowed opacity-60" title="Você poderá adicionar sua foto após confirmar o e-mail." />
                <p className="text-[10px] text-slate-400 mt-1 font-medium">Após ativar sua conta, insira a foto no menu Minha Conta.</p>
              </div>
            </div>
          )}

          {message.text && (
            <div className={`p-4 rounded-lg text-sm font-medium ${message.type === "error" ? "bg-red-50 text-red-700 border border-red-100" : message.type === "info" ? "bg-blue-50 text-blue-700 border border-blue-100" : "bg-green-50 text-green-700 border border-green-100"}`}>
              <p>{message.text}</p>
              {showResend && (
                <button type="button" onClick={handleResendEmail} className="mt-3 inline-block bg-red-100 hover:bg-red-200 text-red-800 font-bold py-1.5 px-3 rounded transition-colors">
                  📨 Reenviar E-mail de Confirmação
                </button>
              )}
            </div>
          )}

          <button type="submit" disabled={loading} className={`w-full py-4 mt-2 rounded-xl text-white font-bold text-lg transition-all shadow-md ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 shadow-blue-200 hover:shadow-blue-300"}`}>
            {loading ? "Processando..." : (isLogin ? "Entrar na Plataforma" : "Criar Minha Conta")}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-600 border-t border-slate-100 pt-6">
          {isLogin ? "Ainda não tem uma conta? " : "Já possui uma conta? "}
          <button onClick={() => { setIsLogin(!isLogin); setMessage({ text: "", type: "" }); setShowResend(false); }} className="text-blue-600 font-extrabold hover:underline ml-1">
            {isLogin ? "Cadastre-se" : "Faça Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
