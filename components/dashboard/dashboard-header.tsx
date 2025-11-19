'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Menu, 
  X, 
  LogOut, 
  User, 
  Bell, 
  Settings,
  RefreshCw,
  ChevronDown
} from 'lucide-react'
import { useSession } from '@/components/session-provider'
import { toast } from 'sonner'
import { getNotificacoes, marcarNotificacaoComoLida } from '@/lib/actions/dashboard'
import type { Notificacao } from '@/types/dashboard'
import { cn } from '@/lib/utils'

interface DashboardHeaderProps {
  title: string
  onMenuClick?: () => void
  onRefresh?: () => void
  userRole?: 'admin' | 'cliente' | 'afiliado' | 'parceiro'
}

export function DashboardHeader({ 
  title, 
  onMenuClick, 
  onRefresh,
  userRole = 'cliente'
}: DashboardHeaderProps) {
  const router = useRouter()
  const { user, signOut } = useSession()
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notificacao[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      const notificacoes = await getNotificacoes()
      setNotifications(notificacoes)
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success('Logout realizado com sucesso!')
      router.push('/login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      toast.error('Erro ao fazer logout')
    }
  }

  const handleRefresh = async () => {
    if (onRefresh) {
      setLoading(true)
      await onRefresh()
      setLoading(false)
    }
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

  const getRoleBadge = (role: string) => {
    const badges = {
      admin: { label: 'Administrador', variant: 'default' as const },
      cliente: { label: 'Cliente', variant: 'secondary' as const },
      afiliado: { label: 'Afiliado', variant: 'default' as const },
      parceiro: { label: 'Parceiro', variant: 'default' as const },
    }
    return badges[role as keyof typeof badges] || badges.cliente
  }

  const unreadCount = notifications.filter(n => !n.lida).length

  return (
    <header className="bg-background border-b px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onMenuClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="md:hidden"
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-xl font-semibold">{title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge {...getRoleBadge(userRole)} className="text-xs">
                {getRoleBadge(userRole).label}
              </Badge>
              {userRole === 'afiliado' && (
                <Badge variant="outline" className="text-xs">
                  💰 Comissões Ativas
                </Badge>
              )}
              {userRole === 'parceiro' && (
                <Badge variant="outline" className="text-xs">
                  🏨 Produtos Ativos
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
          )}
          
          {/* Notificações */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>
            
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-background border rounded-lg shadow-lg z-50">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Notificações</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNotifications(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          "p-4 border-b last:border-b-0",
                          !notification.lida && "bg-muted/50"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{notification.titulo}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.mensagem}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(notification.data).toLocaleString('pt-BR')}
                            </p>
                          </div>
                          {!notification.lida && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkNotificationAsRead(notification.id)}
                              className="h-auto p-1"
                            >
                              <Bell className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        {notification.acao && (
                          <div className="mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <a href={notification.acao.url}>
                                {notification.acao.texto}
                              </a>
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      Nenhuma notificação
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Menu do usuário */}
          <div className="flex items-center gap-3 pl-4 border-l">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium">{user?.full_name || user?.email?.split('@')[0]}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}