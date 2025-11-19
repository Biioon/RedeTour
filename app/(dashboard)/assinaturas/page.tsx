'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CreditCard, 
  Calendar, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Package,
  Image,
  Users,
  RefreshCw,
  ArrowUpRight
} from 'lucide-react'
import { getPlanosAssinatura } from '@/lib/stripe/actions'
import { SubscriptionPlans } from '@/components/payments/subscription-plans'
import type { PlanoAssinatura } from '@/types/payments'

export default function AssinaturasPage() {
  const [planos, setPlanos] = useState<PlanoAssinatura[]>([])
  const [assinaturaAtual, setAssinaturaAtual] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const planosData = await getPlanosAssinatura()
      setPlanos(planosData)
      
      // Mock: assinatura atual do usuário
      setAssinaturaAtual({
        id: '123',
        plano: {
          nome: 'Professional',
          preco_mensal: 79.90,
          preco_anual: 799.00,
        },
        status: 'ativa',
        data_inicio: '2024-01-01',
        data_fim: '2024-12-31',
        intervalo: 'anual',
        valor_pago: 799.00,
      })
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      ativa: { label: 'Ativa', variant: 'default' as const, icon: <CheckCircle className="w-3 h-3" /> },
      cancelada: { label: 'Cancelada', variant: 'destructive' as const, icon: <XCircle className="w-3 h-3" /> },
      expirada: { label: 'Expirada', variant: 'secondary' as const, icon: <Calendar className="w-3 h-3" /> },
      suspensa: { label: 'Suspensa', variant: 'outline' as const, icon: <RefreshCw className="w-3 h-3" /> },
    }
    return badges[status as keyof typeof badges] || badges.ativa
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando planos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assinaturas</h1>
          <p className="text-muted-foreground">
            Gerencie sua assinatura e escolha o plano ideal para você
          </p>
        </div>
      </div>

      {/* Assinatura Atual */}
      {assinaturaAtual && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">Sua Assinatura Atual</CardTitle>
                <CardDescription>
                  Detalhes da sua assinatura ativa
                </CardDescription>
              </div>
              <Badge {...getStatusBadge(assinaturaAtual.status)}>
                {getStatusBadge(assinaturaAtual.status).icon}
                <span className="ml-1">{getStatusBadge(assinaturaAtual.status).label}</span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Package className="w-4 h-4" />
                  <span>Plano</span>
                </div>
                <p className="font-semibold text-lg">{assinaturaAtual.plano.nome}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CreditCard className="w-4 h-4" />
                  <span>Valor Pago</span>
                </div>
                <p className="font-semibold text-lg">
                  {assinaturaAtual.valor_pago.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Validade</span>
                </div>
                <p className="font-semibold">
                  Até {new Date(assinaturaAtual.data_fim).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Alterar Plano
              </Button>
              <Button variant="outline" className="text-destructive">
                <XCircle className="w-4 h-4 mr-2" />
                Cancelar Assinatura
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Planos Disponíveis */}
      <div>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Escolha Seu Plano</h2>
          <p className="text-muted-foreground">
            Selecione o plano que melhor atende às suas necessidades
          </p>
        </div>
        
        <SubscriptionPlans planos={planos} />
      </div>

      {/* Benefícios dos Planos */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-xl">Benefícios de Assinar</CardTitle>
          <CardDescription>
            Todos os planos incluem recursos essenciais para o sucesso do seu negócio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold">Produtos Ilimitados</h3>
              <p className="text-sm text-muted-foreground">
                Cadastre quantos produtos turísticos quiser
              </p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Image className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold">Imagens de Alta Qualidade</h3>
                <p className="text-sm text-muted-foreground">
                  Upload de imagens em alta resolução para seus produtos
                </p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold">Sistema de Afiliados</h3>
              <p className="text-sm text-muted-foreground">
                Ganhe comissões indicando nossos serviços
              </p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold">Relatórios Detalhados</h3>
              <p className="text-sm text-muted-foreground">
                Acompanhe vendas, comissões e performance
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Perguntas Frequentes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Perguntas Frequentes</CardTitle>
          <CardDescription>
            Tire suas dúvidas sobre nossos planos de assinatura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h4 className="font-semibold mb-2">Posso cancelar minha assinatura a qualquer momento?</h4>
              <p className="text-sm text-muted-foreground">
                Sim! Você pode cancelar sua assinatura a qualquer momento. O acesso continuará até o final do período pago.
              </p>
            </div>
            
            <div className="border-b pb-4">
              <h4 className="font-semibold mb-2">Há algum custo de cancelamento?</h4>
              <p className="text-sm text-muted-foreground">
                Não há custos adicionais para cancelar. Você apenas não será cobrado no próximo ciclo de faturamento.
              </p>
            </div>
            
            <div className="border-b pb-4">
              <h4 className="font-semibold mb-2">Posso mudar de plano depois?</h4>
              <p className="text-sm text-muted-foreground">
                Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As mudanças entram em vigor imediatamente.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Como funciona o pagamento?</h4>
              <p className="text-sm text-muted-foreground">
                Os pagamentos são processados mensalmente ou anualmente, dependendo do plano escolhido. Aceitamos cartão de crédito, PIX e boleto bancário.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}