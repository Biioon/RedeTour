'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/use-toast'
import { ProductList } from '@/components/products/product-list'
import { AcomodacaoForm } from '@/components/products/acomodacao-form'
import { getAcomodacoes, createAcomodacao, updateAcomodacao, deleteAcomodacao, getCategorias } from '@/lib/actions/products'
import type { Acomodacao } from '@/types/products'
import type { AcomodacaoFormData } from '@/components/products/acomodacao-form'

export default function AcomodacoesPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [acomodacoes, setAcomodacoes] = useState<Acomodacao[]>([])
  const [categorias, setCategorias] = useState<Array<{ id: string; nome: string }>>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedAcomodacao, setSelectedAcomodacao] = useState<Acomodacao | null>(null)
  const [itemToDelete, setItemToDelete] = useState<Acomodacao | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [acomodacoesData, categoriasData] = await Promise.all([
        getAcomodacoes(),
        getCategorias()
      ])
      setAcomodacoes(acomodacoesData)
      setCategorias(categoriasData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao carregar acomodações',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedAcomodacao(null)
    setDialogOpen(true)
  }

  const handleEdit = (acomodacao: Acomodacao) => {
    setSelectedAcomodacao(acomodacao)
    setDialogOpen(true)
  }

  const handleDelete = (acomodacao: Acomodacao) => {
    setItemToDelete(acomodacao)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return

    try {
      await deleteAcomodacao(itemToDelete.id)
      toast({
        title: 'Sucesso',
        description: 'Acomodação excluída com sucesso',
      })
      loadData()
    } catch (error) {
      console.error('Erro ao excluir acomodação:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao excluir acomodação',
        variant: 'destructive',
      })
    } finally {
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    }
  }

  const handleSubmit = async (formData: AcomodacaoFormData) => {
    try {
      setSubmitting(true)
      
      if (selectedAcomodacao) {
        await updateAcomodacao(selectedAcomodacao.id, formData)
        toast({
          title: 'Sucesso',
          description: 'Acomodação atualizada com sucesso',
        })
      } else {
        await createAcomodacao(formData)
        toast({
          title: 'Sucesso',
          description: 'Acomodação criada com sucesso',
        })
      }
      
      setDialogOpen(false)
      loadData()
    } catch (error) {
      console.error('Erro ao salvar acomodação:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao salvar acomodação',
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
          <h1 className="text-3xl font-bold tracking-tight">Acomodações</h1>
          <p className="text-muted-foreground">
            Gerencie suas acomodações turísticas
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Acomodação
        </Button>
      </div>

      <ProductList
        title=""
        data={acomodacoes}
        loading={loading}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        getItemTitle={(item) => item.nome}
        getItemDescription={(item) => item.descricao}
        getItemPrice={(item) => item.preco}
        getItemStatus={(item) => ({ active: item.ativo, label: item.ativo ? 'Ativo' : 'Inativo' })}
        getItemImage={(item) => item.imagem_url}
        getItemCategory={(item) => getCategoriaNome(item.categoria_id)}
        searchFields={['nome', 'descricao', 'cidade', 'estado']}
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
              {selectedAcomodacao ? 'Editar Acomodação' : 'Nova Acomodação'}
            </DialogTitle>
            <DialogDescription>
              {selectedAcomodacao 
                ? 'Atualize as informações da acomodação' 
                : 'Preencha as informações para criar uma nova acomodação'
              }
            </DialogDescription>
          </DialogHeader>
          
          <AcomodacaoForm
            initialData={selectedAcomodacao || undefined}
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
              Tem certeza que deseja excluir a acomodação "{itemToDelete?.nome}"? 
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