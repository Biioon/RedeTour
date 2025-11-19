'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/supabaseClient'
import type { User } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  full_name?: string | null
  role?: 'user' | 'admin' | 'affiliate'
  avatar_url?: string | null
}

interface UseAuthReturn {
  user: AuthUser | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Verificar sessão atual
    checkUser()

    // Ouvir mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Auth] Event:', event, 'Session:', !!session)
        
        if (event === 'SIGNED_IN' && session?.user) {
          await fetchUserProfile(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          router.push('/login')
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          await fetchUserProfile(session.user.id)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const checkUser = async () => {
    try {
      setLoading(true)
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('[Auth] Error getting session:', error)
        throw error
      }

      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('[Auth] Error checking user:', error)
      setError('Erro ao verificar usuário')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, avatar_url')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('[Auth] Error fetching profile:', error)
        throw error
      }

      if (profile) {
        setUser({
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          role: profile.role,
          avatar_url: profile.avatar_url,
        })
      }
    } catch (error) {
      console.error('[Auth] Error fetching user profile:', error)
      // Se não houver perfil, usar dados do auth
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser({
          id: user.id,
          email: user.email!,
        })
      }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)

      console.log('[Auth] Attempting sign in for:', email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('[Auth] Sign in error:', error)
        throw error
      }

      if (data.user) {
        await fetchUserProfile(data.user.id)
        
        // Mostrar notificação de sucesso
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('show-toast', {
            detail: { message: 'Login realizado com sucesso!', type: 'success' }
          })
          window.dispatchEvent(event)
        }
        
        router.push('/dashboard')
        console.log('[Auth] Sign in successful, redirecting to dashboard')
      }
    } catch (error: any) {
      console.error('[Auth] Sign in failed:', error)
      const errorMessage = getAuthErrorMessage(error)
      setError(errorMessage)
      
      // Mostrar notificação de erro
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('show-toast', {
          detail: { message: errorMessage, type: 'error' }
        })
        window.dispatchEvent(event)
      }
      
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true)
      setError(null)

      console.log('[Auth] Attempting sign up for:', email)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        console.error('[Auth] Sign up error:', error)
        throw error
      }

      if (data.user) {
        // Criar perfil na tabela profiles
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            full_name: fullName,
            role: 'user',
          })

        if (profileError) {
          console.error('[Auth] Profile creation error:', profileError)
          throw profileError
        }

        // Mostrar notificação de sucesso
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('show-toast', {
            detail: { message: 'Cadastro realizado com sucesso! Verifique seu email.', type: 'success' }
          })
          window.dispatchEvent(event)
        }
        
        console.log('[Auth] Sign up successful, profile created')
      }
    } catch (error: any) {
      console.error('[Auth] Sign up failed:', error)
      const errorMessage = getAuthErrorMessage(error)
      setError(errorMessage)
      
      // Mostrar notificação de erro
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('show-toast', {
          detail: { message: errorMessage, type: 'error' }
        })
        window.dispatchEvent(event)
      }
      
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      console.log('[Auth] Signing out...')

      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('[Auth] Sign out error:', error)
        throw error
      }

      setUser(null)
      
      // Mostrar notificação de sucesso
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('show-toast', {
          detail: { message: 'Logout realizado com sucesso!', type: 'success' }
        })
        window.dispatchEvent(event)
      }
      
      router.push('/login')
      console.log('[Auth] Sign out successful')
    } catch (error: any) {
      console.error('[Auth] Sign out failed:', error)
      const errorMessage = getAuthErrorMessage(error)
      setError(errorMessage)
      
      // Mostrar notificação de erro
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('show-toast', {
          detail: { message: errorMessage, type: 'error' }
        })
        window.dispatchEvent(event)
      }
      
      throw error
    } finally {
      setLoading(false)
    }
  }

  const refreshSession = async () => {
    try {
      console.log('[Auth] Refreshing session...')
      const { data: { session }, error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.error('[Auth] Session refresh error:', error)
        throw error
      }

      if (session?.user) {
        await fetchUserProfile(session.user.id)
        console.log('[Auth] Session refreshed successfully')
      }
    } catch (error) {
      console.error('[Auth] Session refresh failed:', error)
      // Não lançar erro aqui para não quebrar a aplicação
    }
  }

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    refreshSession,
  }
}

function getAuthErrorMessage(error: any): string {
  if (error.message) {
    if (error.message.includes('Invalid login credentials')) {
      return 'Email ou senha incorretos'
    }
    if (error.message.includes('Email not confirmed')) {
      return 'Email não confirmado. Verifique sua caixa de entrada'
    }
    if (error.message.includes('User already registered')) {
      return 'Usuário já cadastrado'
    }
    if (error.message.includes('Network request failed')) {
      return 'Erro de conexão. Verifique sua internet'
    }
    return error.message
  }
  
  return 'Erro ao processar solicitação'
}