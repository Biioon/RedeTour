'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, TrendingUp, Users, DollarSign, Package, MapPin, Hotel, Car } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getAcomodacoes, getTransportes, getPasseios, getCategorias } from '@/lib/actions/products'
import type { Acomodacao, Transporte, Passeio, Categoria } from '@/types/products'

export default function ProductsDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [acomodacoes, setAcomodacoes] = useState<Acomodacao[]>([])
  const [transportes, setTransportes] = useState<Transporte[]>([])
  const [passeios, setPasseios] = useState<Passeio[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [acomodacoesData, transportesData, passeiosData, categoriasData] = await Promise.all([
        getAcomodacoes(),
        getTransportes(),
        getPasseios(),
        getCategorias()
      ])
      
      setAcomodacoes(acomodacoesData)
      setTransportes(transportesData)
      setPasseios(passeiosData)
      setCategorias(categoriasData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    totalAcomodacoes: acomodacoes.length,
    totalTransportes: transportes.length,
    totalPasseios: passeios.length,
    totalCategorias: categorias.length,
    acomodacoesAtivas: acomodacoes.filter(a => a.ativo).length,
    transportesAtivos: transportes.filter(t => t.ativo).length,
    passeiosAtivos: passeios.filter(p => p.ativo).length,
    categoriasAtivas: categorias.filter(c => c.ativo).length,
    valorMedioAcomodacao: acomodacoes.length > 0 
      ? acomodacoes.reduce((sum, a) => sum + a.preco, 0) / acomodacoes.length 
      : 0,
    valorMedioTransporte: transportes.length > 0 
      ? transportes.reduce((sum, t) => sum + t.preco, 0) / transportes.length 
      : 0,
    valorMedioPasseio: passeios.length > 0 
      ? passeios.reduce((sum, p) => sum + p.preco, 0) / passeios.length 
      : 0,
  }

  const recentItems = [
    ...acomodacoes.slice(0, 3).map(a => ({ ...a, tipo: 'acomodacao' as const })),
    ...transportes.slice(0, 3).map(t => ({ ...t, tipo: 'transporte' as const })),
    ...passeios.slice(0, 3).map(p => ({ ...p, tipo: 'passeio' as const })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5)

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'acomodacao': return Hotel
      case 'transporte': return Car
      case 'passeio': return MapPin
      default: return Package
    }
  }

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'acomodacao': return 'Acomodação'
      case 'transporte': return 'Transporte'
      case 'passeio': return 'Passeio'
      default: return 'Produto'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie todos os seus produtos turísticos
          </p>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Acomodações</CardTitle>
            <Hotel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAcomodacoes}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary" className="text-xs">
                {stats.acomodacoesAtivas} ativas
              </Badge>
              <span>•</span>
              <span>R$ {stats.valorMedioAcomodacao.toFixed(2)} média</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transportes</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransportes}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary" className="text-xs">
                {stats.transportesAtivos} ativos
              </Badge>
              <span>•</span>
              <span>R$ {stats.valorMedioTransporte.toFixed(2)} média</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Passeios</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPasseios}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary" className="text-xs">
                {stats.passeiosAtivos} ativos
              </Badge>
              <span>•</span>
              <span>R$ {stats.valorMedioPasseio.toFixed(2)} média</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categorias</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCategorias}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary" className="text-xs">
                {stats.categoriasAtivas} ativas
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Crie novos produtos ou gerencie os existentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button 
              onClick={() => router.push('/dashboard/products/acomodacoes')}
              variant="outline" 
              className="justify-start"
            >
              <Hotel className="h-4 w-4 mr-2" />
              Gerenciar Acomodações
            </Button>
            
            <Button 
              onClick={() => router.push('/dashboard/products/transportes')}
              variant="outline" 
              className="justify-start"
            >
              <Car className="h-4 w-4 mr-2" />
              Gerenciar Transportes
            </Button>
            
            <Button 
              onClick={() => router.push('/dashboard/products/passeios')}
              variant="outline" 
              className="justify-start"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Gerenciar Passeios
            </Button>
            
            <Button 
              onClick={() => router.push('/dashboard/products/categorias')}
              variant="outline" 
              className="justify-start"
            >
              <Package className="h-4 w-4 mr-2" />
              Gerenciar Categorias
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Itens Recentes */}
      {recentItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Itens Recentes</CardTitle>
            <CardDescription>
              Últimos produtos adicionados ao sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentItems.map((item, index) => {
                const Icon = getTipoIcon(item.tipo)
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{item.nome}</div>
                        <div className="text-sm text-muted-foreground">
                          {getTipoLabel(item.tipo)} • {new Date(item.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={item.ativo ? 'default' : 'secondary'}>
                        {item.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                      <span className="text-sm font-medium">
                        R$ {item.preco.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}