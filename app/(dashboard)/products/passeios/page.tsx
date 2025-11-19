'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/use-toast'
import { ProductList } from '@/components/products/product-list'
import { PasseioForm } from '@/components/products/passeio-form'
import { getPasseios, createPasseio, updatePasseio, deletePasseio, getCategorias } from '@/lib/actions/products'
import type { Passeio } from '@/types/products'
import type { PasseioFormData } from '@/components/products/passeio-form'

export default function PasseiosPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [passeios, setPasseios] = useState<Passeio[]>([])
  const [categorias, setCategorias] = useState<Array<{ id: string; nome: string }>>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPasseio, setSelectedPasseio] = useState<Passeio | null>(null)
  const [itemToDelete, setItemToDelete] = useState<Passeio | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [passeiosData, categoriasData] = await Promise.all([
        getPasseios(),
        getCategorias()
      ])
      setPasseios(passeiosData)
      setCategorias(categoriasData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao carregar passeios',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedPasseio(null)
    setDialogOpen(true)
  }

  const handleEdit = (passeio: Passeio) => {
    setSelectedPasseio(passeio)
    setDialogOpen(true)
  }

  const handleDelete = (passeio: Passeio) => {
    setItemToDelete(passeio)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return

    try {
      await deletePasseio(itemToDelete.id)
      toast({
        title: 'Sucesso',
        description: 'Passeio excluído com sucesso',
      })
      loadData()
    } catch (error) {
      console.error('Erro ao excluir passeio:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao excluir passeio',
        variant: 'destructive',
      })
    } finally {
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    }
  }

  const handleSubmit = async (formData: PasseioFormData) => {
    try {
      setSubmitting(true)
      
      if (selectedPasseio) {
        await updatePasseio(selectedPasseio.id, formData)
        toast({
          title: 'Sucesso',
          description: 'Passeio atualizado com sucesso',
        })
      } else {
        await createPasseio(formData)
        toast({
          title: 'Sucesso',
          description: 'Passeio criado com sucesso',
        })
      }
      
      setDialogOpen(false)
      loadData()
    } catch (error) {
      console.error('Erro ao salvar passeio:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao salvar passeio',
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

  const getDificuldadeLabel = (dificuldade: string) => {
    const labels = {
      'facil': 'Fácil',
      'moderado': 'Moderado',
      'dificil': 'Difícil',
      'extremo': 'Extremo'
    }
    return labels[dificuldade as keyof typeof labels] || dificuldade
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Passeios</h1>
          <p className="text-muted-foreground">
            Gerencie seus passeios turísticos
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Passeio
        </Button>
      </div>

      <ProductList
        title=""
        data={passeios}
        loading={loading}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        getItemTitle={(item) => item.nome}
        getItemDescription={(item) => `${item.duracao} • ${getDificuldadeLabel(item.dificuldade)}`}
        getItemPrice={(item) => item.preco}
        getItemStatus={(item) => ({ active: item.ativo, label: item.ativo ? 'Ativo' : 'Inativo' })}
        getItemImage={(item) => item.imagem_url}
        getItemCategory={(item) => getCategoriaNome(item.categoria_id)}
        searchFields={['nome', 'descricao', 'local_encontro']}
        filterOptions={[
          { label: 'Todos', value: 'all', filter: () => true },
          { label: 'Ativos', value: 'active', filter: (item) => item.ativo },
          { label: 'Inativos', value: 'inactive', filter: (item) => !item.ativo },
          { label: 'Fácil', value: 'facil', filter: (item) => item.dificuldade === 'facil' },
          { label: 'Moderado', value: 'moderado', filter: (item) => item.dificuldade === 'moderado' },
          { label: 'Difícil', value: 'dificil', filter: (item) => item.dificuldade === 'dificil' },
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
              {selectedPasseio ? 'Editar Passeio' : 'Novo Passeio'}
            </DialogTitle>
            <DialogDescription>
              {selectedPasseio 
                ? 'Atualize as informações do passeio' 
                : 'Preencha as informações para criar um novo passeio'
              }
            </DialogDescription>
          </DialogHeader>
          
          <PasseioForm
            initialData={selectedPasseio || undefined}
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
              Tem certeza que deseja excluir o passeio "{itemToDelete?.nome}"? 
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