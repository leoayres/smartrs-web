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
  variant?: "list" | "progress"; // <- Nova propriedade para alternar o estilo
}

export default function LoadingSteps({ 
  titulo = "Processando Dados...", 
  subtitulo = "A Inteligência Artificial está trabalhando na sua requisição.",
  variant = "list" // O padrão será a lista detalhada
}: LoadingStepsProps) {
  const [etapaAtual, setEtapaAtual] = useState(0);

  useEffect(() => {
    const tempoPorEtapa = 30000 / ETAPAS_PROCESSAMENTO.length; 
    
    const intervalo = setInterval(() => {
      setEtapaAtual((prev) => {
        if (prev < ETAPAS_PROCESSAMENTO.length - 1) return prev + 1;
        return prev;
      });
    }, tempoPorEtapa);

    return () => clearInterval(intervalo);
  }, []);

  // Cálculo matemático para a barra de progresso (de 0 a 100%)
  const progressoPct = Math.round((etapaAtual / (ETAPAS_PROCESSAMENTO.length - 1)) * 100);

  return (
    <div className="text-center py-4 md:py-6">
      <RefreshCw className="animate-spin text-blue-600 mx-auto mb-6" size={48} />
      
      <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">{titulo}</h3>
      <p className="text-gray-500 text-sm md:text-base mb-8 max-w-md mx-auto leading-relaxed">
        {subtitulo}
      </p>

      {variant === "list" ? (
        /* ESTILO 1: LISTA DETALHADA TACHADA (TELA INICIAL) */
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
      ) : (
        /* ESTILO 2: BARRA DE PROGRESSO COMPACTA (MODAL) */
        <div className="max-w-md mx-auto mt-4">
          <div className="w-full bg-gray-100 rounded-full h-3 mb-5 overflow-hidden border border-gray-200">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${progressoPct}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-center gap-2 text-blue-700 font-medium text-sm bg-blue-50 py-2.5 px-4 rounded-lg border border-blue-100">
            <RefreshCw className="animate-spin shrink-0" size={16} />
            <span className="truncate">{ETAPAS_PROCESSAMENTO[etapaAtual]}</span>
          </div>
        </div>
      )}
    </div>
  );
}
