import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import LaudoClient from "./LaudoClient";

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Tipagem flexível para aceitar tanto Next 14 quanto o novo Next 15 (Promise)
type Props = {
  params: Promise<{ id: string }> | { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // O await garante que o ID seja lido corretamente nas versões novas do Next.js
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const { data: laudo } = await supabase
    .from("laudos")
    .select("dados_geo")
    .eq("id", id)
    .single();

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
          url: "https://smartrs-web.vercel.app/og-image.jpg",
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
  // Renderiza o cliente. Ele mesmo puxa o ID pela URL.
  return <LaudoClient />;
}
