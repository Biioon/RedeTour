'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Calendar, 
  MapPin, 
  DollarSign,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  Star,
  Gift,
  CreditCard,
  Heart,
  Share2,
  Download
} from 'lucide-react'
import { MetricCard, ChartCard, ActivityCard, NotificationCard, QuickActionsCard } from '@/components/dashboard/dashboard-cards'
import { getClienteDashboardData, getNotificacoes, marcarNotificacaoComoLida } from '@/lib/actions/dashboard'
import { getFavoritos } from '@/lib/actions/favorites'
import type { ClienteDashboardData, Notificacao } from '@/types/dashboard'
import { useToast } from '@/components/ui/use-toast'

export default function ClienteDashboardPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ClienteDashboardData | null>(null)
  const [notifications, setNotifications] = useState<Notificacao[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [favoritosCount, setFavoritosCount] = useState(0)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [clienteData, notificacoesData, favoritosData] = await Promise.all([
        getClienteDashboardData(),
        getNotificacoes(),
        getFavoritos()
      ])
      setData(clienteData)
      setNotifications(notificacoesData)
      setFavoritosCount(favoritosData.length)
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

  const getStatusBadge = (status: string) => {
    const badges = {
      confirmada: { label: 'Confirmada', variant: 'default' as const },
      pendente: { label: 'Pendente', variant: 'secondary' as const },
      cancelada: { label: 'Cancelada', variant: 'destructive' as const },
      reembolsada: { label: 'Reembolsada', variant: 'outline' as const },
    }
    return badges[status as keyof typeof badges] || badges.pendente
  }

  const getNivelClienteBadge = (nivel: string) => {
    const badges = {
      bronze: { label: 'Bronze', variant: 'secondary' as const },
      prata: { label: 'Prata', variant: 'default' as const },
      ouro: { label: 'Ouro', variant: 'default' as const },
      diamante: { label: 'Diamante', variant: 'default' as const },
    }
    return badges[nivel as keyof typeof badges] || badges.bronze
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando seu dashboard...</p>
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
      {/* Header com Perfil do Cliente */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Bem-vindo de volta!</h1>
                <p className="text-muted-foreground">Acompanhe suas compras e reservas</p>
              </div>
            </div>
            <div className="text-right">
              <Badge {...getNivelClienteBadge(data.resumo_pessoal.nivel_cliente)} className="text-sm">
                <Star className="w-3 h-3 mr-1" />
                {data.resumo_pessoal.nivel_cliente.charAt(0).toUpperCase() + data.resumo_pessoal.nivel_cliente.slice(1)}
              </Badge>
              <p className="text-sm text-muted-foreground mt-1">
                {data.resumo_pessoal.pontos_fidelidade} pontos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Métricas Pessoais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Minhas Compras"
          value={data.resumo_pessoal.total_compras}
          description={`${data.resumo_pessoal.reservas_ativas} reservas ativas`}
          icon={<Package className="h-4 w-4" />}
          trend={{ value: 15.2, isPositive: true }}
        />
        
        <MetricCard
          title="Total Gasto"
          value={data.resumo_pessoal.valor_total_gasto.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })}
          description="em compras realizadas"
          icon={<DollarSign className="h-4 w-4" />}
          trend={{ value: 8.5, isPositive: true }}
        />
        
        <MetricCard
          title="Próxima Viagem"
          value={data.resumo_pessoal.proxima_viagem ? 
            new Date(data.resumo_pessoal.proxima_viagem).toLocaleDateString('pt-BR') : 
            'Nenhuma programada'
          }
          description={data.resumo_pessoal.proxima_viagem ? 
            `${Math.ceil((new Date(data.resumo_pessoal.proxima_viagem).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} dias` : 
            'Reserve agora!'
          }
          icon={<Calendar className="h-4 w-4" />}
        />
        
        <MetricCard
          title="Meus Favoritos"
          value={favoritosCount}
          description="produtos salvos"
          icon={<Heart className="h-4 w-4" />}
          href="/dashboard/favoritos"
        />
        
        <MetricCard
          title="Pontos de Fidelidade"
          value={data.resumo_pessoal.pontos_fidelidade}
          description="pontos acumulados"
          icon={<Gift className="h-4 w-4" />}
          trend={{ value: 22.1, isPositive: true }}
        />
      </div>

      {/* Ações Rápidas do Cliente */}
      <QuickActionsCard
        actions={[
          {
            title: 'Nova Reserva',
            description: 'Reserve sua próxima viagem',
            icon={<Calendar className="h-5 w-5" />,
            href: '/dashboard/reservas/nova',
            variant: 'default'
          },
          {
            title: 'Meus Favoritos',
            description: 'Ver produtos salvos',
            icon={<Heart className="h-5 w-5" />,
            href: '/dashboard/favoritos',
            variant: 'outline'
          },
          {
            title: 'Histórico',
            description: 'Ver todas as compras',
            icon={<CreditCard className="h-5 w-5" />,
            href: '/dashboard/historico',
            variant: 'outline'
          },
          {
            title: 'Compartilhar',
            description: 'Indique para amigos',
            icon={<Share2 className="h-5 w-5" />,
            href: '/dashboard/indicar',
            variant: 'outline'
          }
        ]}
      />

      {/* Minhas Reservas */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Minhas Reservas</CardTitle>
              <CardDescription>
                Suas próximas viagens agendadas
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
            {data.minhas_reservas.length > 0 ? (
              data.minhas_reservas.map((reserva) => (
                <div key={reserva.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{reserva.produto_nome}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(reserva.data_checkin).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {Math.ceil((new Date(reserva.data_checkin).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} dias
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {reserva.valor.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </p>
                    <Badge {...getStatusBadge(reserva.status)} className="text-xs mt-1">
                      {reserva.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma reserva ativa no momento</p>
                <Button className="mt-4">
                  Fazer Nova Reserva
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Segunda Linha - Compras e Recomendações */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Minhas Compras Recentes */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Compras Recentes</CardTitle>
                <CardDescription>
                  Suas últimas compras realizadas
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
              {data.minhas_compras.slice(0, 5).map((compra) => (
                <div key={compra.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <h4 className="font-medium">{compra.produto_nome}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(compra.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {compra.valor_final.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </p>
                    <Badge {...getStatusBadge(compra.status)} className="text-xs mt-1">
                      {compra.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Meus Favoritos */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Meus Favoritos</CardTitle>
                <CardDescription>
                  Produtos que você salvou
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="/dashboard/favoritos">
                  <Heart className="h-4 w-4 mr-2" />
                  Ver Todos
                </a>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {data.favoritos.acomodacoes.length > 0 || data.favoritos.passeios.length > 0 || data.favoritos.pacotes.length > 0 ? (
              <div className="space-y-4">
                {/* Acomodações Favoritas */}
                {data.favoritos.acomodacoes.slice(0, 2).map((favorito) => (
                  <div key={favorito.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    {favorito.imagem_url && (
                      <img
                        src={favorito.imagem_url}
                        alt={favorito.titulo}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium">{favorito.titulo}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-1">{favorito.descricao}</p>
                      {favorito.localizacao && (
                        <p className="text-xs text-muted-foreground mt-1">{favorito.localizacao}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {favorito.preco.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </p>
                      <Badge variant="secondary" className="text-xs mt-1">
                        Acomodação
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {/* Experiências Favoritas */}
                {data.favoritos.passeios.slice(0, 2).map((favorito) => (
                  <div key={favorito.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    {favorito.imagem_url && (
                      <img
                        src={favorito.imagem_url}
                        alt={favorito.titulo}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium">{favorito.titulo}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-1">{favorito.descricao}</p>
                      {favorito.localizacao && (
                        <p className="text-xs text-muted-foreground mt-1">{favorito.localizacao}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {favorito.preco.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </p>
                      <Badge variant="outline" className="text-xs mt-1">
                        Experiência
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Você ainda não tem favoritos</p>
                <Button asChild>
                  <a href="/products">
                    Explorar Produtos
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notificações */}
      <NotificationCard
        notifications={notifications}
        onMarkAsRead={handleMarkNotificationAsRead}
      />
    </div>
  )
}