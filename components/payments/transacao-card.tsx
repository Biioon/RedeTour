'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  DollarSign, 
  CreditCard, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react'
import type { Transacao } from '@/types/payments'

interface TransacaoCardProps {
  transacao: Transacao
  onViewDetails?: (transacao: Transacao) => void
}

export function TransacaoCard({ transacao, onViewDetails }: TransacaoCardProps) {
  const getStatusBadge = (status: string) => {
    const badges = {
      concluida: { label: 'Concluída', variant: 'default' as const },
      pendente: { label: 'Pendente', variant: 'secondary' as const },
      falhou: { label: 'Falhou', variant: 'destructive' as const },
      cancelada: { label: 'Cancelada', variant: 'outline' as const },
    }
    return badges[status as keyof typeof badges] || badges.pendente
  }

  const getTipoTransacaoIcon = (tipo: string) => {
    const icons = {
      venda: <TrendingUp className="w-4 h-4" />,
      reembolso: <TrendingDown className="w-4 h-4" />,
      comissao: <DollarSign className="w-4 h-4" />,
      assinatura: <CreditCard className="w-4 h-4" />,
      taxa: <Clock className="w-4 h-4" />,
    }
    return icons[tipo as keyof typeof icons] || <DollarSign className="w-4 h-4" />
  }

  const getTipoTransacaoLabel = (tipo: string) => {
    const labels = {
      venda: 'Venda',
      reembolso: 'Reembolso',
      comissao: 'Comissão',
      assinatura: 'Assinatura',
      taxa: 'Taxa',
    }
    return labels[tipo as keyof typeof labels] || tipo
  }

  const getGatewayIcon = (gateway: string) => {
    return gateway === 'stripe' ? (
      <span className="text-xs font-bold text-blue-600">STRIPE</span>
    ) : (
      <CreditCard className="w-4 h-4" />
    )
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              {getTipoTransacaoIcon(transacao.tipo_transacao)}
            </div>
            <div>
              <CardTitle className="text-lg">{getTipoTransacaoLabel(transacao.tipo_transacao)}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                {getGatewayIcon(transacao.gateway)}
                <span className="text-xs">{transacao.gateway.toUpperCase()}</span>
              </CardDescription>
            </div>
          </div>
          <Badge {...getStatusBadge(transacao.status)} />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Valores */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Valor Bruto</p>
            <p className="font-semibold">
              {transacao.valor.toLocaleString('pt-BR', {
                style: 'currency',
                currency: transacao.moeda,
              })}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Valor Líquido</p>
            <p className="font-semibold">
              {transacao.valor_liquido.toLocaleString('pt-BR', {
                style: 'currency',
                currency: transacao.moeda,
              })}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Taxa Gateway</p>
            <p className="text-red-600">
              -{transacao.taxa_gateway.toLocaleString('pt-BR', {
                style: 'currency',
                currency: transacao.moeda,
              })}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Comissão</p>
            <p className="text-blue-600">
              {transacao.comissao_afiliado.toLocaleString('pt-BR', {
                style: 'currency',
                currency: transacao.moeda,
              })}
            </p>
          </div>
        </div>

        {/* Descrição */}
        <div className="bg-muted rounded-lg p-3">
          <p className="text-sm font-medium">{transacao.descricao}</p>
        </div>

        {/* Datas e IDs */}
        <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
          <div>
            <p>Data</p>
            <p>{new Date(transacao.created_at).toLocaleDateString('pt-BR')}</p>
          </div>
          <div>
            <p>ID Transação</p>
            <p className="font-mono">{transacao.id.slice(-8)}</p>
          </div>
          {transacao.stripe_transaction_id && (
            <div className="col-span-2">
              <p>ID Stripe</p>
              <p className="font-mono">{transacao.stripe_transaction_id.slice(-8)}</p>
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewDetails?.(transacao)}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-2" />
            Ver Detalhes
          </Button>
          {transacao.status === 'concluida' && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Comprovante
            </Button>
          )}
          {transacao.status === 'falhou' && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reembolsar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}