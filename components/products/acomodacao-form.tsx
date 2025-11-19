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
import { Loader2, Plus, X } from 'lucide-react'

// Schema de validação Zod
const acomodacaoSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100, 'Nome muito longo'),
  descricao: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres').max(1000, 'Descrição muito longa'),
  preco: z.number().positive('Preço deve ser positivo').max(100000, 'Preço muito alto'),
  tipo: z.enum(['hotel', 'pousada', 'resort', 'hostel', 'casa', 'apartamento'], {
    errorMap: () => ({ message: 'Tipo de acomodação inválido' })
  }),
  endereco: z.string().min(5, 'Endereço deve ter pelo menos 5 caracteres').max(200, 'Endereço muito longo'),
  cidade: z.string().min(2, 'Cidade deve ter pelo menos 2 caracteres').max(100, 'Cidade muito longa'),
  estado: z.string().min(2, 'Estado deve ter pelo menos 2 caracteres').max(50, 'Estado muito longo'),
  pais: z.string().min(2, 'País deve ter pelo menos 2 caracteres').max(50, 'País muito longo'),
  capacidade: z.number().int('Capacidade deve ser um número inteiro').positive('Capacidade deve ser positiva').max(100, 'Capacidade muito alta'),
  quartos: z.number().int('Quartos deve ser um número inteiro').positive('Quartos deve ser positivo').max(50, 'Número de quartos muito alto'),
  banheiros: z.number().int('Banheiros deve ser um número inteiro').positive('Banheiros deve ser positivo').max(50, 'Número de banheiros muito alto'),
  area_m2: z.number().int('Área deve ser um número inteiro').positive('Área deve ser positiva').max(10000, 'Área muito grande').optional(),
  comodidades: z.array(z.string().max(50, 'Comodidade muito longa')).max(20, 'Muitas comodidades'),
  check_in: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário inválido (use HH:MM)'),
  check_out: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário inválido (use HH:MM)'),
  politica_cancelamento: z.string().min(10, 'Política deve ter pelo menos 10 caracteres').max(1000, 'Política muito longa'),
  categoria_id: z.string().uuid('Categoria inválida'),
  imagem: z.instanceof(File).optional(),
})

export type AcomodacaoFormData = z.infer<typeof acomodacaoSchema>

interface AcomodacaoFormProps {
  initialData?: Partial<AcomodacaoFormData>
  onSubmit: (data: AcomodacaoFormData) => Promise<void>
  onCancel?: () => void
  loading?: boolean
  categorias: Array<{ id: string; nome: string }>
}

