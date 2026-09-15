import { NextResponse } from "next/server";
import { stripe } from "../../../lib/stripe";
import { createClient } from "@supabase/supabase-js";

// Usamos a chave SERVICE_ROLE para ter poderes de Admin e ignorar o RLS do banco
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") as string;

  let event;

  try {
    // Valida se a requisição realmente veio da Stripe (segurança contra hackers)
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error("Erro na assinatura do Webhook:", error.message);
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
  }

  // O evento que nos interessa é o checkout concluído (pagamento aprovado)
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    
    // O PULO DO GATO: Lembra do carimbo com o ID do Supabase que enviamos na criação? Recuperamos aqui!
    const userId = session.client_reference_id; 

    if (userId) {
      // 1. Busca os dados atuais do corretor no banco
      const { data: usuario } = await supabaseAdmin
        .from("usuarios")
        .select("creditos, plano")
        .eq("id", userId)
        .single();

      let novosCreditos = usuario?.creditos || 0;
      let novoPlano = usuario?.plano || "Degustação";

      // 2. Lógica de negócio: O que ele comprou?
      if (session.mode === "payment") {
        // Comprou o Pacote Avulso de 5 Dossiês
        novosCreditos += 5;
      } else if (session.mode === "subscription") {
        // Comprou a Assinatura Pro
        novoPlano = "Pro";
        novosCreditos += 20; 
      }

      // 3. Atualiza o banco de dados com a grana no bolso
      const { error } = await supabaseAdmin
        .from("usuarios")
        .update({ creditos: novosCreditos, plano: novoPlano })
        .eq("id", userId);

      if (error) {
        console.error("Erro ao injetar créditos no Supabase:", error);
        return NextResponse.json({ error: "Erro interno de banco de dados" }, { status: 500 });
      }
      
      console.log(`💸 Sucesso! Usuário ${userId} atualizado. Plano: ${novoPlano}, Créditos: ${novosCreditos}`);
    }
  }

  // Responde para a Stripe que recebemos a mensagem (senão ela fica tentando reenviar por 3 dias)
  return NextResponse.json({ received: true });
}
