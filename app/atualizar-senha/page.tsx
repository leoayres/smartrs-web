"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Lock, CheckCircle2, AlertCircle } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AtualizarSenhaPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [sucesso, setSucesso] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    if (password.length < 6) {
      setMessage({ text: "A senha deve ter pelo menos 6 caracteres.", type: "error" });
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ text: "As senhas não coincidem. Verifique e tente novamente.", type: "error" });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setSucesso(true);
      setMessage({ 
        text: "Senha redefinida com sucesso! Redirecionando para o login...", 
        type: "success" 
      });

      setTimeout(() => {
        router.push("/login");
      }, 3000);

    } catch (error: any) {
      // CAÇA-ERROS INTELIGENTE (TRADUÇÃO)
      let errorMessage = error.message || "Erro ao atualizar a senha. O link pode ter expirado.";

      if (errorMessage.toLowerCase().includes("different from the old password")) {
        errorMessage = "A nova senha não pode ser igual à atual. Por favor, digite uma senha diferente.";
      } else if (errorMessage.toLowerCase().includes("auth session missing") || errorMessage.toLowerCase().includes("expired")) {
        errorMessage = "Sua sessão expirou ou o link é inválido. Por favor, solicite a recuperação novamente.";
      }

      setMessage({ 
        text: errorMessage, 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 flex flex-col justify-center items-center font-sans min-h-screen py-10 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            Nova Senha
          </h2>
          <p className="text-slate-500 mt-2 text-sm">
            Digite e confirme sua nova senha de acesso ao SmartRS.
          </p>
        </div>

        {!sucesso ? (
          <form onSubmit={handleUpdatePassword} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nova Senha *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400" />
                </div>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                  placeholder="••••••••"
                  required 
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Confirme a Nova Senha *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400" />
                </div>
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                  placeholder="••••••••"
                  required 
                  minLength={6}
                />
              </div>
            </div>

            {message.text && (
              <div className={`p-4 rounded-lg text-sm font-medium flex items-center gap-3 ${message.type === "error" ? "bg-red-50 text-red-700 border border-red-100" : "bg-green-50 text-green-700 border border-green-100"}`}>
                {message.type === "error" ? <AlertCircle size={20} className="shrink-0" /> : <CheckCircle2 size={20} className="shrink-0" />}
                <span>{message.text}</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading} 
              className={`w-full py-3.5 mt-2 rounded-xl text-white font-bold text-lg transition-all shadow-md ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 shadow-blue-200 hover:shadow-blue-300"}`}
            >
              {loading ? "Atualizando..." : "Salvar Nova Senha"}
            </button>
          </form>
        ) : (
          <div className="bg-green-50 text-green-800 border border-green-200 p-6 rounded-xl text-center space-y-3">
            <CheckCircle2 size={40} className="text-green-600 mx-auto" />
            <p className="font-bold text-lg">Tudo pronto!</p>
            <p className="text-sm">{message.text}</p>
          </div>
        )}

      </div>
    </div>
  );
}
