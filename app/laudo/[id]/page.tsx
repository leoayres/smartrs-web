import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import LaudoClient from "./LaudoClient";

// 1. Força a rota a ser dinâmica (não fazer cache estático)
export const dynamic = 'force-dynamic';

// 2. Inicializa o Supabase (lado do Servidor)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Props = {
  params: { id: string };
};

// 3. GERAÇÃO DINÂMICA DAS TAGS PARA O WHATSAPP/LINKEDIN
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id;

  // Busca o endereço do laudo no Supabase de forma super rápida
  const { data: laudo } = await supabase
    .from("laudos")
    .select("dados_geo")
    .eq("id", id)
    .single();

  // Se não encontrar o endereço, usa um texto genérico premium
  const endereco = laudo?.dados_geo?.endereco_analisado || "Ativo Imobiliário Exclusivo";

  return {
    title: `Dossiê: ${endereco} | SmartRS`,
    description: "Acesse a auditoria de precificação, valuation de mercado e visão geoespacial interativa deste ativo.",
    openGraph: {
      title: `Dossiê Institucional: ${endereco}`,
      description: "Auditoria de precificação, valuation de mercado e inteligência geoespacial.",
      url: `https://smartrs-web.vercel.app/laudo/${id}`,
      siteName: "SmartRS",
      images: [
        {
          url: "https://smartrs-web.vercel.app/og-image.jpg", // Lembre-se de colocar essa imagem na pasta /public
          width: 1200,
          height: 630,
          alt: `Dossiê SmartRS - ${endereco}`,
        },
      ],
      locale: "pt_BR",
      type: "article",
    },
  };
}

// 4. RENDERIZA A PÁGINA EM SI CHAMANDO O COMPONENTE CLIENTE
export default function LaudoPublicoPage({ params }: Props) {
  return <LaudoClient laudoId={params.id} />;
}
