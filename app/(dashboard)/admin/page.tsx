'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Package, 
  BarChart3,
  Calendar,
  Eye,
  Download,
  RefreshCw,
  Settings,
  Bell,
  Search
} from 'lucide-react'
import { MetricCard, ChartCard, ActivityCard, NotificationCard, QuickActionsCard } from '@/components/dashboard/dashboard-cards'
import { SalesChart, UserGrowthChart } from '@/components/dashboard/dashboard-charts'
import { getAdminDashboardData, getNotificacoes, marcarNotificacaoComoLida } from '@/lib/actions/dashboard'
import type { AdminDashboardData, Notificacao } from '@/types/dashboard'
import { useToast } from '@/components/ui/use-toast'

export default function AdminDashboardPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AdminDashboardData | null>(null)
  const [notifications, setNotifications] = useState<Notificacao[]>([])
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [dashboardData, notificacoesData] = await Promise.all([
        getAdminDashboardData(),
        getNotificacoes()
      ])
      setData(dashboardData)
      setNotifications(notificacoesData)
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados do dashboard',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
    toast({
      title: 'Sucesso',
      description: 'Dashboard atualizado com sucesso'
    })
  }

  const handleMarkNotificationAsRead = async (notificationId: string) => {
    try {
      await marcarNotificacaoComoLida(notificationId)
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, lida: true } : n)
      )
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dashboard administrativo...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Erro ao carregar dados do dashboard</p>
        <Button onClick={loadData} className="mt-4">
          Tentar Novamente
        </Button>
      </div>
    )
  }

  const crescimentoVendas = data.resumo_geral.crescimento_percentual
  const isCrescimentoPositivo = crescimentoVendas >= 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Administrativo</h1>
          <p className="text-muted-foreground">
            Visão geral completa da plataforma RedeTour
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurar
          </Button>
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Notificações
          </Button>
          <Button onClick={handleRefresh} disabled={refreshing} size="sm">
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total de Usuários"
          value={data.resumo_geral.total_usuarios.toLocaleString('pt-BR')}
          description={`${data.resumo_geral.usuarios_ativos} ativos`}
          icon={<Users className="h-4 w-4" />}
          trend={{ value: 12.5, isPositive: true }}
        />
        
        <MetricCard
          title="Total de Vendas"
          value={data.resumo_geral.total_vendas.toLocaleString('pt-BR')}
          description={data.resumo_geral.total_vendas === 1 ? 'venda realizada' : 'vendas realizadas'}
          icon={<DollarSign className="h-4 w-4" />}
          trend={{ value: Math.abs(crescimentoVendas), isPositive: isCrescimentoPositivo }}
        />
        
        <MetricCard
          title="Receita Total"
          value={data.resumo_geral.total_receita.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })}
          description="em vendas confirmadas"
          icon={<TrendingUp className="h-4 w-4" />}
          trend={{ value: 8.2, isPositive: true }}
        />
        
        <MetricCard
          title="Ticket Médio"
          value={data.resumo_geral.ticket_medio.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })}
          description="por venda"
          icon={<BarChart3 className="h-4 w-4" />}
          trend={{ value: 5.1, isPositive: true }}
        />
      </div>

      {/* Ações Rápidas */}
      <QuickActionsCard
        actions={[
          {
            title: 'Nova Venda',
            description: 'Registrar venda manual',
            icon: <DollarSign className="h-5 w-5" />,
            href: '/dashboard/vendas/nova',
            variant: 'default'
          },
          {
            title: 'Gerenciar Usuários',
            description: 'Ver e editar usuários',
            icon: <Users className="h-5 w-5" />,
            href: '/dashboard/usuarios',
            variant: 'outline'
          },
          {
            title: 'Relatórios',
            description: 'Gerar relatórios detalhados',
            icon: <BarChart3 className="h-5 w-5" />,
            href: '/dashboard/relatorios',
            variant: 'outline'
          },
          {
            title: 'Configurações',
            description: 'Configurar sistema',
            icon: <Settings className="h-5 w-5" />,
            href: '/dashboard/configuracoes',
            variant: 'outline'
          }
        ]}
      />

      {/* Segunda Linha - Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Gráfico de Vendas */}
        <ChartCard
          title="Vendas por Mês"
          description="Evolução das vendas nos últimos 6 meses"
        >
          <SalesChart 
            data={data.vendas_por_tipo.map(item => ({
              mes: item.tipo,
              vendas: item.quantidade,
              receita: item.valor_total
            }))}
          />
        </ChartCard>

        {/* Gráfico de Crescimento de Usuários */}
        <ChartCard
          title="Crescimento de Usuários"
          description="Novos usuários cadastrados por mês"
        >
          <UserGrowthChart 
            data={data.usuarios_novos.map(item => ({
              mes: item.data.slice(0, 7),
              novos_usuarios: item.quantidade,
              usuarios_totais: item.quantidade * 5 // Mock data
            }))}
          />
        </ChartCard>
      </div>

      {/* Terceira Linha - Cards de Detalhes */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Vendas por Tipo */}
        <ChartCard
          title="Vendas por Tipo"
          description="Distribuição de vendas por categoria"
        >
          <div className="space-y-3">
            {data.vendas_por_tipo.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm capitalize">{item.tipo.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{item.quantidade}</Badge>
                  <span className="text-sm font-medium">
                    {item.valor_total.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Atividades Recentes */}
        <ActivityCard
          activities={data.atividades_recentes}
        />

        {/* Notificações */}
        <NotificationCard
          notifications={notifications}
          onMarkAsRead={handleMarkNotificationAsRead}
        />
      </div>

      {/* Terceira Linha - Cards de Detalhes */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Vendas Recentes */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Vendas Recentes</CardTitle>
                <CardDescription>
                  Últimas vendas realizadas na plataforma
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Ver todas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.vendas_recentes.map((venda) => (
                <div key={venda.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{venda.cliente_nome}</p>
                    <p className="text-sm text-muted-foreground">{venda.produto_nome}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {venda.valor_final.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </p>
                    <Badge 
                      variant={venda.status === 'confirmada' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {venda.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Usuários Recentes */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Usuários Recentes</CardTitle>
                <CardDescription>
                  Novos usuários cadastrados na plataforma
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Ver todos
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.usuarios_recentes.map((usuario) => (
                <div key={usuario.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {usuario.nome.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{usuario.nome}</p>
                      <p className="text-sm text-muted-foreground">{usuario.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="text-xs">
                      {usuario.tipo}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(usuario.data_cadastro).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comissões Pendentes */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Comissões Pendentes</CardTitle>
              <CardDescription>
                Comissões de afiliados aguardando pagamento
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.comissoes_pendentes.map((comissao) => (
              <div key={comissao.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div>
                  <p className="font-medium">Comissão #{comissao.id.slice(-6)}</p>
                  <p className="text-sm text-muted-foreground">
                    {comissao.descricao}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-yellow-800">
                    {comissao.valor_comissao.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </p>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {comissao.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}