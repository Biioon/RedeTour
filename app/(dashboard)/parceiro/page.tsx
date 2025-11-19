'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Package, 
  DollarSign, 
  TrendingUp, 
  Star,
  Clock,
  Eye,
  Plus,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  Settings,
  Users,
  Calendar,
  MessageSquare,
  MapPin,
  CreditCard
} from 'lucide-react'
import { MetricCard, ChartCard, ActivityCard, NotificationCard, QuickActionsCard } from '@/components/dashboard/dashboard-cards'
import { getParceiroDashboardData, getNotificacoes, marcarNotificacaoComoLida } from '@/lib/actions/dashboard'
import type { ParceiroDashboardData, Notificacao } from '@/types/dashboard'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'

export default function Page() {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ParceiroDashboardData | null>(null)
  const [notifications, setNotifications] = useState<Notificacao[]>([])
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [parceiroData, notificacoesData] = await Promise.all([
        getParceiroDashboardData(),
        getNotificacoes()
      ])
      setData(parceiroData)
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

  const handleEditProduct = (productId: string, type: string) => {
    router.push(`/dashboard/products/${type}/${productId}`)
  }

  const handleCreateProduct = () => {
    router.push('/dashboard/products')
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      confirmada: { label: 'Confirmada', variant: 'default' as const },
      pendente: { label: 'Pendente', variant: 'secondary' as const },
      cancelada: { label: 'Cancelada', variant: 'destructive' as const },
      reembolsada: { label: 'Reembolsada', variant: 'outline' as const },
    }
    return badges[status as keyof typeof badges] || badges.pendente
  }

  const getProductTypeIcon = (type: string) => {
    const icons = {
      acomodacao: <Package className="w-4 h-4" />,
      transporte: <MapPin className="w-4 h-4" />,
      passeio: <Calendar className="w-4 h-4" />,
    }
    return icons[type as keyof typeof icons] || <Package className="w-4 h-4" />
  }

  const getProductTypeLabel = (type: string) => {
    const labels = {
      acomodacao: 'Acomodação',
      transporte: 'Transporte',
      passeio: 'Passeio',
    }
    return labels[type as keyof typeof labels] || type
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dashboard do parceiro...</p>
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
      {/* Header com Status do Parceiro */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Dashboard do Parceiro</h1>
                <p className="text-muted-foreground">Gerencie seus produtos e acompanhe suas vendas</p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="default" className="text-sm">
                <Star className="w-3 h-3 mr-1" />
                Parceiro Ativo
              </Badge>
              <p className="text-sm text-muted-foreground mt-1">
                Avaliação: {data.resumo_negocio.avaliacao_media}/5.0
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Métricas do Negócio */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Meus Produtos"
          value={data.resumo_negocio.total_produtos}
          description={`${data.resumo_negocio.produtos_ativos} ativos`}
          icon={<Package className="h-4 w-4" />}
          trend={{ value: 15.2, isPositive: true }}
        />
        
        <MetricCard
          title="Total de Vendas"
          value={data.resumo_negocio.total_vendas.toLocaleString('pt-BR')}
          description="vendas realizadas"
          icon={<TrendingUp className="h-4 w-4" />}
          trend={{ value: 22.8, isPositive: true }}
        />
        
        <MetricCard
          title="Receita Total"
          value={data.resumo_negocio.receita_total.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })}
          description="em vendas confirmadas"
          icon={<DollarSign className="h-4 w-4" />}
          trend={{ value: 18.5, isPositive: true }}
        />
        
        <MetricCard
          title="Comissões Pagas"
          value={data.resumo_negocio.comissoes_pagas.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })}
          description="à plataforma"
          icon={<CreditCard className="h-4 w-4" />}
        />
      </div>

      {/* Ações Rápidas do Parceiro */}
      <QuickActionsCard
        actions={[
          {
            title: 'Novo Produto',
            description: 'Cadastrar novo produto',
            icon={<Plus className="h-5 w-5" />,
            href: '/dashboard/products',
            variant: 'default'
          },
          {
            title: 'Gerenciar Produtos',
            description: 'Editar seus produtos',
            icon={<Edit className="h-5 w-5" />,
            href: '/dashboard/products',
            variant: 'outline'
          },
          {
            title: 'Ver Vendas',
            description: 'Acompanhar suas vendas',
            icon={<DollarSign className="h-5 w-5" />,
            href: '/dashboard/vendas',
            variant: 'outline'
          },
          {
            title: 'Financeiro',
            description: 'Resumo financeiro',
            icon={<TrendingUp className="h-5 w-5" />,
            href: '/dashboard/financeiro',
            variant: 'outline'
          }
        ]}
      />

      {/* Meus Produtos */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Meus Produtos</CardTitle>
              <CardDescription>
                Seus produtos cadastrados na plataforma
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCreateProduct}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Ver Todos
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.meus_produtos.acomodacoes.length > 0 ? (
              data.meus_produtos.acomodacoes.map((produto) => (
                <div key={produto.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {getProductTypeIcon(produto.tipo)}
                    </div>
                    <div>
                      <h4 className="font-medium">{produto.nome}</h4>
                      <p className="text-sm text-muted-foreground">
                        {getProductTypeLabel(produto.tipo)} • {produto.localizacao}
                      </p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          R$ {produto.preco}/noite
                        </Badge>
                        {produto.ativo ? (
                          <Badge variant="default" className="text-xs">
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Inativo
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditProduct(produto.id, 'acomodacoes')}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum produto cadastrado ainda</p>
                <Button className="mt-4" onClick={handleCreateProduct}>
                  Cadastrar Primeiro Produto
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Segunda Linha - Vendas e Analytics */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Vendas Recentes dos Meus Produtos */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Vendas Recentes</CardTitle>
                <CardDescription>
                  Últimas vendas dos seus produtos
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Ver Todas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.vendas_produtos.length > 0 ? (
                data.vendas_produtos.slice(0, 5).map((venda) => (
                  <div key={venda.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <h4 className="font-medium">{venda.produto_nome}</h4>
                      <p className="text-sm text-muted-foreground">
                        {venda.cliente_nome} • {new Date(venda.data_venda).toLocaleDateString('pt-BR')}
                      </p>
                      <div className="flex gap-2 mt-1">
                        <Badge {...getStatusBadge(venda.status)} className="text-xs">
                          {venda.status}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {new Date(venda.data_viagem).toLocaleDateString('pt-BR')}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {venda.valor.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Líquido: {venda.valor_liquido.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhuma venda realizada ainda</p>
                  <Button className="mt-4" onClick={handleCreateProduct}>
                    Cadastrar Produto
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Analytics dos Meus Produtos */}
        <ChartCard
          title="Analytics dos Produtos"
          description="Performance dos seus produtos"
        >
          <div className="space-y-3">
            {data.analytics_produtos.map((analytics, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <h4 className="font-medium">{analytics.produto_nome}</h4>
                  <p className="text-sm text-muted-foreground">
                    {analytics.visualizacoes} visualizações • {analytics.vendas} vendas
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    {analytics.receita.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {analytics.taxa_conversao.toFixed(1)}% conversão
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Feedback dos Clientes */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Feedback dos Clientes</CardTitle>
              <CardDescription>
                Avaliações e comentários sobre seus produtos
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              Ver Todos
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.feedback_clientes.map((feedback) => (
              <div key={feedback.id} className="p-4 bg-muted rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{feedback.cliente_nome}</h4>
                    <p className="text-sm text-muted-foreground">
                      {feedback.produto_nome}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < feedback.avaliacao ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm mb-3">{feedback.comentario}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{new Date(feedback.data).toLocaleDateString('pt-BR')}</span>
                  {!feedback.respondido && (
                    <Button size="sm" variant="outline">
                      Responder
                    </Button>
                  )}
                </div>
                {feedback.resposta && (
                  <div className="mt-3 p-3 bg-white rounded border">
                    <p className="text-sm font-medium mb-1">Sua resposta:</p>
                    <p className="text-sm">{feedback.resposta}</p>
                  </div>
                )}
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