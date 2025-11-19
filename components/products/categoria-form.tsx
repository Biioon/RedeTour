'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload } from './image-upload'
import { Loader2 } from 'lucide-react'

// Schema de validação Zod
const categoriaSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(50, 'Nome muito longo'),
  descricao: z.string().max(500, 'Descrição muito longa').optional(),
  icone: z.string().max(50, 'Ícone muito longo').optional(),
  cor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor deve ser um hexadecimal válido (#RRGGBB)').optional(),
  imagem: z.instanceof(File).optional(),
})

export type CategoriaFormData = z.infer<typeof categoriaSchema>

interface CategoriaFormProps {
  initialData?: Partial<CategoriaFormData>
  onSubmit: (data: CategoriaFormData) => Promise<void>
  onCancel?: () => void
  loading?: boolean
}

export function CategoriaForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}: CategoriaFormProps) {
  const [imagemFile, setImagemFile] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CategoriaFormData>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: {
      ...initialData,
    },
  })

  const onFormSubmit = async (data: CategoriaFormData) => {
    try {
      await onSubmit({
        ...data,
        imagem: imagemFile || undefined,
      })
    } catch (error) {
      console.error('Erro ao enviar formulário:', error)
    }
  }

  const iconeOptions = [
    { value: 'hotel', label: '🏨 Hotel' },
    { value: 'pousada', label: '🏠 Pousada' },
    { value: 'resort', label: '🏖️ Resort' },
    { value: 'hostel', label: '🏢 Hostel' },
    { value: 'casa', label: '🏡 Casa' },
    { value: 'apartamento', label: '🏢 Apartamento' },
    { value: 'aviao', label: '✈️ Avião' },
    { value: 'onibus', label: '🚌 Ônibus' },
    { value: 'carro', label: '🚗 Carro' },
    { value: 'trem', label: '🚂 Trem' },
    { value: 'barco', label: '⛴️ Barco' },
    { value: 'van', label: '🚐 Van' },
    { value: 'passeio', label: '🚶 Passeio' },
    { value: 'praia', label: '🏖️ Praia' },
    { value: 'montanha', label: '⛰️ Montanha' },
    { value: 'cidade', label: '🏙️ Cidade' },
    { value: 'natureza', label: '🌳 Natureza' },
    { value: 'gastronomia', label: '🍽️ Gastronomia' },
    { value: 'cultura', label: '🎭 Cultura' },
    { value: 'aventura', label: '🏃 Aventura' },
  ]

  const corOptions = [
    { value: '#FF6B6B', label: 'Vermelho' },
    { value: '#4ECDC4', label: 'Turquesa' },
    { value: '#45B7D1', label: 'Azul' },
    { value: '#96CEB4', label: 'Verde' },
    { value: '#FFEAA7', label: 'Amarelo' },
    { value: '#DDA0DD', label: 'Roxo' },
    { value: '#98D8C8', label: 'Menta' },
    { value: '#F7DC6F', label: 'Dourado' },
    { value: '#BB8FCE', label: 'Lavanda' },
    { value: '#85C1E9', label: 'Céu' },
  ]

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informações Básicas */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome da Categoria *</Label>
            <Input
              id="nome"
              {...register('nome')}
              placeholder="Ex: Hotéis de Luxo"
              disabled={loading}
            />
            {errors.nome && <p className="text-sm text-red-500">{errors.nome.message}</p>}
          </div>

          <div>
            <Label htmlFor="icone">Ícone</Label>
            <Select
              onValueChange={(value) => setValue('icone', value)}
              defaultValue={initialData?.icone}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um ícone" />
              </SelectTrigger>
              <SelectContent>
                {iconeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.icone && <p className="text-sm text-red-500">{errors.icone.message}</p>}
          </div>

          <div>
            <Label htmlFor="cor">Cor</Label>
            <Select
              onValueChange={(value) => setValue('cor', value)}
              defaultValue={initialData?.cor}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma cor" />
              </SelectTrigger>
              <SelectContent>
                {corOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: option.value }}
                      />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.cor && <p className="text-sm text-red-500">{errors.cor.message}</p>}
          </div>
        </div>

        {/* Imagem */}
        <div className="space-y-4">
          <div>
            <Label>Imagem da Categoria</Label>
            <ImageUpload
              value={imagemFile || initialData?.imagem}
              onChange={setImagemFile}
              accept="image/*"
              maxSize={5}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Descrição */}
      <div>
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          {...register('descricao')}
          placeholder="Descreva esta categoria de produtos..."
          rows={4}
          disabled={loading}
        />
        {errors.descricao && <p className="text-sm text-red-500">{errors.descricao.message}</p>}
      </div>

      {/* Preview */}
      {watch('icone') && (
        <div className="border rounded-lg p-4">
          <Label>Preview da Categoria</Label>
          <div className="mt-2 flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
              style={{ backgroundColor: watch('cor') || '#e5e7eb' }}
            >
              {iconeOptions.find(opt => opt.value === watch('icone'))?.label?.split(' ')[0]}
            </div>
            <div>
              <div className="font-medium">{watch('nome') || 'Nome da Categoria'}</div>
              {watch('descricao') && (
                <div className="text-sm text-muted-foreground">{watch('descricao')}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Botões de Ação */}
      <div className="flex gap-4 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Atualizar' : 'Criar'} Categoria
        </Button>
      </div>
    </form>
  )
}