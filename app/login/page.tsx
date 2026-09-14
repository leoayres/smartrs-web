"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

// Inicializa o cliente do Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Login() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      if (isLogin) {
        // LÓGICA DE LOGIN
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        // NOVA LÓGICA DE ROTEAMENTO DINÂMICO
        if (data.session) {
          try {
            const userId = data.session.user.id;
            const resposta = await fetch(`https://smartrs.onrender.com/laudos/meus/${userId}`);
            
            if (resposta.ok) {
              const json = await resposta.json();
              
              // Se a lista de laudos for maior que zero, manda pra vitrine.
              if (json.laudos && json.laudos.length > 0) {
                router.push("/meus-laudos");
                return; // Encerra a execução aqui
              }
            }
            
            // Se não tiver laudos (ou se der erro de conexão), vai pro Novo Laudo
            router.push("/");
            
          } catch (fetchError) {
            // Fallback de segurança: se a API estiver fora do ar momentaneamente
            router.push("/");
          }
        }

      } else {
        // LÓGICA DE CADASTRO
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        setMessage({
          text: "Conta criada! Verifique seu e-mail para confirmar.",
          type: "success",
        });
      }
    } catch (error: any) {
      setMessage({ text: error.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 flex flex-col justify-center items-center font-sans min-h-screen">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800">
            {isLogin ? "Acesse sua conta" : "Crie sua conta"}
          </h2>
          <p className="text-slate-500 mt-2">
            {isLogin ? "Bem-vindo de volta ao SmartRS" : "Comece a gerar laudos de alto nível"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div> 

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          {message.text && (
            <div className={`p-3 rounded-lg text-sm ${message.type === "error" ? "bg-red-50 text-red-600 border border-red-100" : "bg-green-50 text-green-700 border border-green-100"}`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-bold transition-all ${
              loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Processando..." : (isLogin ? "Entrar" : "Cadastrar")}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          {isLogin ? "Ainda não tem uma conta? " : "Já possui uma conta? "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage({ text: "", type: "" });
            }}
            className="text-blue-600 font-bold hover:underline"
          >
            {isLogin ? "Cadastre-se" : "Faça Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
