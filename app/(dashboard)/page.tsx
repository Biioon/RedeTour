'use client'

import { useSession } from '@/components/session-provider'

export default function DashboardPage() {
  const { user, loading } = useSession()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo, {user?.full_name || user?.email}!
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-6">
          <div className="text-2xl font-bold">0</div>
          <p className="text-sm text-muted-foreground">Total de Vendas</p>
        </div>
        
        <div className="rounded-lg border p-6">
          <div className="text-2xl font-bold">R$ 0,00</div>
          <p className="text-sm text-muted-foreground">Comissões Totais</p>
        </div>
        
        <div className="rounded-lg border p-6">
          <div className="text-2xl font-bold">0</div>
          <p className="text-sm text-muted-foreground">Afiliados</p>
        </div>
        
        <div className="rounded-lg border p-6">
          <div className="text-2xl font-bold">0</div>
          <p className="text-sm text-muted-foreground">Pacotes Ativos</p>
        </div>
      </div>

      {user && (
        <div className="rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Informações do Usuário</h2>
          <div className="space-y-2 text-sm">
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Nome:</strong> {user.full_name || 'Não informado'}</p>
            <p><strong>Função:</strong> {user.role || 'user'}</p>
          </div>
        </div>
      )}
    </div>
  )
}