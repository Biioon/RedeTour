'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/use-toast'
import { ProductList } from '@/components/products/product-list'
import { TransporteForm } from '@/components/products/transporte-form'
import { getTransportes, createTransporte, updateTransporte, deleteTransporte, getCategorias } from '@/lib/actions/products'
import type { Transporte } from '@/types/products'
import type { TransporteFormData } from '@/components/products/transporte-form'

export default function TransportesPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [transportes, setTransportes] = useState<Transporte[]>([])
  const [categorias, setCategorias] = useState<Array<{ id: string; nome: string }>>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedTransporte, setSelectedTransporte] = useState<Transporte | null>(null)
  const [itemToDelete, setItemToDelete] = useState<Transporte | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [transportesData, categoriasData] = await Promise.all([
        getTransportes(),
        getCategorias()
      ])
      setTransportes(transportesData)
      setCategorias(categoriasData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao carregar transportes',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedTransporte(null)
    setDialogOpen(true)
  }

  const handleEdit = (transporte: Transporte) => {
    setSelectedTransporte(transporte)
    setDialogOpen(true)
  }

  const handleDelete = (transporte: Transporte) => {
    setItemToDelete(transporte)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return

    try {
      await deleteTransporte(itemToDelete.id)
      toast({
        title: 'Sucesso',
        description: 'Transporte excluído com sucesso',
      })
      loadData()
    } catch (error) {
      console.error('Erro ao excluir transporte:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao excluir transporte',
        variant: 'destructive',
      })
    } finally {
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    }
  }

  const handleSubmit = async (formData: TransporteFormData) => {
    try {
      setSubmitting(true)
      
      if (selectedTransporte) {
        await updateTransporte(selectedTransporte.id, formData)
        toast({
          title: 'Sucesso',
          description: 'Transporte atualizado com sucesso',
        })
      } else {
        await createTransporte(formData)
        toast({
          title: 'Sucesso',
          description: 'Transporte criado com sucesso',
        })
      }
      
      setDialogOpen(false)
      loadData()
    } catch (error) {
      console.error('Erro ao salvar transporte:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao salvar transporte',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getCategoriaNome = (categoriaId: string) => {
    const categoria = categorias.find(c => c.id === categoriaId)
    return categoria?.nome || 'Sem categoria'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transportes</h1>
          <p className="text-muted-foreground">
            Gerencie seus transportes turísticos
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Transporte
        </Button>
      </div>

      <ProductList
        title=""
        data={transportes}
        loading={loading}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        getItemTitle={(item) => item.nome}
        getItemDescription={(item) => `${item.origem} → ${item.destino}`}
        getItemPrice={(item) => item.preco}
        getItemStatus={(item) => ({ active: item.ativo, label: item.ativo ? 'Ativo' : 'Inativo' })}
        getItemImage={(item) => item.imagem_url}
        getItemCategory={(item) => getCategoriaNome(item.categoria_id)}
        searchFields={['nome', 'origem', 'destino', 'companhia']}
        filterOptions={[
          { label: 'Todos', value: 'all', filter: () => true },
          { label: 'Ativos', value: 'active', filter: (item) => item.ativo },
          { label: 'Inativos', value: 'inactive', filter: (item) => !item.ativo },
        ]}
        sortOptions={[
          { label: 'Nome (A-Z)', value: 'name-asc', sort: (a, b) => a.nome.localeCompare(b.nome) },
          { label: 'Nome (Z-A)', value: 'name-desc', sort: (a, b) => b.nome.localeCompare(a.nome) },
          { label: 'Preço (Menor)', value: 'price-asc', sort: (a, b) => a.preco - b.preco },
          { label: 'Preço (Maior)', value: 'price-desc', sort: (a, b) => b.preco - a.preco },
        ]}
      />

      {/* Dialog de Criação/Edição */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTransporte ? 'Editar Transporte' : 'Novo Transporte'}
            </DialogTitle>
            <DialogDescription>
              {selectedTransporte 
                ? 'Atualize as informações do transporte' 
                : 'Preencha as informações para criar um novo transporte'
              }
            </DialogDescription>
          </DialogHeader>
          
          <TransporteForm
            initialData={selectedTransporte || undefined}
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
            loading={submitting}
            categorias={categorias}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o transporte "{itemToDelete?.nome}"? 
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