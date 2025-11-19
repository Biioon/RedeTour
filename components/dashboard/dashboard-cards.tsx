'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Package, 
  Calendar,
  Eye,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string | number
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  icon?: React.ReactNode
  className?: string
  onViewDetails?: () => void
}

export function MetricCard({ 
  title, 
  value, 
  description, 
  trend, 
  icon, 
  className,
  onViewDetails 
}: MetricCardProps) {
  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && (
          <div className="p-2 bg-primary/10 rounded-lg">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1 mt-1">
            {trend.isPositive ? (
              <ArrowUpRight className="h-3 w-3 text-green-500" />
            ) : (
              <ArrowDownRight className="h-3 w-3 text-red-500" />
            )}
            <span className={cn(
              "text-xs font-medium",
              trend.isPositive ? "text-green-500" : "text-red-500"
            )}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
            <span className="text-xs text-muted-foreground">vs mês anterior</span>
          </div>
        )}
        {onViewDetails && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-2 h-auto p-0 text-xs"
            onClick={onViewDetails}
          >
            <Eye className="w-3 h-3 mr-1" />
            Ver detalhes
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

interface ChartCardProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  footer?: React.ReactNode
}

export function ChartCard({ 
  title, 
  description, 
  children, 
  className,
  footer 
}: ChartCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
      {footer && (
        <div className="px-6 pb-6">
          {footer}
        </div>
      )}
    </Card>
  )
}

interface ActivityCardProps {
  activities: Array<{
    id: string
    tipo: 'venda' | 'comissao' | 'cadastro' | 'atualizacao' | 'sistema'
    descricao: string
    data: string
    usuario?: string
    icone: string
  }>
  className?: string
}

export function ActivityCard({ activities, className }: ActivityCardProps) {
  const getActivityIcon = (tipo: string) => {
    const icons = {
      venda: '💰',
      comissao: '💳',
      cadastro: '👤',
      atualizacao: '🔄',
      sistema: '⚙️'
    }
    return icons[tipo as keyof typeof icons] || '📋'
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Atividades Recentes</CardTitle>
        <CardDescription>
          Últimas ações realizadas na plataforma
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm">
                {getActivityIcon(activity.tipo)}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {activity.descricao}
                </p>
                {activity.usuario && (
                  <p className="text-sm text-muted-foreground">
                    por {activity.usuario}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {new Date(activity.data).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface NotificationCardProps {
  notifications: Array<{
    id: string
    titulo: string
    mensagem: string
    tipo: 'info' | 'sucesso' | 'aviso' | 'erro'
    data: string
    lida: boolean
    acao?: {
      texto: string
      url: string
    }
  }>
  onMarkAsRead?: (id: string) => void
  className?: string
}

export function NotificationCard({ notifications, onMarkAsRead, className }: NotificationCardProps) {
  const getNotificationStyle = (tipo: string) => {
    const styles = {
      info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
      sucesso: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' },
      aviso: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800' },
      erro: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800' }
    }
    return styles[tipo as keyof typeof styles] || styles.info
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Notificações</CardTitle>
        <CardDescription>
          {notifications.filter(n => !n.lida).length} notificações não lidas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.map((notification) => {
            const style = getNotificationStyle(notification.tipo)
            return (
              <div 
                key={notification.id}
                className={cn(
                  "p-4 rounded-lg border transition-all",
                  style.bg,
                  style.border,
                  !notification.lida && "ring-2 ring-offset-2 ring-primary/20"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <h4 className={cn("font-medium", style.text)}>
                      {notification.titulo}
                    </h4>
                    <p className={cn("text-sm", style.text, "opacity-90")}>
                      {notification.mensagem}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.data).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  {!notification.lida && onMarkAsRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onMarkAsRead(notification.id)}
                      className="h-auto p-1"
                    >
                      <Eye className="w-3 h-3" />
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
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

interface QuickActionsCardProps {
  actions: Array<{
    title: string
    description: string
    icon: React.ReactNode
    href: string
    variant?: 'default' | 'outline' | 'secondary'
  }>
  className?: string
}

export function QuickActionsCard({ actions, className }: QuickActionsCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
        <CardDescription>
          Acesse rapidamente as funcionalidades mais usadas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'outline'}
              className="h-auto p-4 text-left justify-start"
              asChild
            >
              <a href={action.href}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {action.icon}
                  </div>
                  <div>
                    <p className="font-medium">{action.title}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </div>
              </a>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface ProgressCardProps {
  title: string
  current: number
  target: number
  label: string
  color?: 'blue' | 'green' | 'yellow' | 'red'
  className?: string
}

export function ProgressCard({ title, current, target, label, color = 'blue', className }: ProgressCardProps) {
  const progress = Math.min((current / target) * 100, 100)
  
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">
              {current.toLocaleString('pt-BR')} / {target.toLocaleString('pt-BR')}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={cn("h-2 rounded-full transition-all", colorClasses[color])}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            {progress.toFixed(1)}% completo
          </p>
        </div>
      </CardContent>
    </Card>
  )
}