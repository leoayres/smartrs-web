"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Tipagem TypeScript garantindo que o front-end saiba o formato dos dados
interface Laudo {
  id: string;
  endereco: string;
  status_video: string;
  visualizacoes: number;
  criado_em: string;
}

export default function MeusLaudos() {
  const [laudos, setLaudos] = useState<Laudo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  // DICA: Em um cenário real, você pegaria este ID do sistema de login (ex: NextAuth, Firebase, Supabase Auth)
  // Por enquanto, vamos usar um ID fixo ou pegar do LocalStorage se você já tiver isso implementado.
  const userId = "usuario_teste_123"; 
  
  // Lembre-se de trocar esta URL para a URL real do seu back-end no Render!
  const API_URL = "https://smartrs.onrender.com";

  useEffect(() => {
    const buscarLaudos = async () => {
      try {
        const resposta = await fetch(`${API_URL}/laudos/meus/${userId}`);
        if (!resposta.ok) {
          throw new Error("Falha ao buscar os laudos.");
        }
        const data = await resposta.json();
        setLaudos(data.laudos || []);
      } catch (err: any) {
        setErro(err.message);
      } finally {
        setLoading(false);
      }
    };

    buscarLaudos();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-600 animate-pulse">Carregando sua vitrine de laudos...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg shadow-sm border border-red-100">
          ⚠️ Ocorreu um erro: {erro}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Meus Laudos de Inteligência</h1>
          <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md font-medium transition">
            + Novo Laudo
          </Link>
        </div>
        
        {laudos.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-gray-200">
            <span className="text-4xl mb-4 block">📄</span>
            <h3 className="text-xl font-medium text-gray-700 mb-2">Nenhum laudo encontrado</h3>
            <p className="text-gray-500">Você ainda não gerou nenhum Dossiê de Inteligência.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200 text-gray-600 uppercase text-xs tracking-wider">
                  <th className="p-4 font-semibold">Endereço Analisado</th>
                  <th className="p-4 font-semibold">Gerado em</th>
                  <th className="p-4 font-semibold">Visualizações</th>
                  <th className="p-4 font-semibold">Tour 3D</th>
                  <th className="p-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {laudos.map((laudo) => (
                  <tr key={laudo.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 text-gray-800 font-medium">{laudo.endereco}</td>
                    <td className="p-4 text-gray-600">
                      {new Date(laudo.criado_em).toLocaleDateString('pt-BR', {
                        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="p-4">
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-100">
                        👁️ {laudo.visualizacoes} views
                      </span>
                    </td>
                    <td className="p-4">
                      {laudo.status_video === 'ACTIVE' && (
                         <span className="text-green-700 bg-green-50 px-3 py-1 rounded-full text-sm font-medium border border-green-200">✅ Pronto</span>
                      )}
                      {laudo.status_video === 'PROCESSING' && (
                         <span className="text-yellow-700 bg-yellow-50 px-3 py-1 rounded-full text-sm font-medium border border-yellow-200" title="Processamento via satélite em andamento (2 a 24h)">⏳ Em Proc.</span>
                      )}
                      {laudo.status_video === 'UNSUPPORTED' && (
                         <span className="text-gray-500 bg-gray-100 px-3 py-1 rounded-full text-sm font-medium border border-gray-200">Indisponível</span>
                      )}
                    </td>
                    <td className="p-4 text-right flex justify-end gap-3">
                      <Link 
                        href={`/laudo/${laudo.id}`} 
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
                        target="_blank"
                      >
                        🔗 Link Público
                      </Link>
                      {/* O botão de PDF seria ligado a uma rota futura do seu back-end para baixar novamente o PDF salvo */}
                      <button className="bg-gray-800 hover:bg-gray-900 text-white px-3 py-1.5 rounded text-sm font-medium transition">
                        Baixar PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
