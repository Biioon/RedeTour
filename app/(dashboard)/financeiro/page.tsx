'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Package, 
  CreditCard,
  Calendar,
  BarChart3,
  PieChart,
  Download,
  Filter
} from 'lucide-react'
import { getVendas, getTransacoes, getComissoes, getRelatorioVendas } from '@/lib/stripe/actions'
import { VendaCard } from '@/components/payments/venda-card'
import { TransacaoCard } from '@/components/payments/transacao-card'
import { ComissaoCard } from '@/components/payments/comissao-card'
import { VendasChart } from '@/components/payments/vendas-chart'
import { ComissoesChart } from '@/components/payments/comissoes-chart'
import type { Venda, Transacao, Comissao } from '@/types/payments'

export default function FinanceiroPage() {
  const [loading, setLoading] = useState(true)
  const [vendas, setVendas] = useState<Venda[]>([])
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [comissoes, setComissoes] = useState<Comissao[]>([])
  const [relatorio, setRelatorio] = useState<any>(null)
  const [periodo, setPeriodo] = useState<'mes' | 'trimestre' | 'ano'>('mes')

  useEffect(() => {
    loadData()
  }, [periodo])

  const loadData = async () => {
    try {
      setLoading(true)
      const [vendasData, transacoesData, comissoesData, relatorioData] = await Promise.all([
        getVendas(),
        getTransacoes(),
        getComissoes(),
        getRelatorioVendas(periodo)
      ])
      
      setVendas(vendasData.slice(0, 10)) // Últimas 10 vendas
      setTransacoes(transacoesData.slice(0, 10)) // Últimas 10 transações
      setComissoes(comissoesData.filter(c => c.status === 'pendente').slice(0, 10)) // Comissões pendentes
      setRelatorio(relatorioData)
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error)
    } finally {
      setLoading(false)
    }
  }

  const calcularResumo = () => {
    const totalVendas = vendas.reduce((sum, venda) => sum + venda.valor_final, 0)
    const totalComissoes = comissoes.reduce((sum, comissao) => sum + comissao.valor_comissao, 0)
    const vendasConfirmadas = vendas.filter(v => v.status === 'confirmada').length
    const vendasPendentes = vendas.filter(v => v.status === 'pendente').length
    
    return {
      totalVendas,
      totalComissoes,
      vendasConfirmadas,
      vendasPendentes,
      ticketMedio: vendasConfirmadas > 0 ? totalVendas / vendasConfirmadas : 0,
    }
  }

  const resumo = calcularResumo()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dados financeiros...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground">
            Gerencie suas vendas, comissões e finanças
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resumo.totalVendas.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary" className="text-xs">
                {resumo.vendasConfirmadas} confirmadas
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {resumo.vendasPendentes} pendentes
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resumo.ticketMedio.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Por venda confirmada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comissões</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resumo.totalComissoes.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary" className="text-xs">
                {comissoes.length} pendentes
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Período</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold capitalize">{periodo}</div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto p-0 text-xs"
              onClick={() => {
                const opcoes = ['mes', 'trimestre', 'ano'] as const
                const index = opcoes.indexOf(periodo)
                setPeriodo(opcoes[(index + 1) % opcoes.length])
              }}
            >
              Alterar período
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Vendas por Mês</CardTitle>
            <CardDescription>
              Evolução das vendas no período selecionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VendasChart data={relatorio?.vendas_por_mes || []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comissões por Mês</CardTitle>
            <CardDescription>
              Evolução das comissões no período selecionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ComissoesChart data={relatorio?.comissoes_por_mes || []} />
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Detalhes */}
      <Tabs defaultValue="vendas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vendas">Vendas</TabsTrigger>
          <TabsTrigger value="transacoes">Transações</TabsTrigger>
          <TabsTrigger value="comissoes">Comissões</TabsTrigger>
        </TabsList>

        <TabsContent value="vendas" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Últimas Vendas</h3>
            <Button variant="outline" size="sm">
              Ver todas
            </Button>
          </div>
          <div className="grid gap-4">
            {vendas.map((venda) => (
              <VendaCard key={venda.id} venda={venda} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transacoes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Últimas Transações</h3>
            <Button variant="outline" size="sm">
              Ver todas
            </Button>
          </div>
          <div className="grid gap-4">
            {transacoes.map((transacao) => (
              <TransacaoCard key={transacao.id} transacao={transacao} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="comissoes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Comissões Pendentes</h3>
            <Button variant="outline" size="sm">
              Ver todas
            </Button>
          </div>
          <div className="grid gap-4">
            {comissoes.map((comissao) => (
              <ComissaoCard key={comissao.id} comissao={comissao} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}