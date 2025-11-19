'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageUpload } from './image-upload'
import { Switch } from '@/components/ui/switch'
import { Loader2, Plus, X } from 'lucide-react'

// Schema de validação Zod
const passeioSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100, 'Nome muito longo'),
  descricao: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres').max(1000, 'Descrição muito longa'),
  preco: z.number().positive('Preço deve ser positivo').max(10000, 'Preço muito alto'),
  duracao: z.string().min(2, 'Duração deve ter pelo menos 2 caracteres').max(50, 'Duração muito longa'),
  dificuldade: z.enum(['facil', 'moderado', 'dificil', 'extremo'], {
    errorMap: () => ({ message: 'Dificuldade inválida' })
  }),
  inclui_refeicao: z.boolean(),
  refeicao_descricao: z.string().max(500, 'Descrição da refeição muito longa').optional(),
  inclui_transporte: z.boolean(),
  transporte_descricao: z.string().max(500, 'Descrição do transporte muito longa').optional(),
  roteiro: z.array(z.string().max(200, 'Item do roteiro muito longo')).max(20, 'Muitos itens no roteiro'),
  requisitos: z.array(z.string().max(100, 'Requisito muito longo')).max(10, 'Muitos requisitos').optional(),
  observacoes: z.string().max(1000, 'Observações muito longas').optional(),
  local_encontro: z.string().min(5, 'Local de encontro deve ter pelo menos 5 caracteres').max(200, 'Local de encontro muito longo'),
  horario_encontro: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário inválido (use HH:MM)'),
  categoria_id: z.string().uuid('Categoria inválida'),
  imagem: z.instanceof(File).optional(),
})

export type PasseioFormData = z.infer<typeof passeioSchema>

interface PasseioFormProps {
  initialData?: Partial<PasseioFormData>
  onSubmit: (data: PasseioFormData) => Promise<void>
  onCancel?: () => void
  loading?: boolean
  categorias: Array<{ id: string; nome: string }>
}

