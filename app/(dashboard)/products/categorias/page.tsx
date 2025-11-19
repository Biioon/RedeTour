'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/use-toast'
import { ProductList } from '@/components/products/product-list'
import { CategoriaForm } from '@/components/products/categoria-form'
import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from '@/lib/actions/products'
import type { Categoria } from '@/types/products'
import type { CategoriaFormData } from '@/components/products/categoria-form'

export default function CategoriasPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null)
  const [itemToDelete, setItemToDelete] = useState<Categoria | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const categoriasData = await getCategorias()
      setCategorias(categoriasData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao carregar categorias',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedCategoria(null)
    setDialogOpen(true)
  }

  const handleEdit = (categoria: Categoria) => {
    setSelectedCategoria(categoria)
    setDialogOpen(true)
  }

  const handleDelete = (categoria: Categoria) => {
    setItemToDelete(categoria)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return

    try {
      await deleteCategoria(itemToDelete.id)
      toast({
        title: 'Sucesso',
        description: 'Categoria excluída com sucesso',
      })
      loadData()
    } catch (error) {
      console.error('Erro ao excluir categoria:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao excluir categoria',
        variant: 'destructive',
      })
    } finally {
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    }
  }

  const handleSubmit = async (formData: CategoriaFormData) => {
    try {
      setSubmitting(true)
      
      if (selectedCategoria) {
        await updateCategoria(selectedCategoria.id, formData)
        toast({
          title: 'Sucesso',
          description: 'Categoria atualizada com sucesso',
        })
      } else {
        await createCategoria(formData)
        toast({
          title: 'Sucesso',
          description: 'Categoria criada com sucesso',
        })
      }
      
      setDialogOpen(false)
      loadData()
    } catch (error) {
      console.error('Erro ao salvar categoria:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao salvar categoria',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getIconeLabel = (icone: string) => {
    const icones = {
      'hotel': '🏨 Hotel',
      'pousada': '🏠 Pousada',
      'resort': '🏖️ Resort',
      'hostel': '🏢 Hostel',
      'casa': '🏡 Casa',
      'apartamento': '🏢 Apartamento',
      'aviao': '✈️ Avião',
      'onibus': '🚌 Ônibus',
      'carro': '🚗 Carro',
      'trem': '🚂 Trem',
      'barco': '⛴️ Barco',
      'van': '🚐 Van',
      'passeio': '🚶 Passeio',
      'praia': '🏖️ Praia',
      'montanha': '⛰️ Montanha',
      'cidade': '🏙️ Cidade',
      'natureza': '🌳 Natureza',
      'gastronomia': '🍽️ Gastronomia',
      'cultura': '🎭 Cultura',
      'aventura': '🏃 Aventura',
    }
    return icones[icone as keyof typeof icones] || icone
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
          <p className="text-muted-foreground">
            Gerencie as categorias de produtos turísticos
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      <ProductList
        title=""
        data={categorias}
        loading={loading}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        getItemTitle={(item) => item.nome}
        getItemDescription={(item) => item.descricao || ''}
        getItemStatus={(item) => ({ active: item.ativo, label: item.ativo ? 'Ativo' : 'Inativo' })}
        getItemImage={(item) => item.imagem_url}
        searchFields={['nome', 'descricao']}
        filterOptions={[
          { label: 'Todos', value: 'all', filter: () => true },
          { label: 'Ativos', value: 'active', filter: (item) => item.ativo },
          { label: 'Inativos', value: 'inactive', filter: (item) => !item.ativo },
        ]}
        sortOptions={[
          { label: 'Nome (A-Z)', value: 'name-asc', sort: (a, b) => a.nome.localeCompare(b.nome) },
          { label: 'Nome (Z-A)', value: 'name-desc', sort: (a, b) => b.nome.localeCompare(a.nome) },
        ]}
      />

      {/* Dialog de Criação/Edição */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCategoria ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
            <DialogDescription>
              {selectedCategoria 
                ? 'Atualize as informações da categoria' 
                : 'Preencha as informações para criar uma nova categoria'
              }
            </DialogDescription>
          </DialogHeader>
          
          <CategoriaForm
            initialData={selectedCategoria || undefined}
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
            loading={submitting}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a categoria "{itemToDelete?.nome}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}