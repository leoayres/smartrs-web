import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import LaudoClient from "./LaudoClient";

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Props = {
  params: Promise<{ id: string }> | { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // CORRIGIDO: Agora aponta para a tabela correta 'meus_laudos'
  const { data: laudo, error } = await supabase
    .from("meus_laudos")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Erro ao ler Supabase no Metadata:", error.message);
  }

  // Busca o endereço dinamicamente
  const endereco = laudo?.dados_geo?.endereco_analisado 
                || laudo?.dados?.endereco_analisado 
                || laudo?.endereco 
                || "Ativo Imobiliário Exclusivo";

  const baseUrl = "https://smartrs-web.vercel.app";

  return {
    title: `Dossiê: ${endereco} | SmartRS`,
    description: "Acesse a auditoria de precificação, valuation de mercado e visão geoespacial interativa deste ativo.",
    openGraph: {
      title: `Dossiê Institucional: ${endereco}`,
      description: "Auditoria de precificação, valuation de mercado e inteligência geoespacial.",
      url: `${baseUrl}/laudo/${id}`,
      siteName: "SmartRS",
      images: [
        {
          url: `${baseUrl}/og-image.jpg`,
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

export default function LaudoPublicoPage() {
  return <LaudoClient />;
}
