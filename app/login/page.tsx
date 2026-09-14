"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Funções de Máscara
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

  // Campos do Formulário
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

    try {
      if (isLogin) {
        // ==========================================
        // LÓGICA DE LOGIN
        // ==========================================
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
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
        // LÓGICA DE CADASTRO
        // ==========================================
        // 1. Validações Locais
        if (!nome || !cpf || !whatsapp) throw new Error("Nome, CPF e WhatsApp são obrigatórios.");
        if (cpf.length < 14) throw new Error("CPF inválido.");
        if (whatsapp.length < 14) throw new Error("WhatsApp inválido.");

        // 2. Checagem de CPF Duplicado ANTES de criar a conta
        const { data: cpfExistente } = await supabase
          .from("usuarios")
          .select("id")
          .eq("cpf", cpf)
          .maybeSingle();

        if (cpfExistente) {
          throw new Error("Este CPF já está vinculado a outra conta no sistema.");
        }

        // 3. Cria a conta no Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (authError) throw authError;

        // 4. Salva os dados na tabela e faz upload da foto (se a sessão existir / auto-login ativado)
        if (authData.user && authData.session) {
          const userId = authData.user.id;
          let avatarUrl = "";

          // Upload da Foto
          if (foto) {
            const fileExt = foto.name.split('.').pop();
            const filePath = `${userId}-${Math.random()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, foto);
            if (!uploadError) {
              const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
              avatarUrl = urlData.publicUrl;
            }
          }

          // Injeta no Banco
          await supabase.from("usuarios").upsert({
            id: userId,
            nome,
            cpf,
            whatsapp,
            creci,
            avatar_url: avatarUrl,
            updated_at: new Date(),
          });
          
          router.push("/"); // Cadastro feito com sucesso, vai pra Home
          return;
        } else {
          // Se o Supabase exigir confirmação por e-mail antes de logar
          setMessage({
            text: "Conta pré-criada! Verifique seu e-mail para confirmar antes de acessar.",
            type: "success",
          });
        }
      }
    } catch (error: any) {
      setMessage({ text: error.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 flex flex-col justify-center items-center font-sans min-h-screen py-10 px-4">
      <div className={`w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 transition-all ${isLogin ? 'max-w-md' : 'max-w-2xl'}`}>
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            {isLogin ? "Acesse sua conta" : "Crie sua conta"}
          </h2>
          <p className="text-slate-500 mt-2 text-sm md:text-base">
            {isLogin ? "Bem-vindo de volta ao SmartRS" : "Comece a gerar laudos institucionais de alto nível"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          
          {/* CAMPOS DE LOGIN SEMPRE VISÍVEIS */}
          <div className={`grid gap-5 ${!isLogin ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">E-mail *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div> 

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Senha *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
                minLength={6}
              />
            </div>
          </div>

          {/* CAMPOS EXTRAS APENAS PARA CADASTRO */}
          {!isLogin && (
            <div className="grid gap-5 md:grid-cols-2 pt-4 border-t border-slate-100">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nome Completo / Exibição *</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required={!isLogin}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">CPF *</label>
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(formatarCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required={!isLogin}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">WhatsApp *</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(formatarWhatsApp(e.target.value))}
                  placeholder="(00) 00000-0000"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required={!isLogin}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">CRECI <span className="text-slate-400 font-normal">(Opcional)</span></label>
                <input
                  type="text"
                  value={creci}
                  onChange={(e) => setCreci(e.target.value)}
                  placeholder="Ex: 12345-F"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Foto de Perfil <span className="text-slate-400 font-normal">(Opcional)</span></label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFoto(e.target.files ? e.target.files[0] : null)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-slate-50 cursor-pointer file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>
          )}

          {message.text && (
            <div className={`p-4 rounded-lg text-sm font-medium ${message.type === "error" ? "bg-red-50 text-red-600 border border-red-100" : "bg-green-50 text-green-700 border border-green-100"}`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 mt-2 rounded-xl text-white font-bold text-lg transition-all shadow-md ${
              loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 shadow-blue-200 hover:shadow-blue-300"
            }`}
          >
            {loading ? "Processando..." : (isLogin ? "Entrar na Plataforma" : "Criar Minha Conta")}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-600 border-t border-slate-100 pt-6">
          {isLogin ? "Ainda não tem uma conta? " : "Já possui uma conta? "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage({ text: "", type: "" });
            }}
            className="text-blue-600 font-extrabold hover:underline ml-1"
          >
            {isLogin ? "Cadastre-se" : "Faça Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
