'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { XCircle, Home, ArrowLeft, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function CheckoutCancelPage() {
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
        })
        setLoading(false)
      }, 1000)
    } else {
      setLoading(false)
    }
  }, [searchParams])

  const handleRetry = () => {
    // Voltar para a página de checkout ou produtos
    router.push('/dashboard/products')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando status do pagamento...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Pagamento Cancelado</CardTitle>
          <CardDescription>
            Seu pagamento foi cancelado ou expirado
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {sessionData && (
            <div className="bg-muted rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className="text-sm font-medium text-red-600">Cancelado</span>
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
          )}

          <div className="space-y-3">
            <Button 
              onClick={handleRetry}
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard')}
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Se você tiver alguma dúvida, entre em contato com nosso suporte.</p>
            {sessionData && (
              <p className="mt-2">
                ID da Sessão: <span className="font-mono">{sessionData.id?.slice(-8)}</span>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}