"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function LaudoPublico() {
  const params = useParams();
  const laudoId = params.id as string;
  
  const [html, setHtml] = useState("");
  const [views, setViews] = useState(0);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const fetchLaudo = async () => {
      try {
        const res = await fetch(`https://smartrs.onrender.com/laudos/virtual/${laudoId}`);
        if (!res.ok) throw new Error("Laudo não encontrado ou indisponível.");
        
        const data = await res.json();
        setHtml(data.html_completo);
        setViews(data.estatisticas.visualizacoes);
      } catch (e: any) {
        setErro(e.message);
      }
    };

    fetchLaudo();
  }, [laudoId]);

  if (erro) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 text-red-600 p-8 rounded-xl font-bold border border-red-100 shadow-sm text-center">
          ⚠️ {erro}
        </div>
      </div>
    );
  }

  if (!html) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-blue-600 animate-pulse font-medium">Carregando Dossiê Digital...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 flex flex-col items-center py-12 font-sans">
      <div className="w-full max-w-4xl bg-white p-8 md:p-14 rounded-2xl shadow-lg border border-gray-100 relative">
        
        {/* Etiqueta de Visualizações no canto superior */}
        <div className="absolute top-6 right-6 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold border border-blue-100 shadow-sm flex items-center gap-2">
          👁️ {views} {views === 1 ? "visualização" : "visualizações"}
        </div>

        {/* Renderiza o Laudo Completo vindo do Back-end */}
        <div dangerouslySetInnerHTML={{ __html: html }} />
        
      </div>
    </div>
  );
}
