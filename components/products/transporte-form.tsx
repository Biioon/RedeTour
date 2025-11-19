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
import { Loader2 } from 'lucide-react'

// Schema de validação Zod
const transporteSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100, 'Nome muito longo'),
  descricao: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres').max(1000, 'Descrição muito longa'),
  preco: z.number().positive('Preço deve ser positivo').max(100000, 'Preço muito alto'),
  tipo: z.enum(['aviao', 'onibus', 'carro', 'trem', 'barco', 'van'], {
    errorMap: () => ({ message: 'Tipo de transporte inválido' })
  }),
  origem: z.string().min(2, 'Origem deve ter pelo menos 2 caracteres').max(100, 'Origem muito longa'),
  destino: z.string().min(2, 'Destino deve ter pelo menos 2 caracteres').max(100, 'Destino muito longo'),
  duracao_estimada: z.string().min(2, 'Duração deve ter pelo menos 2 caracteres').max(50, 'Duração muito longa'),
  capacidade: z.number().int('Capacidade deve ser um número inteiro').positive('Capacidade deve ser positiva').max(1000, 'Capacidade muito alta'),
  companhia: z.string().min(2, 'Companhia deve ter pelo menos 2 caracteres').max(100, 'Companhia muito longa'),
  numero_voo: z.string().max(20, 'Número do voo muito longo').optional(),
  horario_partida: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário inválido (use HH:MM)'),
  horario_chegada: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário inválido (use HH:MM)'),
  inclui_bagagem: z.boolean(),
  bagagem_descricao: z.string().max(500, 'Descrição da bagagem muito longa').optional(),
  categoria_id: z.string().uuid('Categoria inválida'),
  imagem: z.instanceof(File).optional(),
})

export type TransporteFormData = z.infer<typeof transporteSchema>

interface TransporteFormProps {
  initialData?: Partial<TransporteFormData>
  onSubmit: (data: TransporteFormData) => Promise<void>
  onCancel?: () => void
  loading?: boolean
  categorias: Array<{ id: string; nome: string }>
}

export function TransporteForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  categorias,
}: TransporteFormProps) {
  const [imagemFile, setImagemFile] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TransporteFormData>({
    resolver: zodResolver(transporteSchema),
    defaultValues: {
      inclui_bagagem: false,
      ...initialData,
    },
  })

  const incluiBagagem = watch('inclui_bagagem')

  const onFormSubmit = async (data: TransporteFormData) => {
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
            <Label htmlFor="nome">Nome do Transporte *</Label>
            <Input
              id="nome"
              {...register('nome')}
              placeholder="Ex: Voo SP-RJ"
              disabled={loading}
            />
            {errors.nome && <p className="text-sm text-red-500">{errors.nome.message}</p>}
          </div>

          <div>
            <Label htmlFor="tipo">Tipo de Transporte *</Label>
            <Select
              onValueChange={(value) => setValue('tipo', value as any)}
              defaultValue={initialData?.tipo}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aviao">Avião</SelectItem>
                <SelectItem value="onibus">Ônibus</SelectItem>
                <SelectItem value="carro">Carro</SelectItem>
                <SelectItem value="trem">Trem</SelectItem>
                <SelectItem value="barco">Barco</SelectItem>
                <SelectItem value="van">Van</SelectItem>
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
            <Label htmlFor="preco">Preço (R$) *</Label>
            <Input
              id="preco"
              type="number"
              step="0.01"
              {...register('preco', { valueAsNumber: true })}
              placeholder="199.90"
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

      {/* Rotas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="origem">Origem *</Label>
          <Input
            id="origem"
            {...register('origem')}
            placeholder="São Paulo"
            disabled={loading}
          />
          {errors.origem && <p className="text-sm text-red-500">{errors.origem.message}</p>}
        </div>

        <div>
          <Label htmlFor="destino">Destino *</Label>
          <Input
            id="destino"
            {...register('destino')}
            placeholder="Rio de Janeiro"
            disabled={loading}
          />
          {errors.destino && <p className="text-sm text-red-500">{errors.destino.message}</p>}
        </div>
      </div>

      {/* Companhia e Capacidade */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="companhia">Companhia *</Label>
          <Input
            id="companhia"
            {...register('companhia')}
            placeholder="Gol, Latam, Azul..."
            disabled={loading}
          />
          {errors.companhia && <p className="text-sm text-red-500">{errors.companhia.message}</p>}
        </div>

        <div>
          <Label htmlFor="capacidade">Capacidade *</Label>
          <Input
            id="capacidade"
            type="number"
            {...register('capacidade', { valueAsNumber: true })}
            placeholder="180"
            disabled={loading}
          />
          {errors.capacidade && <p className="text-sm text-red-500">{errors.capacidade.message}</p>}
        </div>

        <div>
          <Label htmlFor="duracao_estimada">Duração Estimada *</Label>
          <Input
            id="duracao_estimada"
            {...register('duracao_estimada')}
            placeholder="1h 30min"
            disabled={loading}
          />
          {errors.duracao_estimada && <p className="text-sm text-red-500">{errors.duracao_estimada.message}</p>}
        </div>
      </div>

      {/* Horários e Número do Voo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="horario_partida">Horário de Partida *</Label>
          <Input
            id="horario_partida"
            type="time"
            {...register('horario_partida')}
            disabled={loading}
          />
          {errors.horario_partida && <p className="text-sm text-red-500">{errors.horario_partida.message}</p>}
        </div>

        <div>
          <Label htmlFor="horario_chegada">Horário de Chegada *</Label>
          <Input
            id="horario_chegada"
            type="time"
            {...register('horario_chegada')}
            disabled={loading}
          />
          {errors.horario_chegada && <p className="text-sm text-red-500">{errors.horario_chegada.message}</p>}
        </div>

        <div>
          <Label htmlFor="numero_voo">Número do Voo (opcional)</Label>
          <Input
            id="numero_voo"
            {...register('numero_voo')}
            placeholder="G3 1234"
            disabled={loading}
          />
          {errors.numero_voo && <p className="text-sm text-red-500">{errors.numero_voo.message}</p>}
        </div>
      </div>

      {/* Bagagem */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="inclui_bagagem"
            checked={incluiBagagem}
            onCheckedChange={(checked) => setValue('inclui_bagagem', checked)}
            disabled={loading}
          />
          <Label htmlFor="inclui_bagagem">Inclui Bagagem</Label>
        </div>

        {incluiBagagem && (
          <div>
            <Label htmlFor="bagagem_descricao">Descrição da Bagagem</Label>
            <Textarea
              id="bagagem_descricao"
              {...register('bagagem_descricao')}
              placeholder="Descreva o que está incluído na bagagem..."
              rows={3}
              disabled={loading}
            />
            {errors.bagagem_descricao && <p className="text-sm text-red-500">{errors.bagagem_descricao.message}</p>}
          </div>
        )}
      </div>

      {/* Descrição */}
      <div>
        <Label htmlFor="descricao">Descrição *</Label>
        <Textarea
          id="descricao"
          {...register('descricao')}
          placeholder="Descreva o transporte, suas características e diferenciais..."
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
          {initialData ? 'Atualizar' : 'Criar'} Transporte
        </Button>
      </div>
    </form>
  )
}