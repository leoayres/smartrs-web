"use client";

import { useState } from "react";

export default function Home() {
  const [endereco, setEndereco] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const handleGerarPdf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!endereco) {
      setErro("Por favor, digite um endereço válido.");
      return;
    }

    setLoading(true);
    setErro("");

    try {
      // IMPORTANTE: Troque pela URL da sua API no Render
      const resposta = await fetch("https://sua-api-aqui.onrender.com/gerar-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endereco }),
      });

      if (!resposta.ok) {
        throw new Error("Falha ao gerar o relatório. Tente novamente.");
      }

      // Converte a resposta em um arquivo físico (Blob) e força o download
      const blob = await resposta.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Dossie_${endereco.substring(0, 15).replace(/\s/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-20 font-sans">
      <div className="w-full max-w-2xl bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
        
        {/* Cabeçalho */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-800 mb-3">
            Dossiê Climático & Valorização
          </h1>
          <p className="text-slate-500">
            Gere laudos técnicos e comerciais impressionantes para fechar suas vendas imobiliárias mais rápido.
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleGerarPdf} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Endereço do Imóvel
            </label>
            <input
              type="text"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              placeholder="Ex: Av. Beira Mar, 1000, Meireles, Fortaleza"
              className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {erro && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all flex justify-center items-center ${
              loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processando IA e gerando PDF...
              </>
            ) : (
              "Gerar Relatório Profissional"
            )}
          </button>
        </form>
      </div>
      
      <p className="mt-8 text-sm text-slate-400">
        Ambiente Seguro B2B • Alimentado por Inteligência Artificial
      </p>
    </div>
  );
}
