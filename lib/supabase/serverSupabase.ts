import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

// Configuração do Supabase para Server Components
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Criar cliente para Server Components
export const createServerClient = () => {
  const cookieStore = cookies()
  
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: '', ...options })
      },
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'redetour-auth-token',
      flowType: 'pkce',
    },
    global: {
      headers: {
        'x-application-name': 'redetour-server',
      },
    },
  })
}

// Criar cliente com service role (apenas para admin)
export const createAdminClient = () => {
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        'x-application-name': 'redetour-admin',
      },
    },
  })
}

// Helpers para Server Components
export const getServerSession = async () => {
  const supabase = createServerClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('Erro ao obter sessão no servidor:', error)
    return null
  }
  
  return session
}

export const getServerUser = async () => {
  const supabase = createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Erro ao obter usuário no servidor:', error)
    return null
  }
  
  return user
}

// Helper para proteger rotas
export const requireAuth = async () => {
  const session = await getServerSession()
  
  if (!session) {
    throw new Error('Não autorizado')
  }
  
  return session
}

// Helper para obter dados do usuário com perfil
export const getServerUserWithProfile = async () => {
  const supabase = createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return null
  }
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (profileError) {
    console.error('Erro ao obter perfil:', profileError)
    return { user, profile: null }
  }
  
  return { user, profile }
}