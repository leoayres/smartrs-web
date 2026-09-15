"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { Mail, ArrowLeft, KeyRound } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [sucesso, setSucesso] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      // O Supabase vai enviar um e-mail com um link mágico.
      // O parâmetro redirectTo diz para onde o usuário deve ir APÓS clicar no link do e-mail.
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/atualizar-senha`,
      });

      if (error) {
        throw new Error("Não foi possível enviar o e-mail de recuperação. Verifique o endereço digitado.");
      }

      setSucesso(true);
      setMessage({
        text: "E-mail enviado com sucesso! Verifique sua caixa de entrada (e a pasta de Spam) para redefinir sua senha.",
        type: "success"
      });
      
    } catch (error: any) {
      setMessage({ text: error.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 flex flex-col justify-center items-center font-sans min-h-screen py-10 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound size={32} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            Recuperar Senha
          </h2>
          <p className="text-slate-500 mt-2 text-sm">
            Digite o e-mail cadastrado e enviaremos um link para você criar uma nova senha.
          </p>
        </div>

        {!sucesso ? (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">E-mail cadastrado</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-slate-400" />
                </div>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                  placeholder="seu@email.com"
                  required 
                />
              </div>
            </div>

            {message.text && (
              <div className={`p-4 rounded-lg text-sm font-medium ${message.type === "error" ? "bg-red-50 text-red-700 border border-red-100" : "bg-green-50 text-green-700 border border-green-100"}`}>
                {message.text}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading} 
              className={`w-full py-3.5 mt-2 rounded-xl text-white font-bold text-lg transition-all shadow-md ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 shadow-blue-200 hover:shadow-blue-300"}`}
            >
              {loading ? "Enviando..." : "Enviar Link de Recuperação"}
            </button>
          </form>
        ) : (
          <div className="bg-green-50 text-green-800 border border-green-200 p-5 rounded-xl text-center">
            <p className="font-semibold mb-2">Pronto!</p>
            <p className="text-sm">{message.text}</p>
          </div>
        )}

        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft size={16} /> Voltar para o Login
          </Link>
        </div>

      </div>
    </div>
  );
}
