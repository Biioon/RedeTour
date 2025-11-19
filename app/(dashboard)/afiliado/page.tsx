'use client'

import * as React from 'react'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Link, 
  Trophy,
  Star,
  Target,
  Calendar,
  Eye,
  Copy,
  RefreshCw,
  Share2,
  Download,
  Settings,
  Bell
} from 'lucide-react'
import { MetricCard, ChartCard, ActivityCard, NotificationCard, QuickActionsCard, ProgressCard } from '@/components/dashboard/dashboard-cards'
import { getAfiliadoDashboardData, getNotificacoes, marcarNotificacaoComoLida } from '@/lib/actions/dashboard'
import type { AfiliadoDashboardData, Notificacao } from '@/types/dashboard'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'

export default function AfiliadoDashboardPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AfiliadoDashboardData | null>(null)
  const [notifications, setNotifications] = useState<Notificacao[]>([])
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [afiliadoData, notificacoesData] = await Promise.all([
        getAfiliadoDashboardData(),
        getNotificacoes()
      ])
      setData(afiliadoData)
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

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url)
    toast({
      title: 'Link copiado!',
      description: 'Link de afiliado copiado para a área de transferência'
    })
  }

  const handleCreateCampaign = () => {
    router.push('/dashboard/afiliado/campanhas/nova')
  }

  const getNivelAfiliadoBadge = (nivel: string) => {
    const badges = {
      bronze: { label: 'Bronze', variant: 'secondary' as const, color: 'text-amber-600' },
      prata: { label: 'Prata', variant: 'default' as const, color: 'text-gray-600' },
      ouro: { label: 'Ouro', variant: 'default' as const, color: 'text-yellow-600' },
      diamante: { label: 'Diamante', variant: 'default' as const, color: 'text-blue-600' },
    }
    return badges[nivel as keyof typeof badges] || badges.bronze
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dashboard de afiliado...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Erro ao carregar seus dados</p>
        <Button onClick={loadData} className="mt-4">
          Tentar Novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com Status do Afiliado */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Dashboard de Afiliado</h1>
                <p className="text-muted-foreground">Acompanhe suas comissões e performance</p>
              </div>
            </div>
            <div className="text-right">
              <Badge {...getNivelAfiliadoBadge(data.resumo_performance.nivel_afiliado)} className="text-sm">
                <Star className="w-3 h-3 mr-1" />
                {data.resumo_performance.nivel_afiliado.charAt(0).toUpperCase() + data.resumo_performance.nivel_afiliado.slice(1)}
              </Badge>
              <p className="text-sm text-muted-foreground mt-1">
                Posição #{data.ranking.posicao} de {data.ranking.total_afiliados}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Métricas de Performance */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total de Comissões"
          value={data.resumo_performance.total_comissoes.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })}
          description="desde o início"
          icon={<DollarSign className="h-4 w-4" />}
          trend={{ value: 25.3, isPositive: true }}
        />
        
        <MetricCard
          title="Comissões Pendentes"
          value={data.resumo_performance.comissoes_pendentes.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })}
          description="aguardando pagamento"
          icon={<Clock className="h-4 w-4" />}
          className="border-yellow-200 bg-yellow-50"
        />
        
        <MetricCard
          title="Total de Indicações"
          value={data.resumo_performance.total_indicacoes.toLocaleString('pt-BR')}
          description={data.resumo_performance.taxa_conversao.toFixed(1) + '% de conversão'}
          icon={<Users className="h-4 w-4" />}
          trend={{ value: data.resumo_performance.taxa_conversao, isPositive: data.resumo_performance.taxa_conversao > 3 }}
        />
        
        <MetricCard
          title="Comissão Média"
          value={data.resumo_performance.valor_medio_comissao.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })}
          description="por indicação"
          icon={<TrendingUp className="h-4 w-4" />}
          trend={{ value: 12.7, isPositive: true }}
        />
      </div>

      {/* Progresso para Próximo Nível */}
      <ProgressCard
        title="Progresso para Próximo Nível"
        current={data.resumo_performance.total_comissoes}
        target={data.resumo_performance.proximo_nivel.requisito}
        label={`R$ ${data.resumo_performance.total_comissoes.toLocaleString('pt-BR')} / R$ ${data.resumo_performance.proximo_nivel.requisito.toLocaleString('pt-BR')}`}
        color="purple"
      />

      {/* Ações Rápidas do Afiliado */}
      <QuickActionsCard
        actions={[
          {
            title: 'Criar Campanha',
            description: 'Criar nova campanha de afiliado',
            icon={<Target className="h-5 w-5" />,
            href: '/dashboard/afiliado/campanhas/nova',
            variant: 'default'
          },
          {
            title: 'Gerar Link',
            description: 'Criar link de afiliado',
            icon={<Link className="h-5 w-5" />,
            href: '/dashboard/afiliado/links',
            variant: 'outline'
          },
          {
            title: 'Ver Estatísticas',
            description: 'Análise detalhada',
            icon={<TrendingUp className="h-5 w-5" />,
            href: '/dashboard/afiliado/estatisticas',
            variant: 'outline'
          },
          {
            title: 'Sacar Comissões',
            description: 'Resgatar comissões',
            icon={<DollarSign className="h-5 w-5" />,
            href: '/dashboard/afiliado/saque',
            variant: 'outline'
          }
        ]}
      />

      {/* Links de Afiliado */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Seus Links de Afiliado</CardTitle>
              <CardDescription>
                Links ativos para compartilhar e ganhar comissões
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleCreateCampaign}>
              <Target className="h-4 w-4 mr-2" />
              Nova Campanha
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.links_afiliado.map((link) => (
              <div key={link.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{link.nome_campanha}</h4>
                  <p className="text-sm text-muted-foreground font-mono">
                    {link.url}
                  </p>
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{link.clicks} cliques</span>
                    <span>{link.conversoes} conversões</span>
                    <span>{link.taxa_conversao}% taxa</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyLink(link.url)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(link.url, '_blank')}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Segunda Linha - Estatísticas e Ranking */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Estatísticas Mensais */}
        <ChartCard
          title="Estatísticas Mensais"
          description="Sua performance nos últimos 6 meses"
        >
          <div className="space-y-3">
            {data.estatisticas_mensais.map((stat, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{stat.mes}</p>
                  <p className="text-sm text-muted-foreground">
                    {stat.indicacoes} indicações
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    {stat.comissoes.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stat.conversao}% conversão
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Ranking dos Top Afiliados */}
        <ChartCard
          title="Ranking dos Top Afiliados"
          description="Você está em #{data.ranking.posicao} lugar"
        >
          <div className="space-y-3">
            {data.ranking.top_afiliados.map((afiliado, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium">{afiliado.nome}</p>
                    <p className="text-sm text-muted-foreground">Afiliado</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    {afiliado.comissoes.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Comissões Recentes */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Comissões Recentes</CardTitle>
              <CardDescription>
                Suas últimas comissões recebidas
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
            {data.comissoes_recentes.map((comissao) => (
              <div key={comissao.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <h4 className="font-medium">{comissao.descricao}</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(comissao.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    {comissao.valor_comissao.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </p>
                  <Badge 
                    variant={comissao.status === 'paga' ? 'default' : 'secondary'}
                    className="text-xs mt-1"
                  >
                    {comissao.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notificações */}
      <NotificationCard
        notifications={notifications}
        onMarkAsRead={handleMarkNotificationAsRead}
      />
    </div>
  )
}