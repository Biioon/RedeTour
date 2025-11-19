'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  DollarSign, 
  Users, 
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download
} from 'lucide-react'
import type { Comissao } from '@/types/payments'

interface ComissaoCardProps {
  comissao: Comissao
  onViewDetails?: (comissao: Comissao) => void
  onPayCommission?: (comissao: Comissao) => void
}

export function ComissaoCard({ comissao, onViewDetails, onPayCommission }: ComissaoCardProps) {
  const getStatusBadge = (status: string) => {
    const badges = {
      pendente: { label: 'Pendente', variant: 'secondary' as const },
      paga: { label: 'Paga', variant: 'default' as const },
      cancelada: { label: 'Cancelada', variant: 'destructive' as const },
    }
    return badges[status as keyof typeof badges] || badges.pendente
  }

  const getTipoComissaoIcon = (tipo: string) => {
    const icons = {
      venda: <TrendingUp className="w-4 h-4" />,
      assinatura: <Users className="w-4 h-4" />,
    }
    return icons[tipo as keyof typeof icons] || <DollarSign className="w-4 h-4" />
  }

  const getTipoComissaoLabel = (tipo: string) => {
    const labels = {
      venda: 'Venda',
      assinatura: 'Assinatura',
    }
    return labels[tipo as keyof typeof labels] || tipo
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      pendente: <Clock className="w-4 h-4" />,
      paga: <CheckCircle className="w-4 h-4" />,
      cancelada: <XCircle className="w-4 h-4" />,
    }
    return icons[status as keyof typeof icons] || <Clock className="w-4 h-4" />
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              {getTipoComissaoIcon(comissao.tipo_comissao)}
            </div>
            <div>
              <CardTitle className="text-lg">Comissão #{comissao.id.slice(-6)}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                {getTipoComissaoLabel(comissao.tipo_comissao)}
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs">{comissao.percentual_comissao}%</span>
              </CardDescription>
            </div>
          </div>
          <Badge {...getStatusBadge(comissao.status)} />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Informações do Afiliado */}
        {comissao.afiliado && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="truncate">{comissao.afiliado.full_name}</span>
            <span className="text-muted-foreground">•</span>
            <span className="truncate text-xs text-muted-foreground">{comissao.afiliado.email}</span>
          </div>
        )}

        {/* Valores */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Valor da Comissão</p>
            <p className="font-semibold">
              {comissao.valor_comissao.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Percentual</p>
            <p className="font-semibold">{comissao.percentual_comissao}%</p>
          </div>
        </div>

        {/* Descrição */}
        <div className="bg-muted rounded-lg p-3">
          <p className="text-sm font-medium">{comissao.descricao}</p>
        </div>

        {/* Datas e Status */}
        <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
          <div>
            <p>Data de Criação</p>
            <p>{new Date(comissao.created_at).toLocaleDateString('pt-BR')}</p>
          </div>
          <div>
            <p>Status</p>
            <div className="flex items-center gap-1">
              {getStatusIcon(comissao.status)}
              <span className="capitalize">{comissao.status}</span>
            </div>
          </div>
          {comissao.data_pagamento && (
            <div className="col-span-2">
              <p>Data de Pagamento</p>
              <p>{new Date(comissao.data_pagamento).toLocaleDateString('pt-BR')}</p>
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewDetails?.(comissao)}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-2" />
            Ver Detalhes
          </Button>
          {comissao.status === 'pendente' && (
            <Button
              size="sm"
              onClick={() => onPayCommission?.(comissao)}
              className="flex-1"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Pagar Comissão
            </Button>
          )}
          {comissao.status === 'paga' && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Comprovante
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}