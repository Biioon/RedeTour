'use client'

import { createContext, useContext, ReactNode, useEffect } from 'react'
import { useAuth, AuthUser } from '@/hooks/useAuth'
import { toast } from 'sonner'

interface SessionContextType {
  user: AuthUser | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

interface SessionProviderProps {
  children: ReactNode
}

export function SessionProvider({ children }: SessionProviderProps) {
  const auth = useAuth()

  // Adicionar listener para eventos de toast
  useEffect(() => {
    const handleToastEvent = (event: CustomEvent<{ message: string; type: 'success' | 'error' }>) => {
      const { message, type } = event.detail
      
      if (type === 'success') {
        toast.success(message)
      } else if (type === 'error') {
        toast.error(message)
      }
    }

    window.addEventListener('show-toast', handleToastEvent as EventListener)

    return () => {
      window.removeEventListener('show-toast', handleToastEvent as EventListener)
    }
  }, [])

  return (
    <SessionContext.Provider value={auth}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}