'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { User } from '@supabase/supabase-js'
import { Loader2 } from 'lucide-react'

interface RoleBasedDashboardProps {
  children: React.ReactNode
}

export function RoleBasedDashboard({ children }: RoleBasedDashboardProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    checkUserRole()
  }, [])

  const checkUserRole = async () => {
    try {
      setLoading(true)
      
      // Verificar sessão atual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session?.user) {
        router.push('/login')
        return
      }

      setUser(session.user)
      
      // Determinar role do usuário
      const role = await determineUserRole(session.user.id)
      setUserRole(role)
      
      // Redirecionar para o dashboard apropriado
      redirectToDashboard(role)
      
    } catch (error) {
      console.error('Erro ao verificar role do usuário:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const determineUserRole = async (userId: string): Promise<string> => {
    try {
      // Verificar se é admin (primeiro usuário)
      const { data: firstUser } = await supabase
        .from('users')
        .select('id')
        .order('created_at', { ascending: true })
        .limit(1)
        .single()

      if (firstUser?.id === userId) {
        return 'admin'
      }

      // Verificar assinatura ativa
      const { data: assinatura } = await supabase
        .from('assinaturas')
        .select('plano_id')
        .eq('user_id', userId)
        .eq('status', 'ativa')
        .single()

      if (!assinatura) {
        return 'cliente'
      }

      // Verificar se é afiliado (tem comissões)
      const { data: comissoes } = await supabase
        .from('comissoes')
        .select('id')
        .eq('afiliado_id', userId)
        .limit(1)

      if (comissoes && comissoes.length > 0) {
        return 'afiliado'
      }

      // Verificar se é parceiro (tem produtos cadastrados)
      const { data: produtos } = await supabase
        .from('acomodacoes')
        .select('id')
        .eq('user_id', userId)
        .limit(1)

      if (produtos && produtos.length > 0) {
        return 'parceiro'
      }

      // Verificar se tem produtos em outras tabelas
      const { data: transportes } = await supabase
        .from('transportes')
        .select('id')
        .eq('user_id', userId)
        .limit(1)

      if (transportes && transportes.length > 0) {
        return 'parceiro'
      }

      const { data: passeios } = await supabase
        .from('passeios')
        .select('id')
        .eq('user_id', userId)
        .limit(1)

      if (passeios && passeios.length > 0) {
        return 'parceiro'
      }

      return 'cliente'
      
    } catch (error) {
      console.error('Erro ao determinar role:', error)
      return 'cliente'
    }
  }

  const redirectToDashboard = (role: string) => {
    const currentPath = window.location.pathname
    const targetPath = `/dashboard/${role}`
    
    // Se já estiver no dashboard correto, não redirecionar
    if (currentPath.startsWith(targetPath)) {
      return
    }
    
    // Redirecionar para o dashboard apropriado
    router.push(targetPath)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    )
  }

  // Renderizar children apenas se estiver no dashboard correto
  const currentPath = window.location.pathname
  const expectedPath = userRole ? `/dashboard/${userRole}` : '/dashboard'
  
  if (!currentPath.startsWith(expectedPath)) {
    return null // Aguardando redirecionamento
  }

  return <>{children}</>
}