export function AcomodacaoForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  categorias,
}: AcomodacaoFormProps) {
  const [imagemFile, setImagemFile] = useState<File | null>(null)
  const [comodidadeInput, setComodidadeInput] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<AcomodacaoFormData>({
    resolver: zodResolver(acomodacaoSchema),
    defaultValues: {
      comodidades: [],
      check_in: '15:00',
      check_out: '11:00',
      ...initialData,
    },
  })

  const comodidades = watch('comodidades') || []

  const handleAddComodidade = () => {
    if (comodidadeInput.trim() && comodidades.length < 20) {
      setValue('comodidades', [...comodidades, comodidadeInput.trim()])
      setComodidadeInput('')
    }
  }

  const handleRemoveComodidade = (index: number) => {
    setValue(
      'comodidades',
      comodidades.filter((_, i) => i !== index)
    )
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddComodidade()
    }
  }

  const onFormSubmit = async (data: AcomodacaoFormData) => {
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
            <Label htmlFor="nome">Nome da Acomodação *</Label>
            <Input
              id="nome"
              {...register('nome')}
              placeholder="Ex: Hotel Paradise Resort"
              disabled={loading}
            />
            {errors.nome && <p className="text-sm text-red-500">{errors.nome.message}</p>}
          </div>

          <div>
            <Label htmlFor="tipo">Tipo de Acomodação *</Label>
            <Select
              onValueChange={(value) => setValue('tipo', value as any)}
              defaultValue={initialData?.tipo}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hotel">Hotel</SelectItem>
                <SelectItem value="pousada">Pousada</SelectItem>
                <SelectItem value="resort">Resort</SelectItem>
                <SelectItem value="hostel">Hostel</SelectItem>
                <SelectItem value="casa">Casa</SelectItem>
                <SelectItem value="apartamento">Apartamento</SelectItem>
              </SelectContent>
            </Select>
            {errors.tipo && <p className="text-sm text-red-500">{errors.tipo.message}</p>}
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
            <Label htmlFor="preco">Preço por noite (R$) *</Label>
            <Input
              id="preco"
              type="number"
              step="0.01"
              {...register('preco', { valueAsNumber: true })}
              placeholder="299.90"
              disabled={loading}
            />
            {errors.preco && <p className="text-sm text-red-500">{errors.preco.message}</p>}
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

      {/* Localização */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="endereco">Endereço *</Label>
          <Input
            id="endereco"
            {...register('endereco')}
            placeholder="Rua Principal, 123"
            disabled={loading}
          />
          {errors.endereco && <p className="text-sm text-red-500">{errors.endereco.message}</p>}
        </div>

        <div>
          <Label htmlFor="cidade">Cidade *</Label>
          <Input
            id="cidade"
            {...register('cidade')}
            placeholder="São Paulo"
            disabled={loading}
          />
          {errors.cidade && <p className="text-sm text-red-500">{errors.cidade.message}</p>}
        </div>

        <div>
          <Label htmlFor="estado">Estado *</Label>
          <Input
            id="estado"
            {...register('estado')}
            placeholder="SP"
            disabled={loading}
          />
          {errors.estado && <p className="text-sm text-red-500">{errors.estado.message}</p>}
        </div>

        <div>
          <Label htmlFor="pais">País *</Label>
          <Input
            id="pais"
            {...register('pais')}
            placeholder="Brasil"
            disabled={loading}
          />
          {errors.pais && <p className="text-sm text-red-500">{errors.pais.message}</p>}
        </div>
      </div>

      {/* Capacidade */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="capacidade">Capacidade *</Label>
          <Input
            id="capacidade"
            type="number"
            {...register('capacidade', { valueAsNumber: true })}
            placeholder="4"
            disabled={loading}
          />
          {errors.capacidade && <p className="text-sm text-red-500">{errors.capacidade.message}</p>}
        </div>

        <div>
          <Label htmlFor="quartos">Quartos *</Label>
          <Input
            id="quartos"
            type="number"
            {...register('quartos', { valueAsNumber: true })}
            placeholder="2"
            disabled={loading}
          />
          {errors.quartos && <p className="text-sm text-red-500">{errors.quartos.message}</p>}
        </div>

        <div>
          <Label htmlFor="banheiros">Banheiros *</Label>
          <Input
            id="banheiros"
            type="number"
            {...register('banheiros', { valueAsNumber: true })}
            placeholder="1"
            disabled={loading}
          />
          {errors.banheiros && <p className="text-sm text-red-500">{errors.banheiros.message}</p>}
        </div>

        <div>
          <Label htmlFor="area_m2">Área (m²)</Label>
          <Input
            id="area_m2"
            type="number"
            {...register('area_m2', { valueAsNumber: true })}
            placeholder="80"
            disabled={loading}
          />
          {errors.area_m2 && <p className="text-sm text-red-500">{errors.area_m2.message}</p>}
        </div>
      </div>

      {/* Horários */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="check_in">Check-in *</Label>
          <Input
            id="check_in"
            type="time"
            {...register('check_in')}
            disabled={loading}
          />
          {errors.check_in && <p className="text-sm text-red-500">{errors.check_in.message}</p>}
        </div>

        <div>
          <Label htmlFor="check_out">Check-out *</Label>
          <Input
            id="check_out"
            type="time"
            {...register('check_out')}
            disabled={loading}
          />
          {errors.check_out && <p className="text-sm text-red-500">{errors.check_out.message}</p>}
        </div>
      </div>

      {/* Comodidades */}
      <div>
        <Label>Comodidades</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={comodidadeInput}
            onChange={(e) => setComodidadeInput(e.target.value)}
            placeholder="Wi-Fi, Piscina, Ar condicionado..."
            onKeyPress={handleKeyPress}
            disabled={loading || comodidades.length >= 20}
          />
          <Button
            type="button"
            onClick={handleAddComodidade}
            disabled={loading || !comodidadeInput.trim() || comodidades.length >= 20}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {comodidades.map((comodidade, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-sm"
            >
              {comodidade}
              <button
                type="button"
                onClick={() => handleRemoveComodidade(index)}
                className="hover:bg-primary/20 rounded-full p-0.5"
                disabled={loading}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        {errors.comodidades && <p className="text-sm text-red-500">{errors.comodidades.message}</p>}
      </div>

      {/* Descrição */}
      <div>
        <Label htmlFor="descricao">Descrição *</Label>
        <Textarea
          id="descricao"
          {...register('descricao')}
          placeholder="Descreva a acomodação, suas características e diferenciais..."
          rows={4}
          disabled={loading}
        />
        {errors.descricao && <p className="text-sm text-red-500">{errors.descricao.message}</p>}
      </div>

      {/* Política de Cancelamento */}
      <div>
        <Label htmlFor="politica_cancelamento">Política de Cancelamento *</Label>
        <Textarea
          id="politica_cancelamento"
          {...register('politica_cancelamento')}
          placeholder="Descreva as condições de cancelamento..."
          rows={3}
          disabled={loading}
        />
        {errors.politica_cancelamento && <p className="text-sm text-red-500">{errors.politica_cancelamento.message}</p>}
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
          {initialData ? 'Atualizar' : 'Criar'} Acomodação
        </Button>
      </div>
    </form>
  )
}