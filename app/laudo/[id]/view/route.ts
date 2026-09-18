// app/api/laudos/[id]/view/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const laudoId = params.id;
  
  // 1. Verifica se o cookie das últimas 24h já existe
  const cookieStore = cookies();
  const cookieName = `viewed_laudo_${laudoId}`;
  
  if (cookieStore.has(cookieName)) {
    // Usuário já viu o laudo hoje. Retorna 200 mas NÃO incrementa o banco.
    return NextResponse.json({ status: 'ignored', message: 'F5 bloqueado' }, { status: 200 });
  }

  // 2. Conecta no Supabase contornando o RLS (usando a Service Role Key)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Necessário para dar UPDATE
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 3. Incrementa no banco de forma atômica usando a função RPC
  const { error } = await supabase.rpc('incrementar_visualizacao_laudo', { row_id: laudoId });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 4. Planta o cookie no navegador do usuário valendo por 24 horas
  const response = NextResponse.json({ status: 'counted', message: 'View contabilizada' }, { status: 200 });
  
  response.cookies.set(cookieName, 'true', {
    maxAge: 60 * 60 * 24, // 24 horas em segundos
    httpOnly: true,       // JavaScript do navegador não consegue ler/apagar
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  return response;
}
