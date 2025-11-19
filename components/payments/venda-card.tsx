'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Package, 
  User, 
  Mail, 
  Calendar, 
  DollarSign, 
  CreditCard,
  Eye,
  Download
} from 'lucide-react'
import type { Venda } from '@/types/payments'

interface VendaCardProps {
  venda: Venda
  onViewDetails?: (venda: Venda) => void
}

export function VendaCard({ venda, onViewDetails }: VendaCardProps) {
  const getStatusBadge = (status: string) => {
    const badges = {
      pendente: { label: 'Pendente', variant: 'secondary' as const },
      confirmada: { label: 'Confirmada', variant: 'default' as const },
      cancelada: { label: 'Cancelada', variant: 'destructive' as const },
      reembolsada: { label: 'Reembolsada', variant: 'outline' as const },
    }
    return badges[status as keyof typeof badges] || badges.pendente
  }

  const getMetodoPagamentoIcon = (metodo: string) => {
    const icons = {
      cartao_credito: <CreditCard className="w-4 h-4" />,
      cartao_debito: <CreditCard className="w-4 h-4" />,
      pix: <span className="text-xs font-bold">PIX</span>,
      boleto: <span className="text-xs font-bold">BOLETO</span>,
    }
    return icons[metodo as keyof typeof icons] || <CreditCard className="w-4 h-4" />
  }

  const getTipoProdutoLabel = (tipo: string) => {
    const labels = {
      pacote_turistico: 'Pacote Turístico',
      acomodacao: 'Acomodação',
      transporte: 'Transporte',
      passeio: 'Passeio',
    }
    return labels[tipo as keyof typeof labels] || tipo
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg">{venda.produto_nome}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              {getTipoProdutoLabel(venda.tipo_produto)}
            </CardDescription>
          </div>
          <Badge {...getStatusBadge(venda.status)} />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Informações do Cliente */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="truncate">{venda.cliente_nome}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="truncate">{venda.cliente_email}</span>
          </div>
        </div>

        {/* Detalhes da Venda */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span>
              {venda.valor_final.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {getMetodoPagamentoIcon(venda.metodo_pagamento)}
            <span className="capitalize">{venda.metodo_pagamento.replace('_', ' ')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>{new Date(venda.created_at).toLocaleDateString('pt-BR')}</span>
          </div>
          {venda.data_viagem && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>{new Date(venda.data_viagem).toLocaleDateString('pt-BR')}</span>
            </div>
          )}
        </div>

        {/* Informações de Afiliado */}
        {venda.afiliado && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-blue-900 font-medium">
                Afiliado: {venda.afiliado.full_name}
              </span>
            </div>
            <div className="text-xs text-blue-700 mt-1">
              Comissão: {venda.comissao_afiliado.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewDetails?.(venda)}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-2" />
            Ver Detalhes
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Recibo
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}