export function PasseioForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  categorias,
}: PasseioFormProps) {
  const [imagemFile, setImagemFile] = useState<File | null>(null)
  const [roteiroInput, setRoteiroInput] = useState('')
  const [requisitoInput, setRequisitoInput] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PasseioFormData>({
    resolver: zodResolver(passeioSchema),
    defaultValues: {
      roteiro: [],
      requisitos: [],
      inclui_refeicao: false,
      inclui_transporte: false,
      ...initialData,
    },
  })

  const roteiro = watch('roteiro') || []
  const requisitos = watch('requisitos') || []
  const incluiRefeicao = watch('inclui_refeicao')
  const incluiTransporte = watch('inclui_transporte')

  const handleAddRoteiro = () => {
    if (roteiroInput.trim() && roteiro.length < 20) {
      setValue('roteiro', [...roteiro, roteiroInput.trim()])
      setRoteiroInput('')
    }
  }

  const handleRemoveRoteiro = (index: number) => {
    setValue(
      'roteiro',
      roteiro.filter((_, i) => i !== index)
    )
  }

  const handleAddRequisito = () => {
    if (requisitoInput.trim() && requisitos.length < 10) {
      setValue('requisitos', [...requisitos, requisitoInput.trim()])
      setRequisitoInput('')
    }
  }

  const handleRemoveRequisito = (index: number) => {
    setValue(
      'requisitos',
      requisitos.filter((_, i) => i !== index)
    )
  }

  const handleKeyPress = (setter: React.Dispatch<React.SetStateAction<string>>, addFunction: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addFunction()
    }
  }

  const onFormSubmit = async (data: PasseioFormData) => {
    try {
      await onSubmit({
        ...data,
        imagem: imagemFile || undefined,
      })
    } catch (error) {
      console.error('Erro ao enviar formulário:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informações Básicas */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome do Passeio *</Label>
            <Input
              id="nome"
              {...register('nome')}
              placeholder="Ex: City Tour Centro Histórico"
              disabled={loading}
            />
            {errors.nome && <p className="text-sm text-red-500">{errors.nome.message}</p>}
          </div>

          <div>
            <Label htmlFor="categoria_id">Categoria *</Label>
            <Select
              onValueChange={(value) => setValue('categoria_id', value)}
              defaultValue={initialData?.categoria_id}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((categoria) => (
                  <SelectItem key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoria_id && <p className="text-sm text-red-500">{errors.categoria_id.message}</p>}
          </div>

          <div>
            <Label htmlFor="preco">Preço (R$) *</Label>
            <Input
              id="preco"
              type="number"
              step="0.01"
              {...register('preco', { valueAsNumber: true })}
              placeholder="99.90"
              disabled={loading}
            />
            {errors.preco && <p className="text-sm text-red-500">{errors.preco.message}</p>}
          </div>

          <div>
            <Label htmlFor="duracao">Duração *</Label>
            <Input
              id="duracao"
              {...register('duracao')}
              placeholder="4 horas, Meio dia, Dia inteiro..."
              disabled={loading}
            />
            {errors.duracao && <p className="text-sm text-red-500">{errors.duracao.message}</p>}
          </div>

          <div>
            <Label htmlFor="dificuldade">Dificuldade *</Label>
            <Select
              onValueChange={(value) => setValue('dificuldade', value as any)}
              defaultValue={initialData?.dificuldade}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a dificuldade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="facil">Fácil</SelectItem>
                <SelectItem value="moderado">Moderado</SelectItem>
                <SelectItem value="dificil">Difícil</SelectItem>
                <SelectItem value="extremo">Extremo</SelectItem>
              </SelectContent>
            </Select>
            {errors.dificuldade && <p className="text-sm text-red-500">{errors.dificuldade.message}</p>}
          </div>
        </div>

        {/* Imagem */}
        <div className="space-y-4">
          <div>
            <Label>Imagem Principal</Label>
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

      {/* Local e Horário */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="local_encontro">Local de Encontro *</Label>
          <Input
            id="local_encontro"
            {...register('local_encontro')}
            placeholder="Praça Central, em frente ao ponto de ônibus..."
            disabled={loading}
          />
          {errors.local_encontro && <p className="text-sm text-red-500">{errors.local_encontro.message}</p>}
        </div>

        <div>
          <Label htmlFor="horario_encontro">Horário de Encontro *</Label>
          <Input
            id="horario_encontro"
            type="time"
            {...register('horario_encontro')}
            disabled={loading}
          />
          {errors.horario_encontro && <p className="text-sm text-red-500">{errors.horario_encontro.message}</p>}
        </div>
      </div>

      {/* Refeição */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="inclui_refeicao"
            checked={incluiRefeicao}
            onCheckedChange={(checked) => setValue('inclui_refeicao', checked)}
            disabled={loading}
          />
          <Label htmlFor="inclui_refeicao">Inclui Refeição</Label>
        </div>

        {incluiRefeicao && (
          <div>
            <Label htmlFor="refeicao_descricao">Descrição da Refeição</Label>
            <Textarea
              id="refeicao_descricao"
              {...register('refeicao_descricao')}
              placeholder="Descreva o que está incluído na refeição..."
              rows={3}
              disabled={loading}
            />
            {errors.refeicao_descricao && <p className="text-sm text-red-500">{errors.refeicao_descricao.message}</p>}
          </div>
        )}
      </div>

      {/* Transporte */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="inclui_transporte"
            checked={incluiTransporte}
            onCheckedChange={(checked) => setValue('inclui_transporte', checked)}
            disabled={loading}
          />
          <Label htmlFor="inclui_transporte">Inclui Transporte</Label>
        </div>

        {incluiTransporte && (
          <div>
            <Label htmlFor="transporte_descricao">Descrição do Transporte</Label>
            <Textarea
              id="transporte_descricao"
              {...register('transporte_descricao')}
              placeholder="Descreva o transporte incluído..."
              rows={3}
              disabled={loading}
            />
            {errors.transporte_descricao && <p className="text-sm text-red-500">{errors.transporte_descricao.message}</p>}
          </div>
        )}
      </div>

      {/* Roteiro */}
      <div>
        <Label>Roteiro</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={roteiroInput}
            onChange={(e) => setRoteiroInput(e.target.value)}
            placeholder="Visita ao ponto turístico, Caminhada pela trilha..."
            onKeyPress={handleKeyPress(setRoteiroInput, handleAddRoteiro)}
            disabled={loading || roteiro.length >= 20}
          />
          <Button
            type="button"
            onClick={handleAddRoteiro}
            disabled={loading || !roteiroInput.trim() || roteiro.length >= 20}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          {roteiro.map((item, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
              <span className="text-sm flex-1">{index + 1}. {item}</span>
              <button
                type="button"
                onClick={() => handleRemoveRoteiro(index)}
                className="hover:bg-destructive/20 rounded-full p-1"
                disabled={loading}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        {errors.roteiro && <p className="text-sm text-red-500">{errors.roteiro.message}</p>}
      </div>

      {/* Requisitos */}
      <div>
        <Label>Requisitos (opcional)</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={requisitoInput}
            onChange={(e) => setRequisitoInput(e.target.value)}
            placeholder="Idade mínima, Condição física, Documentação..."
            onKeyPress={handleKeyPress(setRequisitoInput, handleAddRequisito)}
            disabled={loading || requisitos.length >= 10}
          />
          <Button
            type="button"
            onClick={handleAddRequisito}
            disabled={loading || !requisitoInput.trim() || requisitos.length >= 10}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {requisitos.map((requisito, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-sm"
            >
              {requisito}
              <button
                type="button"
                onClick={() => handleRemoveRequisito(index)}
                className="hover:bg-primary/20 rounded-full p-0.5"
                disabled={loading}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        {errors.requisitos && <p className="text-sm text-red-500">{errors.requisitos.message}</p>}
      </div>

      {/* Observações */}
      <div>
        <Label htmlFor="observacoes">Observações (opcional)</Label>
        <Textarea
          id="observacoes"
          {...register('observacoes')}
          placeholder="Observações importantes sobre o passeio..."
          rows={4}
          disabled={loading}
        />
        {errors.observacoes && <p className="text-sm text-red-500">{errors.observacoes.message}</p>}
      </div>

      {/* Descrição */}
      <div>
        <Label htmlFor="descricao">Descrição *</Label>
        <Textarea
          id="descricao"
          {...register('descricao')}
          placeholder="Descreva o passeio, suas características e diferenciais..."
          rows={4}
          disabled={loading}
        />
        {errors.descricao && <p className="text-sm text-red-500">{errors.descricao.message}</p>}
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-4 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Atualizar' : 'Criar'} Passeio
        </Button>
      </div>
    </form>
  )
}