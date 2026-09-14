"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { Users, FileText, Edit, Trash2, X, ShieldCheck, Search, Eye } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  
  // Estados para os Modais
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<any>(null);
  
  const [modalLaudosOpen, setModalLaudosOpen] = useState(false);
  const [laudosUsuario, setLaudosUsuario] = useState<any[]>([]);
  const [usuarioSelecionadoNome, setUsuarioSelecionadoNome] = useState("");

  useEffect(() => {
    async function carregarDadosAdmin() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push("/login");

      // 1. Verifica se é Admin
      const { data: userLogado } = await supabase.from("usuarios").select("nivel_acesso").eq("id", session.user.id).single();
      if (userLogado?.nivel_acesso !== "admin") {
        return router.push("/"); // Expulsa invasores para a home
      }

      // 2. Busca todos os usuários
      const { data: listaUsuarios } = await supabase.from("usuarios").select("*").order("created_at", { ascending: false });
      setUsuarios(listaUsuarios || []);
      setLoading(false);
    }
    carregarDadosAdmin();
  }, [router]);

  // ==========================================
  // FUNÇÕES DE USUÁRIOS
  // ==========================================
  const abrirModalEdicao = (user: any) => {
    setUsuarioEditando({ ...user });
    setModalEditOpen(true);
  };

  const salvarEdicaoUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("usuarios").update({
        nome: usuarioEditando.nome,
        cpf: usuarioEditando.cpf,
        whatsapp: usuarioEditando.whatsapp,
        creci: usuarioEditando.creci,
        nivel_acesso: usuarioEditando.nivel_acesso
      }).eq("id", usuarioEditando.id);
      
      if (error) throw error;
      
      setUsuarios(usuarios.map(u => u.id === usuarioEditando.id ? usuarioEditando : u));
      setModalEditOpen(false);
      alert("Usuário atualizado com sucesso.");
    } catch (err: any) {
      alert("Erro ao atualizar: " + err.message);
    }
  };

  const excluirUsuario = async (id: string, nome: string) => {
    if (!window.confirm(`Tem certeza que deseja EXCLUIR o corretor ${nome} e perder acesso aos dados dele?`)) return;
    try {
      const { error } = await supabase.from("usuarios").delete().eq("id", id);
      if (error) throw error;
      setUsuarios(usuarios.filter(u => u.id !== id));
    } catch (err: any) {
      alert("Erro ao excluir: " + err.message);
    }
  };

  // ==========================================
  // FUNÇÕES DE LAUDOS
  // ==========================================
  const abrirLaudosUsuario = async (userId: string, nome: string) => {
    setUsuarioSelecionadoNome(nome);
    setModalLaudosOpen(true);
    setLaudosUsuario([]); // Limpa carregamento anterior
    
    const { data } = await supabase.from("meus_laudos").select("*").eq("user_id", userId).order("criado_em", { ascending: false });
    setLaudosUsuario(data || []);
  };

  const excluirLaudo = async (laudoId: string) => {
    if (!window.confirm("Deseja excluir este Dossiê permanentemente?")) return;
    try {
      const { error } = await supabase.from("meus_laudos").delete().eq("id", laudoId);
      if (error) throw error;
      setLaudosUsuario(laudosUsuario.filter(l => l.id !== laudoId));
    } catch (err: any) {
      alert("Erro ao excluir laudo: " + err.message);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 font-bold text-slate-500">Verificando credenciais de administrador...</div>;

  return (
    <div className="bg-slate-50 min-h-screen font-sans p-6 pt-12">
      <div className="max-w-7xl mx-auto">
        
        {/* CABEÇALHO DO DASHBOARD */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <ShieldCheck className="text-blue-600" size={32} />
              Painel de Administração
            </h1>
            <p className="text-slate-500 mt-1">Gestão global de corretores, permissões e laudos gerados.</p>
          </div>
          <Link href="/" className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm">
            &larr; Voltar para a Home
          </Link>
        </div>

        {/* TABELA DE USUÁRIOS */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                  <th className="p-4 pl-6">Corretor</th>
                  <th className="p-4">Contato & Docs</th>
                  <th className="p-4">Nível de Acesso</th>
                  <th className="p-4 text-right pr-6">Gerenciamento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {usuarios.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 overflow-hidden flex-shrink-0">
                          {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" /> : <Users className="m-2 text-slate-400" size={20} />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{user.nome || "Usuário Incompleto"}</p>
                          <p className="text-xs text-slate-500 font-mono" title={user.id}>{user.id.split('-')[0]}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-slate-700 font-medium">{user.whatsapp || "Sem telefone"}</p>
                      <p className="text-xs text-slate-500 mt-0.5">CPF: {user.cpf || "N/A"} • CRECI: {user.creci || "N/A"}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.nivel_acesso === 'admin' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                        {user.nivel_acesso === 'admin' ? '⭐ Administrador' : 'Corretor'}
                      </span>
                    </td>
                    <td className="p-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => abrirLaudosUsuario(user.id, user.nome)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors tooltip" title="Ver Laudos do Usuário">
                          <FileText size={18} />
                        </button>
                        <button onClick={() => abrirModalEdicao(user)} className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors" title="Editar Usuário">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => excluirUsuario(user.id, user.nome)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Excluir Usuário" disabled={user.nivel_acesso === 'admin'}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {usuarios.length === 0 && (
                  <tr><td colSpan={4} className="p-8 text-center text-slate-500">Nenhum usuário encontrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================== */}
        {/* MODAL 1: EDIÇÃO DE USUÁRIO */}
        {/* ========================================== */}
        {modalEditOpen && usuarioEditando && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-800">Editar Corretor</h2>
                <button onClick={() => setModalEditOpen(false)} className="text-slate-400 hover:text-red-500"><X size={24} /></button>
              </div>
              <form onSubmit={salvarEdicaoUsuario} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nome</label>
                  <input type="text" value={usuarioEditando.nome || ""} onChange={(e) => setUsuarioEditando({...usuarioEditando, nome: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">CPF</label>
                    <input type="text" value={usuarioEditando.cpf || ""} onChange={(e) => setUsuarioEditando({...usuarioEditando, cpf: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">CRECI</label>
                    <input type="text" value={usuarioEditando.creci || ""} onChange={(e) => setUsuarioEditando({...usuarioEditando, creci: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">WhatsApp</label>
                  <input type="text" value={usuarioEditando.whatsapp || ""} onChange={(e) => setUsuarioEditando({...usuarioEditando, whatsapp: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 outline-none" />
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nível de Acesso (CUIDADO)</label>
                  <select value={usuarioEditando.nivel_acesso || "corretor"} onChange={(e) => setUsuarioEditando({...usuarioEditando, nivel_acesso: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg font-bold outline-none bg-slate-50 text-slate-800">
                    <option value="corretor">Corretor (Padrão)</option>
                    <option value="admin">Administrador (Acesso Total)</option>
                  </select>
                </div>
                <button type="submit" className="w-full py-3 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg">
                  Salvar Alterações
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* MODAL 2: VER LAUDOS DO USUÁRIO */}
        {/* ========================================== */}
        {modalLaudosOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
              <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Dossiês Gerados</h2>
                  <p className="text-sm text-slate-500 mt-1">Corretor: <strong className="text-slate-700">{usuarioSelecionadoNome}</strong></p>
                </div>
                <button onClick={() => setModalLaudosOpen(false)} className="bg-white p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-red-500 transition-colors shadow-sm"><X size={20} /></button>
              </div>
              
              <div className="overflow-y-auto p-6 flex-1">
                {laudosUsuario.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 font-medium">Este corretor ainda não gerou nenhum laudo.</div>
                ) : (
                  <div className="grid gap-4">
                    {laudosUsuario.map((laudo) => (
                      <div key={laudo.id} className="flex flex-col md:flex-row items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-shadow gap-4">
                        <div className="flex-1">
                          <p className="font-bold text-slate-800 text-sm">{laudo.endereco}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 font-medium">
                            <span className="bg-slate-100 px-2 py-1 rounded-md">{new Date(laudo.criado_em).toLocaleDateString('pt-BR')}</span>
                            <span className={`px-2 py-1 rounded-md ${laudo.status === 'Ativo' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>{laudo.status}</span>
                            <span>👁️ {laudo.visualizacoes || 0} acessos</span>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                          <a href={`/laudo/${laudo.id}`} target="_blank" className="flex-1 text-center bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
                            <Eye size={16} /> Abrir
                          </a>
                          <button onClick={() => excluirLaudo(laudo.id)} className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm hover:bg-red-100 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
