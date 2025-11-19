import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Criar cliente do Supabase com tipagem
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'redetour-auth-token',
    flowType: 'pkce',
  },
  global: {
    headers: {
      'x-application-name': 'redetour',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Helper para verificar se o usuário está autenticado
export const isAuthenticated = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return !!session
}

// Helper para obter o usuário atual
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Helper para obter a sessão atual
export const getCurrentSession = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// Helper para fazer logout
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Erro ao fazer logout:', error)
    throw error
  }
}

// Helper para refresh token
export const refreshSession = async () => {
  const { data: { session }, error } = await supabase.auth.refreshSession()
  if (error) {
    console.error('Erro ao refresh token:', error)
    throw error
  }
  return session
}

// Exportar tipos úteis
export type User = Database['public']['Tables']['users']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Affiliate = Database['public']['Tables']['affiliates']['Row']
export type Commission = Database['public']['Tables']['commissions']['Row']
export type Booking = Database['public']['Tables']['bookings']['Row']

export default supabase