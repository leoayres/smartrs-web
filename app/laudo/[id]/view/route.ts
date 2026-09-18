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

  // 1. FILTRO DE COOKIE (Back-End)
  const cookieStore = await cookies();
  const cookieName = `viewed_laudo_${laudoId}`;
  
  // Se o cookie existe, recusa silenciosamente (não gasta processamento do banco)
  if (cookieStore.has(cookieName)) {
    return NextResponse.json({ status: 'ignored', message: 'F5 bloqueado pelo cookie' }, { status: 200 });
  }

  // 2. INCREMENTO DIRETO NO BANCO
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Necessário para bypass de segurança
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { error } = await supabase.rpc('incrementar_visualizacao_laudo', { row_id: laudoId });

  if (error) {
    console.error("Erro ao incrementar view no banco:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 3. PLANTA O COOKIE DE SEGURANÇA POR 24 HORAS
  const response = NextResponse.json({ status: 'counted', message: 'View contabilizada' }, { status: 200 });
  
  response.cookies.set(cookieName, 'true', {
    maxAge: 60 * 60 * 24, // 24 horas
    httpOnly: true,       // Impede manipulação por JavaScript do lado do cliente
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  return response;
}
