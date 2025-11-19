import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/serverSupabase'

export async function POST(request: Request) {
  try {
    console.log('[Logout API] Processing logout request...')
    
    const supabase = createServerClient()
    
    // Fazer logout no Supabase
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('[Logout API] Supabase logout error:', error)
      return NextResponse.json(
        { error: 'Erro ao fazer logout' },
        { status: 500 }
      )
    }

    console.log('[Logout API] Logout successful')
    
    // Criar resposta com redirecionamento
    const response = NextResponse.json(
      { message: 'Logout realizado com sucesso' },
      { status: 200 }
    )

    // Limpar cookies de sessão (o Supabase SSR já faz isso automaticamente)
    // Mas podemos adicionar headers adicionais se necessário
    response.cookies.set('sb-access-token', '', { 
      maxAge: 0,
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
    
    response.cookies.set('sb-refresh-token', '', { 
      maxAge: 0,
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })

    return response
    
  } catch (error) {
    console.error('[Logout API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}