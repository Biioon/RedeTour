'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, CreditCard, User, Phone, Mail, Calendar } from 'lucide-react'

// Schema de validação
const checkoutSchema = z.object({
  cliente_nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100, 'Nome muito longo'),
  cliente_email: z.string().email('Email inválido').max(100, 'Email muito longo'),
  cliente_telefone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos').max(15, 'Telefone muito longo'),
  cliente_documento: z.string().min(11, 'CPF deve ter 11 dígitos').max(14, 'Documento muito longo'),
  metodo_pagamento: z.enum(['cartao_credito', 'cartao_debito', 'pix', 'boleto'], {
    errorMap: () => ({ message: 'Método de pagamento inválido' })
  }),
  parcelas: z.number().int().min(1).max(12).optional(),
  data_viagem: z.string().optional(),
  observacoes: z.string().max(500, 'Observações muito longas').optional(),
})

export type CheckoutFormData = z.infer<typeof checkoutSchema>

interface CheckoutFormProps {
  produtos: Array<{
    id: string
    nome: string
    descricao: string
    preco: number
    quantidade: number
    imagem?: string
    tipo: 'pacote_turistico' | 'acomodacao' | 'transporte' | 'passeio'
  }>
  valorTotal: number
  onSubmit: (data: CheckoutFormData) => Promise<void>
  loading?: boolean
  afiliadoId?: string
}

export function CheckoutForm({
  produtos,
  valorTotal,
  onSubmit,
  loading = false,
  afiliadoId,
}: CheckoutFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      metodo_pagamento: 'cartao_credito',
      parcelas: 1,
    },
  })

  const metodoPagamento = watch('metodo_pagamento')

  const onFormSubmit = async (data: CheckoutFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Erro ao processar checkout:', error)
    }
  }

  const getMetodoPagamentoLabel = (metodo: string) => {
    const labels = {
      'cartao_credito': 'Cartão de Crédito',
      'cartao_debito': 'Cartão de Débito',
      'pix': 'PIX',
      'boleto': 'Boleto Bancário',
    }
    return labels[metodo as keyof typeof labels] || metodo
  }

  const getMetodoPagamentoIcon = (metodo: string) => {
    switch (metodo) {
      case 'cartao_credito':
      case 'cartao_debito':
        return <CreditCard className="w-4 h-4" />
      case 'pix':
        return <span className="text-xs font-bold">PIX</span>
      case 'boleto':
        return <span className="text-xs font-bold">BRL</span>
      default:
        return <CreditCard className="w-4 h-4" />
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Formulário de Dados do Cliente */}
      <Card>
        <CardHeader>
          <CardTitle>Dados do Cliente</CardTitle>
          <CardDescription>
            Preencha os dados para concluir sua compra
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            {/* Dados Pessoais */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="cliente_nome">Nome Completo *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="cliente_nome"
                    {...register('cliente_nome')}
                    placeholder="João da Silva"
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
                {errors.cliente_nome && <p className="text-sm text-red-500">{errors.cliente_nome.message}</p>}
              </div>

              <div>
                <Label htmlFor="cliente_email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="cliente_email"
                    type="email"
                    {...register('cliente_email')}
                    placeholder="joao@example.com"
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
                {errors.cliente_email && <p className="text-sm text-red-500">{errors.cliente_email.message}</p>}
              </div>

              <div>
                <Label htmlFor="cliente_telefone">Telefone *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="cliente_telefone"
                    {...register('cliente_telefone')}
                    placeholder="(11) 99999-9999"
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
                {errors.cliente_telefone && <p className="text-sm text-red-500">{errors.cliente_telefone.message}</p>}
              </div>

              <div>
                <Label htmlFor="cliente_documento">CPF *</Label>
                <Input
                  id="cliente_documento"
                  {...register('cliente_documento')}
                  placeholder="000.000.000-00"
                  disabled={loading}
                />
                {errors.cliente_documento && <p className="text-sm text-red-500">{errors.cliente_documento.message}</p>}
              </div>
            </div>

            {/* Método de Pagamento */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="metodo_pagamento">Método de Pagamento *</Label>
                <Select
                  onValueChange={(value) => setValue('metodo_pagamento', value as any)}
                  defaultValue={metodoPagamento}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o método de pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cartao_credito">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Cartão de Crédito
                      </div>
                    </SelectItem>
                    <SelectItem value="cartao_debito">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Cartão de Débito
                      </div>
                    </SelectItem>
                    <SelectItem value="pix">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold">PIX</span>
                        PIX
                      </div>
                    </SelectItem>
                    <SelectItem value="boleto">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold">BRL</span>
                        Boleto Bancário
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.metodo_pagamento && <p className="text-sm text-red-500">{errors.metodo_pagamento.message}</p>}
              </div>

              {metodoPagamento === 'cartao_credito' && (
                <div>
                  <Label htmlFor="parcelas">Parcelas</Label>
                  <Select
                    onValueChange={(value) => setValue('parcelas', parseInt(value))}
                    defaultValue="1"
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o número de parcelas" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((parcela) => (
                        <SelectItem key={parcela} value={parcela.toString()}>
                          {parcela}x de {(valorTotal / parcela).toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Data da Viagem */}
            <div>
              <Label htmlFor="data_viagem">Data da Viagem (opcional)</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="data_viagem"
                  type="date"
                  {...register('data_viagem')}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Observações */}
            <div>
              <Label htmlFor="observacoes">Observações (opcional)</Label>
              <textarea
                id="observacoes"
                {...register('observacoes')}
                placeholder="Alguma observação importante..."
                rows={3}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading}
              />
              {errors.observacoes && <p className="text-sm text-red-500">{errors.observacoes.message}</p>}
            </div>

            {/* Botão de Submit */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  {getMetodoPagamentoIcon(metodoPagamento)}
                  <span className="ml-2">
                    Pagar {valorTotal.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </span>
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Resumo do Pedido */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo do Pedido</CardTitle>
          <CardDescription>
            {produtos.length} produto(s) no carrinho
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Lista de Produtos */}
            <div className="space-y-3">
              {produtos.map((produto, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  {produto.imagem && (
                    <img
                      src={produto.imagem}
                      alt={produto.nome}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium">{produto.nome}</h4>
                    <p className="text-sm text-muted-foreground">{produto.descricao}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{produto.quantidade}x</Badge>
                      <Badge variant="outline">{produto.tipo}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {(produto.preco * produto.quantidade).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {produto.preco.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}/un
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <span>Subtotal</span>
                <span>
                  {valorTotal.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span>Taxas (5.4%)</span>
                <span>
                  {(valorTotal * 0.054).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center font-semibold text-lg border-t pt-2">
                <span>Total</span>
                <span>
                  {(valorTotal * 0.946).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </span>
              </div>
            </div>

            {/* Informações de Pagamento */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 mb-2">Informações de Pagamento</h5>
              <div className="space-y-1 text-sm text-blue-700">
                <p>• Pagamento processado com segurança via Stripe</p>
                <p>• Seu pedido será confirmado em até 24 horas</p>
                <p>• Você receberá um email com os detalhes da compra</p>
                {afiliadoId && (
                  <p>• Compra indicada por afiliado - comissão será processada</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}