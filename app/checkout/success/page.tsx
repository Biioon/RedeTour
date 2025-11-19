'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Home, Package, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [sessionData, setSessionData] = useState<any>(null)

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (sessionId) {
      // Buscar detalhes da sessão (em produção, isso seria feito via API)
      setTimeout(() => {
        setSessionData({
          id: sessionId,
          amount_total: 2990, // R$ 29,90
          currency: 'BRL',
          customer_details: {
            name: 'João Silva',
            email: 'joao@example.com',
          },
          payment_method_types: ['card'],
          mode: 'subscription',
        })
        setLoading(false)
      }, 1000)
    } else {
      setLoading(false)
    }
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Processando seu pagamento...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Pagamento Confirmado!</CardTitle>
          <CardDescription>
            Seu pagamento foi processado com sucesso
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {sessionData && (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="default" className="bg-green-600">
                    Pago
                  </Badge>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Valor</span>
                  <span className="font-semibold">
                    {(sessionData.amount_total / 100).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: sessionData.currency,
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Cliente</span>
                  <span className="font-medium">{sessionData.customer_details.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Email</span>
                  <span className="text-sm">{sessionData.customer_details.email}</span>
                </div>
              </div>

              {sessionData.mode === 'subscription' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      Assinatura Ativada
                    </span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    Sua assinatura foi ativada com sucesso. Você receberá um email com os detalhes.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="space-y-3">
            <Button 
              onClick={() => router.push('/dashboard')} 
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Ir para Dashboard
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard/financeiro')}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Financeiro
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard/products')}
              >
                <Package className="w-4 h-4 mr-2" />
                Produtos
              </Button>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Você receberá um email com o comprovante do pagamento.</p>
            <p className="mt-2">
              ID da Transação: <span className="font-mono">{sessionData?.id?.slice(-8)}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}