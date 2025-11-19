'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthForm } from '@/components/auth/auth-form'
import { Button } from '@/components/ui/button'
import { useSession } from '@/components/session-provider'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  const { signUp, loading } = useSession()
  const [error, setError] = useState<string | null>(null)

  const handleSignUp = async (data: { email: string; password: string; fullName?: string }) => {
    try {
      setError(null)
      console.log('[Register] Starting registration process for:', data.email)
      
      await signUp(data.email, data.password, data.fullName || '')
      
      console.log('[Register] Registration successful, redirecting to login')
      // Redirecionar para login após registro bem-sucedido
      router.push('/login')
      
    } catch (error: any) {
      console.error('[Register] Registration failed:', error)
      setError(error.message || 'Erro ao criar conta')
      toast.error(error.message || 'Erro ao criar conta')
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Criar conta na RedeTour
          </h1>
          <p className="text-sm text-muted-foreground">
            Digite seus dados para criar sua conta
          </p>
        </div>
        
        <AuthForm
          type="register"
          onSubmit={handleSignUp}
          loading={loading}
          error={error}
        />
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Ou continue com
            </span>
          </div>
        </div>
        
        <Button variant="outline" type="button" disabled={loading}>
          Google
        </Button>
        
        <p className="px-8 text-center text-sm text-muted-foreground">
          Já tem uma conta?{' '}
          <Link 
            href="/login" 
            className="hover:text-primary underline underline-offset-4"
          >
            Faça login
          </Link>
        </p>
      </div>
    </div>
  )
}