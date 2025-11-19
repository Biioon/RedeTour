'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Star, TrendingUp, Users, Package, Image } from 'lucide-react'
import { createSubscriptionCheckoutSession } from '@/lib/stripe/actions'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'

interface PlanoAssinatura {
  id: string
  nome: string
  descricao: string
  preco_mensal: number
  preco_anual: number
  recursos: string[]
  limite_produtos: number
  limite_imagens: number
  ativo: boolean
  stripe_price_id_mensal: string | null
  stripe_price_id_anual: string | null
}

interface SubscriptionPlansProps {
  planos: PlanoAssinatura[]
  afiliadoId?: string
  onSuccess?: () => void
}

export function SubscriptionPlans({ planos, afiliadoId, onSuccess }: SubscriptionPlansProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState<string | null>(null)
  const [selectedInterval, setSelectedInterval] = useState<'mensal' | 'anual'>('mensal')

  const handleSubscribe = async (planoId: string, interval: 'month' | 'year') => {
    try {
      setLoading(`${planoId}-${interval}`)
      
      const result = await createSubscriptionCheckoutSession({
        planoId,
        interval,
        afiliadoId,
      })

      if (result.url) {
        // Redirecionar para o Stripe Checkout
        window.location.href = result.url
      } else {
        throw new Error('URL de checkout não recebida')
      }
    } catch (error) {
      console.error('Erro ao criar checkout de assinatura:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao processar assinatura. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(null)
    }
  }

  const getEconomiaAnual = (plano: PlanoAssinatura) => {
    const totalMensal = plano.preco_mensal * 12
    const economia = totalMensal - plano.preco_anual
    const percentual = (economia / totalMensal) * 100
    return {
      valor: economia,
      percentual: percentual,
    }
  }

  const getIconeRecurso = (recurso: string) => {
    if (recurso.toLowerCase().includes('produto')) return <Package className="w-4 h-4" />
    if (recurso.toLowerCase().includes('imagem')) return <Image className="w-4 h-4" />
    if (recurso.toLowerCase().includes('suporte')) return <Users className="w-4 h-4" />
    if (recurso.toLowerCase().includes('comissão')) return <TrendingUp className="w-4 h-4" />
    return <Check className="w-4 h-4" />
  }

  return (
    <div className="space-y-8">
      {/* Seletor de Intervalo */}
      <div className="flex justify-center">
        <div className="bg-muted rounded-lg p-1 flex">
          <button
            onClick={() => setSelectedInterval('mensal')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedInterval === 'mensal'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setSelectedInterval('anual')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors relative ${
              selectedInterval === 'anual'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Anual
            <Badge variant="secondary" className="ml-2 text-xs">
              Economize
            </Badge>
          </button>
        </div>
      </div>

      {/* Planos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {planos.map((plano) => {
          const preco = selectedInterval === 'mensal' ? plano.preco_mensal : plano.preco_anual
          const precoOriginal = selectedInterval === 'mensal' 
            ? plano.preco_mensal 
            : plano.preco_mensal * 12
          
          const economia = getEconomiaAnual(plano)
          const isPopular = plano.nome.toLowerCase().includes('professional')

          return (
            <Card 
              key={plano.id} 
              className={`relative ${
                isPopular ? 'border-primary shadow-lg scale-105' : ''
              }`}
            >
              {isPopular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <Star className="w-3 h-3 mr-1" />
                  Mais Popular
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{plano.nome}</CardTitle>
                <CardDescription>{plano.descricao}</CardDescription>
                
                <div className="mt-4">
                  <div className="flex items-baseline justify-center">
                    <span className="text-3xl font-bold">
                      {preco.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </span>
                    <span className="text-muted-foreground ml-1">
                      /{selectedInterval === 'mensal' ? 'mês' : 'ano'}
                    </span>
                  </div>
                  
                  {selectedInterval === 'anual' && (
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-xs">
                        Economize {economia.percentual.toFixed(0)}%
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Equivalente a {(preco / 12).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })} por mês
                      </p>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Limites */}
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Produtos</span>
                      <span className="font-medium">
                        {plano.limite_produtos === 999999 ? 'Ilimitado' : plano.limite_produtos}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Imagens</span>
                      <span className="font-medium">
                        {plano.limite_imagens === 999999 ? 'Ilimitado' : plano.limite_imagens}
                      </span>
                    </div>
                  </div>

                  {/* Recursos */}
                  <div className="space-y-2">
                    {plano.recursos.map((recurso, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>{recurso}</span>
                      </div>
                    ))}
                  </div>

                  {/* Botão de Assinatura */}
                  <Button
                    onClick={() => handleSubscribe(
                      plano.id, 
                      selectedInterval === 'mensal' ? 'month' : 'year'
                    )}
                    disabled={loading === `${plano.id}-${selectedInterval === 'mensal' ? 'month' : 'year'}`}
                    className="w-full"
                    variant={isPopular ? 'default' : 'outline'}
                  >
                    {loading === `${plano.id}-${selectedInterval === 'mensal' ? 'month' : 'year'}` ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      `Assinar ${plano.nome}`
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Informações Adicionais */}
      <Card className="bg-muted">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h3 className="font-semibold">Dúvidas sobre os planos?</h3>
            <p className="text-sm text-muted-foreground">
              Entre em contato conosco para mais informações sobre nossos planos e recursos.
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <Button variant="outline" size="sm">
                Ver todos os recursos
              </Button>
              <Button variant="outline" size="sm">
                Falar com suporte
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}