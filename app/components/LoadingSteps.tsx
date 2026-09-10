"use client";

import { useState, useEffect } from "react";
import { RefreshCw, CheckCircle2, CircleDashed } from "lucide-react";

const ETAPAS_PROCESSAMENTO = [
  "Sincronizando satélites e extraindo coordenadas...",
  "Mapeando comércios e serviços de alto padrão...",
  "Processando o Índice Vocacional da Vizinhança...",
  "Calculando Índice de Caminhabilidade SmartRS...",
  "Consultando topografia, relevo e face solar...",
  "Analisando Qualidade do Ar (AQI)...",
  "Mapeando Telhado e Potencial Solar...",
  "Sincronizando satélites para Tour 3D...",
  "IA redigindo a tese de investimento (Due Diligence)...",
  "Renderizando gráficos e montando documento final..."
];

interface LoadingStepsProps {
  titulo?: string;
  subtitulo?: string;
}

export default function LoadingSteps({ 
  titulo = "Processando Dados...", 
  subtitulo = "A Inteligência Artificial está trabalhando na sua requisição." 
}: LoadingStepsProps) {
  const [etapaAtual, setEtapaAtual] = useState(0);

  useEffect(() => {
    // 15 segundos no total dividido pelo número de etapas (para leitura confortável)
    const tempoPorEtapa = 15000 / ETAPAS_PROCESSAMENTO.length; 
    
    const intervalo = setInterval(() => {
      setEtapaAtual((prev) => {
        if (prev < ETAPAS_PROCESSAMENTO.length - 1) return prev + 1;
        return prev;
      });
    }, tempoPorEtapa);

    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="text-center py-4 md:py-6">
      <RefreshCw className="animate-spin text-blue-600 mx-auto mb-6" size={48} />
      
      <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">{titulo}</h3>
      <p className="text-gray-500 text-sm md:text-base mb-8 max-w-md mx-auto leading-relaxed">
        {subtitulo}
      </p>

      {/* LISTA DE ETAPAS COMPLETA E DETALHADA */}
      <div className="max-w-md mx-auto text-left space-y-3.5">
        {ETAPAS_PROCESSAMENTO.map((etapa, index) => {
          const concluida = index < etapaAtual;
          const emAndamento = index === etapaAtual;
          
          return (
            <div key={index} className={`flex items-start gap-3 transition-opacity duration-500 ${index > etapaAtual ? 'opacity-40' : 'opacity-100'}`}>
              <div className="mt-0.5 shrink-0">
                {concluida ? (
                  <CheckCircle2 className="text-green-500" size={18} />
                ) : emAndamento ? (
                  <RefreshCw className="text-blue-500 animate-spin" size={18} />
                ) : (
                  <CircleDashed className="text-gray-300" size={18} />
                )}
              </div>
              <span className={`text-sm md:text-[14.5px] ${concluida ? 'text-gray-400 line-through' : emAndamento ? 'text-blue-700 font-semibold' : 'text-gray-500'}`}>
                {etapa}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
