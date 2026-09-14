"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Função auxiliar para aplicar a máscara de telefone (BR)
const formatarWhatsApp = (valor: string) => {
  if (!valor) return "";
  let v = valor.replace(/\D/g, ""); // Remove tudo que não é dígito
  if (v.length <= 10) {
    v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    v = v.replace(/(\d{4})(\d)/, "$1-$2");
  } else {
    v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    v = v.replace(/(\d{5})(\d)/, "$1-$2");
  }
  return v.substring(0, 15); // Limita ao tamanho máximo: (XX) XXXXX-XXXX
};

export default function ContaPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState({ texto: "", tipo: "" });
  
  const [usuarioId, setUsuarioId] = useState("");
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [creci, setCreci] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [novaSenha, setNovaSenha] = useState("");

  useEffect(() => {
    async function carregarDadosUsuario() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      
      setUsuarioId(session.user.id);

      // Busca os dados públicos do usuário (agora incluindo o CRECI)
      const { data } = await supabase
        .from("usuarios")
        .select("nome, whatsapp, avatar_url, creci")
        .eq("id", session.user.id)
        .single();

      if (data) {
        setNome(data.nome || "");
        setWhatsapp(data.whatsapp || "");
        setCreci(data.creci || "");
        setAvatarUrl(data.avatar_url || "");
      }
      setLoading(false);
    }
    carregarDadosUsuario();
  }, [router]);

  const handleUploadFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${usuarioId}-${Math.random()}.${fileExt}`;

      setSalvando(true);
      setMensagem({ texto: "Enviando foto...", tipo: "info" });

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      setMensagem({ texto: "Foto enviada! Clique em Salvar Configurações para confirmar.", tipo: "sucesso" });
    } catch (error: any) {
      setMensagem({ texto: "Erro ao subir foto: " + error.message, tipo: "erro" });
    } finally {
      setSalvando(false);
    }
  };

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWhatsapp(formatarWhatsApp(e.target.value));
  };

  const handleSalvarConta = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setMensagem({ texto: "", tipo: "" });

    try {
     // 1. Atualiza dados públicos na tabela 'usuarios' (Usando UPDATE para não esbarrar na trava do CPF)
      const { error: usuarioError } = await supabase.from("usuarios")
        .update({
          nome,
          whatsapp,
          creci,
          avatar_url: avatarUrl,
          updated_at: new Date(),
        })
        .eq("id", usuarioId);

      if (usuarioError) throw usuarioError;

      // 2. Atualiza a senha
      if (novaSenha) {
        const { error: authError } = await supabase.auth.updateUser({
          password: novaSenha
        });
        if (authError) throw authError;
        setNovaSenha(""); 
      }

      setMensagem({ texto: "Conta atualizada com sucesso!", tipo: "sucesso" });
    } catch (error: any) {
      setMensagem({ texto: "Erro ao salvar: " + error.message, tipo: "erro" });
    } finally {
      setSalvando(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-slate-500 font-bold">Carregando dados...</div>;

  return (
    <div className="bg-gray-50 min-h-screen font-sans p-4 pt-12 md:pt-20">
      <div className="max-w-xl mx-auto bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100">
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Minha Conta</h1>
          <Link href="/" className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
            &larr; Voltar ao Início
          </Link>
        </div>

        {mensagem.texto && (
          <div className={`p-4 mb-6 rounded-xl text-sm font-medium border ${mensagem.tipo === 'erro' ? 'bg-red-50 text-red-600 border-red-100' : mensagem.tipo === 'info' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
            {mensagem.texto}
          </div>
        )}

        <form onSubmit={handleSalvarConta} className="space-y-6">
          
          <div className="flex flex-col items-center mb-6">
            <div className="h-24 w-24 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 mb-4 flex items-center justify-center shadow-inner">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar do Usuário" className="h-full w-full object-cover" />
              ) : (
                <span className="text-slate-400 text-3xl">📷</span>
              )}
            </div>
            <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 px-4 rounded-full transition-colors border border-slate-200">
              {avatarUrl ? "Trocar Foto" : "Adicionar Foto"}
              <input type="file" accept="image/*" onChange={handleUploadFoto} className="hidden" disabled={salvando} />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nome de Exibição no Dossiê</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Leonardo Ayres"
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">CRECI</label>
                <input
                  type="text"
                  value={creci}
                  onChange={(e) => setCreci(e.target.value)}
                  placeholder="Ex: 12345-F"
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">WhatsApp Profissional</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={handleWhatsAppChange}
                  placeholder="(00) 00000-0000"
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                />
              </div>
            </div>

            <hr className="my-2 border-slate-100" />

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Segurança: Alterar Senha</label>
              <input
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Deixe em branco para manter a atual"
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
              />
              <p className="text-xs text-slate-400 mt-2">Apenas preencha se desejar modificar a sua senha de acesso.</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={salvando}
            className="w-full py-4 mt-6 rounded-xl text-white font-bold text-lg bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-200 hover:shadow-blue-300 disabled:opacity-50 flex justify-center items-center"
          >
            {salvando ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processando...
              </span>
            ) : (
              "Salvar Configurações"
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
