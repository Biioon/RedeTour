'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Plus, Edit, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/utils/format'

interface ProductListProps<T> {
  title: string
  description?: string
  data: T[]
  loading?: boolean
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  onView?: (item: T) => void
  onCreate?: () => void
  getItemTitle: (item: T) => string
  getItemDescription?: (item: T) => string
  getItemPrice?: (item: T) => number
  getItemStatus?: (item: T) => { active: boolean; label: string }
  getItemImage?: (item: T) => string | null
  getItemCategory?: (item: T) => string
  searchFields?: Array<keyof T>
  filterOptions?: {
    label: string
    value: string
    filter: (item: T) => boolean
  }[]
  sortOptions?: {
    label: string
    value: string
    sort: (a: T, b: T) => number
  }[]
  itemsPerPage?: number
}

export function ProductList<T>({
  title,
  description,
  data,
  loading = false,
  onEdit,
  onDelete,
  onView,
  onCreate,
  getItemTitle,
  getItemDescription,
  getItemPrice,
  getItemStatus,
  getItemImage,
  getItemCategory,
  searchFields = [],
  filterOptions = [],
  sortOptions = [],
  itemsPerPage = 10,
}: ProductListProps<T>) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [selectedSort, setSelectedSort] = useState('name-asc')
  const [currentPage, setCurrentPage] = useState(1)

  // Filtrar e ordenar dados
  const filteredData = data.filter((item) => {
    // Filtro de busca
    if (searchTerm && searchFields.length > 0) {
      const matchesSearch = searchFields.some((field) => {
        const value = item[field]
        return value && String(value).toLowerCase().includes(searchTerm.toLowerCase())
      })
      if (!matchesSearch) return false
    }

    // Filtro selecionado
    if (selectedFilter !== 'all') {
      const filterOption = filterOptions.find(f => f.value === selectedFilter)
      if (filterOption && !filterOption.filter(item)) return false
    }

    return true
  })

  // Ordenar dados
  const sortedData = [...filteredData].sort((a, b) => {
    const sortOption = sortOptions.find(s => s.value === selectedSort)
    if (sortOption) return sortOption.sort(a, b)
    
    // Ordenação padrão por nome
    return getItemTitle(a).localeCompare(getItemTitle(b))
  })

  // Paginação
  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = sortedData.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1) // Resetar para página 1 quando filtros mudam
  }, [searchTerm, selectedFilter, selectedSort])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">Nenhum item encontrado</div>
        {onCreate && (
          <Button onClick={onCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeiro Item
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {onCreate && (
          <Button onClick={onCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Item
          </Button>
        )}
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {filterOptions.length > 0 && (
          <Select value={selectedFilter} onValueChange={setSelectedFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {filterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {sortOptions.length > 0 && (
          <Select value={selectedSort} onValueChange={setSelectedSort}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Resultados */}
      <div className="text-sm text-muted-foreground">
        {filteredData.length} de {data.length} itens
      </div>

      {/* Lista de Itens */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {currentData.map((item, index) => {
          const status = getItemStatus?.(item)
          const price = getItemPrice?.(item)
          const image = getItemImage?.(item)
          const category = getItemCategory?.(item)

          return (
            <Card key={index} className="overflow-hidden">
              {image && (
                <div className="aspect-video relative bg-muted">
                  <img
                    src={image}
                    alt={getItemTitle(item)}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTAwTDEyMCA4MEwxNDAgMTAwTDEyMCAxMjBMMTAwIDEwMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'
                    }}
                  />
                </div>
              )}
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1">
                      {getItemTitle(item)}
                    </CardTitle>
                    {category && (
                      <Badge variant="secondary" className="mt-1">
                        {category}
                      </Badge>
                    )}
                  </div>
                  {status && (
                    <Badge variant={status.active ? 'default' : 'secondary'}>
                      {status.label}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {getItemDescription && (
                  <CardDescription className="line-clamp-2">
                    {getItemDescription(item)}
                  </CardDescription>
                )}
                
                {price && (
                  <div className="text-lg font-semibold">
                    {formatCurrency(price)}
                  </div>
                )}

                {/* Ações */}
                <div className="flex gap-2 pt-2">
                  {onView && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onView(item)}
                      className="flex-1"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                  )}
                  {onEdit && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(item)}
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDelete(item)}
                      className="flex-1"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Excluir
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Próximo
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}