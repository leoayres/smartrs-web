import { NextResponse } from "next/server";
import { stripe } from "../../../lib/stripe"; // Importa o nosso cliente Stripe configurado

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { priceId, userId, email, isSubscription } = body;

    // Trava de segurança
    if (!priceId || !userId) {
      return NextResponse.json(
        { error: "Faltam parâmetros obrigatórios (priceId ou userId)" },
        { status: 400 }
      );
    }

    // Pega a URL do site (seja localhost no teste ou seu domínio oficial na Vercel)
    const origin = req.headers.get("origin") || "https://smartrs.ia.br";

    // Cria a sessão de checkout na Stripe
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // Se for assinatura, o modo muda. Se for avulso, é "payment"
      mode: isSubscription ? "subscription" : "payment",
      
      // Para onde o cliente vai depois de pagar ou cancelar
      success_url: `${origin}/sucesso`,
      cancel_url: `${origin}/planos`,
      
      // O PULO DO GATO: Carimbamos o ID do Supabase do corretor aqui.
      // O Webhook vai ler isso depois para saber na conta de quem injetar os créditos!
      client_reference_id: userId,
      
      // Preenche o e-mail automaticamente na tela do cartão
      customer_email: email,
    });

    // Devolve a URL da tela de pagamento gerada
    return NextResponse.json({ checkoutUrl: session.url });
    
  } catch (error: any) {
    console.error("Erro ao gerar checkout da Stripe:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
