import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);

// NOVO: Cliente Admin (com superpoderes) usando a Service Role Key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // <- Usando a chave mestra aqui!
);

export async function POST(req: Request) {
  try {
    const { laudoId, corretorId, nomeCliente, telefoneCliente } = await req.json();

    if (!corretorId || !nomeCliente || !telefoneCliente) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    // 1. Busca os dados públicos (Nome do Corretor e Endereço do Imóvel)
    const [{ data: corretor }, { data: laudo }] = await Promise.all([
      supabaseAdmin.from("usuarios").select("nome").eq("id", corretorId).single(),
      supabaseAdmin.from("meus_laudos").select("endereco").eq("id", laudoId).single(),
    ]);

    // 2. Busca o E-mail privado diretamente na auth.users do Supabase
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(corretorId);
    
    const emailDestino = authData?.user?.email;

    if (!emailDestino) {
      console.log("⚠️ Corretor sem e-mail cadastrado na tabela auth.users");
      return NextResponse.json({ message: "Corretor sem email" }, { status: 200 });
    }

    const enderecoImovel = laudo?.endereco || "Endereço não identificado";
    const telefoneLimpo = telefoneCliente.replace(/\D/g, "");
    const msgWhatsApp = encodeURIComponent(
      `Olá, ${nomeCliente}! Sou o especialista responsável pelo dossiê em ${enderecoImovel}. Vi que solicitou contato, como posso te ajudar?`
    );
    const linkWhatsApp = `https://wa.me/55${telefoneLimpo}?text=${msgWhatsApp}`;

    // 3. Dispara o E-mail Transacional Oficial
    const { data, error } = await resend.emails.send({
      from: "SmartRS Inteligência Imobiliária <notificacao@smartrs.ia.br>", 
      to: emailDestino,
      subject: `🎯 Novo Lead Captado: ${nomeCliente} (${enderecoImovel.split(",")[0]})`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
            .container { max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; }
            .header { background: #1e3a8a; padding: 24px; text-align: center; color: #ffffff; }
            .content { padding: 32px 24px; color: #334155; }
            .card { background: #f1f5f9; border-radius: 12px; padding: 16px 20px; margin: 20px 0; }
            .btn { display: inline-block; background: #22c55e; color: #ffffff !important; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 15px; text-align: center; margin-top: 10px; }
            .footer { border-top: 1px solid #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0; font-size: 20px;">🎉 Novo Lead no SmartRS!</h2>
            </div>
            <div class="content">
              <p style="font-size: 16px; margin-top: 0;">Olá, <strong>${corretor?.nome || "Corretor"}</strong>!</p>
              <p>Um investidor acabou de visualizar o seu Dossiê de Inteligência e deixou os dados de contato:</p>
              
              <div class="card">
                <p style="margin: 6px 0;"><strong>Nome:</strong> ${nomeCliente}</p>
                <p style="margin: 6px 0;"><strong>WhatsApp:</strong> ${telefoneCliente}</p>
                <p style="margin: 6px 0;"><strong>Dossiê Consultado:</strong> ${enderecoImovel}</p>
              </div>

              <div style="text-align: center; margin: 25px 0;">
                <a href="${linkWhatsApp}" class="btn" target="_blank">
                  💬 Chamar no WhatsApp Agora
                </a>
              </div>

              <p style="font-size: 13px; color: #64748b;">Dica: Contatos abordados nos primeiros 5 minutos têm taxa de conversão até 4x maior.</p>
            </div>
            <div class="footer">
              SmartRS Inteligência Imobiliária &bull; Gestão de Ativos e Dossiês
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("⛔ ERRO DO RESEND:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log("✅ EMAIL ENVIADO COM SUCESSO!", data);
    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error("⛔ ERRO GERAL NA ROTA:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
