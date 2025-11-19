'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Heart, 
  MapPin, 
  Star, 
  Calendar,
  Filter,
  Grid,
  List,
  Trash2,
  ExternalLink
} from 'lucide-react'
import { getFavoritos, removerFavorito } from '@/lib/actions/favorites'
import type { FavoritoItem } from '@/lib/actions/favorites'
import { useToast } from '@/components/ui/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function FavoritosPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [favoritos, setFavoritos] = useState<FavoritoItem[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterType, setFilterType] = useState<'todos' | 'accommodation' | 'experience' | 'vehicle'>('todos')

  useEffect(() => {
    loadFavoritos()
  }, [])

  const loadFavoritos = async () => {
    try {
      setLoading(true)
      const data = await getFavoritos()
      setFavoritos(data)
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao carregar seus favoritos',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoverFavorito = async (item: FavoritoItem) => {
    try {
      const sucesso = await removerFavorito(item.tipo, item.id)
      if (sucesso) {
        setFavoritos(prev => prev.filter(f => f.id !== item.id))
        toast({
          title: 'Sucesso',
          description: 'Item removido dos favoritos'
        })
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao remover item dos favoritos',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Erro ao remover favorito:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao remover item dos favoritos',
        variant: 'destructive'
      })
    }
  }

  const getTipoLabel = (tipo: string) => {
    const labels = {
      accommodation: 'Acomodação',
      experience: 'Experiência',
      vehicle: 'Veículo'
    }
    return labels[tipo as keyof typeof labels] || tipo
  }

  const getTipoBadgeVariant = (tipo: string) => {
    const variants = {
      accommodation: 'default' as const,
      experience: 'secondary' as const,
      vehicle: 'outline' as const
    }
    return variants[tipo as keyof typeof variants] || 'secondary'
  }

  const filteredFavoritos = favoritos.filter(item => 
    filterType === 'todos' || item.tipo === filterType
  )

  const FavoritoCard = ({ item }: { item: FavoritoItem }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {item.imagem_url && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={item.imagem_url}
            alt={item.titulo}
            className="w-full h-full object-cover"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white"
            onClick={() => handleRemoverFavorito(item)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2">{item.titulo}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {item.descricao}
            </CardDescription>
          </div>
          <Badge variant={getTipoBadgeVariant(item.tipo)}>
            {getTipoLabel(item.tipo)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {item.localizacao && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{item.localizacao}</span>
          </div>
        )}
        
        {item.avaliacao_media && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{item.avaliacao_media}</span>
            </div>
            {item.total_avaliacoes && (
              <span className="text-sm text-muted-foreground">
                ({item.total_avaliacoes} avaliações)
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div>
            <span className="text-2xl font-bold text-primary">
              {item.preco.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </span>
            {item.categoria && (
              <p className="text-sm text-muted-foreground">{item.categoria}</p>
            )}
          </div>
          
          <Button size="sm" asChild>
            <a href={`/products/${item.tipo}/${item.id}`}>
              <ExternalLink className="h-4 w-4 mr-1" />
              Ver Detalhes
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const FavoritoListItem = ({ item }: { item: FavoritoItem }) => (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        {item.imagem_url && (
          <img
            src={item.imagem_url}
            alt={item.titulo}
            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
          />
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-lg line-clamp-1">{item.titulo}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {item.descricao}
              </p>
              
              <div className="flex items-center gap-4 mt-2">
                {item.localizacao && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="line-clamp-1">{item.localizacao}</span>
                  </div>
                )}
                
                {item.avaliacao_media && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{item.avaliacao_media}</span>
                    {item.total_avaliacoes && (
                      <span className="text-sm text-muted-foreground">
                        ({item.total_avaliacoes})
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={getTipoBadgeVariant(item.tipo)}>
                {getTipoLabel(item.tipo)}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoverFavorito(item)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="text-right flex-shrink-0">
          <div className="text-2xl font-bold text-primary">
            {item.preco.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </div>
          {item.categoria && (
            <p className="text-sm text-muted-foreground">{item.categoria}</p>
          )}
          <Button size="sm" className="mt-2" asChild>
            <a href={`/products/${item.tipo}/${item.id}`}>
              <ExternalLink className="h-3 w-3 mr-1" />
              Ver
            </a>
          </Button>
        </div>
      </div>
    </Card>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando seus favoritos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meus Favoritos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus produtos favoritados
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Tabs value={filterType} onValueChange={(value) => setFilterType(value as any)}>
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="accommodation">Acomodações</TabsTrigger>
          <TabsTrigger value="experience">Experiências</TabsTrigger>
          <TabsTrigger value="vehicle">Veículos</TabsTrigger>
        </TabsList>
        
        <TabsContent value={filterType} className="mt-6">
          {filteredFavoritos.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Heart className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum favorito encontrado</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {filterType === 'todos' 
                    ? 'Você ainda não favoritou nenhum produto'
                    : `Nenhum ${getTipoLabel(filterType).toLowerCase()} favoritado`
                  }
                </p>
                <Button asChild>
                  <a href="/products">
                    Explorar Produtos
                  </a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className={viewMode === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
              {filteredFavoritos.map((item) => (
                viewMode === 'grid' ? (
                  <FavoritoCard key={item.id} item={item} />
                ) : (
                  <FavoritoListItem key={item.id} item={item} />
                )
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}