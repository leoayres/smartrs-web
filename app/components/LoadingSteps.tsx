"use client";

import { useState, useEffect } from "react";
import { RefreshCw, CheckCircle2, CircleDashed } from "lucide-react";

// Mapeamento dinâmico do tempo esperado de resposta de cada microserviço do backend
const ETAPAS_DETALHADAS = [
  { label: "Extraindo coordenadas georreferenciadas...", duration: 1500 },
  { label: "Mapeando entorno via Google Places API...", duration: 3500 },
  { label: "Consultando Ficha Cadastral Oficial e IPTU...", duration: 2500 },
  { label: "Auditando histórico de transações (ITBI)...", duration: 2500 },
  { label: "Processando Índice Vocacional da vizinhança...", duration: 2000 },
  { label: "Avaliando topografia, qualidade do ar e potencial solar...", duration: 3000 },
  { label: "Analisando cenário macroeconômico (IVG-R / IPCA)...", duration: 1500 },
  { label: "Sincronizando satélites para Tour Aéreo 3D...", duration: 2000 },
  { label: "IA cruzando dados e calculando precificação a mercado...", duration: 8000 },
  { label: "IA redigindo a Tese de Investimento (Due Diligence)...", duration: 12000 },
  { label: "Renderizando gráficos e montando documento final...", duration: 10000 } // Retém aqui até o backend responder de fato
];

interface LoadingStepsProps {
  titulo?: string;
  subtitulo?: string;
  variant?: "list" | "progress";
}

export default function LoadingSteps({ 
  titulo = "Processando Dados...", 
  subtitulo = "A Inteligência Artificial está trabalhando na sua requisição.",
  variant = "list"
}: LoadingStepsProps) {
  const [etapaAtual, setEtapaAtual] = useState(0);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    // Função recursiva inteligente: avança a etapa respeitando o tempo real mapeado de cada API
    const advanceStep = (currentIdx: number) => {
      // Se chegou na última etapa, para de avançar (espera o backend concluir e desmontar o componente)
      if (currentIdx >= ETAPAS_DETALHADAS.length - 1) return;

      const stepDuration = ETAPAS_DETALHADAS[currentIdx].duration;

      timeoutId = setTimeout(() => {
        if (isMounted) {
          setEtapaAtual(currentIdx + 1);
          advanceStep(currentIdx + 1);
        }
      }, stepDuration);
    };

    advanceStep(0);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  // Cálculo matemático para a barra de progresso (de 0 a 100%)
  const progressoPct = Math.round((etapaAtual / (ETAPAS_DETALHADAS.length - 1)) * 100);

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
          {ETAPAS_DETALHADAS.map((etapa, index) => {
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
                  {etapa.label}
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
              className="bg-blue-600 h-3 rounded-full transition-all duration-1000 ease-in-out" 
              style={{ width: `${progressoPct}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-center gap-2 text-blue-700 font-medium text-sm bg-blue-50 py-2.5 px-4 rounded-lg border border-blue-100 shadow-sm">
            <RefreshCw className="animate-spin shrink-0" size={16} />
            <span className="truncate">{ETAPAS_DETALHADAS[etapaAtual].label}</span>
          </div>
        </div>
      )}
    </div>
  );
}
