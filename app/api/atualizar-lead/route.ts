import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Usando a chave mestra (Service Role) que já configuramos antes!
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { leadId, novoStatus } = await req.json();

    if (!leadId || !novoStatus) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    // Faz o UPDATE com superpoderes, ignorando os bloqueios do frontend
    const { error } = await supabaseAdmin
      .from("leads")
      .update({ status: novoStatus })
      .eq("id", leadId);
    
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro na API de status:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
