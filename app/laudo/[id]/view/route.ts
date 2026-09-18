import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function POST(
  request: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const laudoId = resolvedParams.id;
  
  if (!laudoId) {
    return NextResponse.json({ error: 'ID ausente' }, { status: 400 });
  }

  // 1. O Filtro de F5 (No Next.js 15, cookies() precisa do 'await')
  const cookieStore = await cookies();
  const cookieName = `viewed_laudo_${laudoId}`;
  
  if (cookieStore.has(cookieName)) {
    // Usuário já acessou hoje, retornamos sucesso rápido sem tocar no banco
    return NextResponse.json({ status: 'ignored', message: 'F5 bloqueado - View já contada' }, { status: 200 });
  }

  // 2. Incrementa no banco de dados
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Permissão para bypass RLS
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Chamada da RPC (Remote Procedure Call) no Supabase
  const { error } = await supabase.rpc('incrementar_visualizacao_laudo', { row_id: laudoId });

  if (error) {
    console.error("Erro ao incrementar view no banco:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 3. Planta o Cookie para impedir o F5
  const response = NextResponse.json({ status: 'counted', message: 'View contabilizada' }, { status: 200 });
  
  response.cookies.set(cookieName, 'true', {
    maxAge: 60 * 60 * 24, // 24 horas em segundos
    httpOnly: true,       // Impede XSS
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  return response;
}
