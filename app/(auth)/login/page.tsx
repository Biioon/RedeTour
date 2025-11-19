'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthForm } from '@/components/auth/auth-form'
import { Button } from '@/components/ui/button'
import { useSession } from '@/components/session-provider'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const { signIn, loading } = useSession()
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = async (data: { email: string; password: string }) => {
    try {
      setError(null)
      console.log('[Login] Starting login process for:', data.email)
      
      await signIn(data.email, data.password)
      
      console.log('[Login] Login successful, should redirect to dashboard')
      // O redirecionamento é feito dentro do hook useAuth após login bem-sucedido
      
    } catch (error: any) {
      console.error('[Login] Login failed:', error)
      setError(error.message || 'Erro ao fazer login')
      toast.error(error.message || 'Erro ao fazer login')
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Entrar na RedeTour
          </h1>
          <p className="text-sm text-muted-foreground">
            Digite seu email e senha para acessar sua conta
          </p>
        </div>
        
        <AuthForm
          type="login"
          onSubmit={handleSignIn}
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
          <Link 
            href="/register" 
            className="hover:text-primary underline underline-offset-4"
          >
            Não tem uma conta? Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  )
}