'use server'

import { createServerClient } from '@/lib/supabase/serverSupabase'
import { stripe, STRIPE_CONFIG, createCheckoutSessionConfig } from './config'
import type { 
  Venda, 
  VendaFormData, 
  Assinatura, 
  PlanoAssinatura,
  Transacao,
  Comissao,
  Cliente,
  ConfiguracaoComissao,
  StripeCheckoutSession 
} from '@/types/payments'
import { revalidatePath } from 'next/cache'
import { calculateCommission, calculatePlatformFee, PRODUCT_TYPES } from './config'

// Funções auxiliares
async function getCurrentUserId(): Promise<string> {
  const supabase = createServerClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error || !session?.user) {
    throw new Error('Usuário não autenticado')
  }
  
  return session.user.id
}

async function getUserById(userId: string) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('users')
    .select('id, email, full_name')
    .eq('id', userId)
    .single()
  
  if (error) {
    throw new Error('Erro ao buscar usuário')
  }
  
  return data
}

// ==================== PLANEJAMENTO ====================

export async function getPlanosAssinatura(): Promise<PlanoAssinatura[]> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('planos_assinatura')
    .select('*')
    .eq('ativo', true)
    .order('preco_mensal', { ascending: true })

  if (error) {
    console.error('Erro ao buscar planos:', error)
    throw new Error('Erro ao buscar planos de assinatura')
  }

  return data || []
}

export async function getPlanoAssinaturaById(id: string): Promise<PlanoAssinatura | null> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('planos_assinatura')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Erro ao buscar plano:', error)
    return null
  }

  return data
}

// ==================== CHECKOUT SESSIONS ====================

export async function createCheckoutSession(formData: {
  items: Array<{
    name: string
    description?: string
    price: number
    quantity: number
    image?: string
    productId?: string
    productType?: string
  }>
  customerEmail?: string
  successUrl?: string
  cancelUrl?: string
  metadata?: Record<string, string>
}): Promise<{ sessionId: string; url: string }> {
  try {
    const userId = await getCurrentUserId()
    
    // Preparar items para Stripe
    const lineItems = formData.items.map(item => ({
      price_data: {
        currency: STRIPE_CONFIG.currency,
        product_data: {
          name: item.name,
          description: item.description || '',
          images: item.image ? [item.image] : undefined,
          metadata: {
            productId: item.productId || '',
            productType: item.productType || '',
            userId: userId,
          },
        },
        unit_amount: Math.round(item.price * 100), // Converter para centavos
      },
      quantity: item.quantity,
    }))

    const sessionConfig = createCheckoutSessionConfig(
      lineItems,
      formData.customerEmail,
      {
        userId,
        ...formData.metadata,
      },
      formData.successUrl,
      formData.cancelUrl
    )

    const session = await stripe.checkout.sessions.create(sessionConfig)

    if (!session.id || !session.url) {
      throw new Error('Erro ao criar sessão de checkout')
    }

    return {
      sessionId: session.id,
      url: session.url,
    }
  } catch (error) {
    console.error('Erro ao criar checkout session:', error)
    throw new Error('Erro ao criar sessão de checkout')
  }
}

export async function createSubscriptionCheckoutSession(formData: {
  planoId: string
  interval: 'month' | 'year'
  customerEmail?: string
  afiliadoId?: string
  successUrl?: string
  cancelUrl?: string
}): Promise<{ sessionId: string; url: string }> {
  try {
    const userId = await getCurrentUserId()
    const user = await getUserById(userId)
    
    // Buscar plano
    const plano = await getPlanoAssinaturaById(formData.planoId)
    if (!plano) {
      throw new Error('Plano não encontrado')
    }

    const priceId = formData.interval === 'month' 
      ? plano.stripe_price_id_mensal 
      : plano.stripe_price_id_anual

    if (!priceId) {
      throw new Error('Preço do plano não configurado no Stripe')
    }

    const lineItems = [{
      price: priceId,
      quantity: 1,
    }]

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'subscription',
      success_url: formData.successUrl || STRIPE_CONFIG.successUrl,
      cancel_url: formData.cancelUrl || STRIPE_CONFIG.cancelUrl,
      customer_email: formData.customerEmail || user.email,
      metadata: {
        userId,
        planoId: formData.planoId,
        interval: formData.interval,
        afiliadoId: formData.afiliadoId || '',
        type: 'subscription',
        platform: 'redetour',
      },
      locale: STRIPE_CONFIG.locale,
      currency: STRIPE_CONFIG.currency,
    })

    if (!session.id || !session.url) {
      throw new Error('Erro ao criar sessão de assinatura')
    }

    return {
      sessionId: session.id,
      url: session.url,
    }
  } catch (error) {
    console.error('Erro ao criar checkout session de assinatura:', error)
    throw new Error('Erro ao criar sessão de assinatura')
  }
}

// ==================== VENDAS ====================

export async function getVendas(): Promise<Venda[]> {
  const supabase = createServerClient()
  const userId = await getCurrentUserId()
  
  const { data, error } = await supabase
    .from('vendas')
    .select(`*, afiliado:afiliado_id(id, full_name, email)`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar vendas:', error)
    throw new Error('Erro ao buscar vendas')
  }

  return data || []
}

export async function getVendaById(id: string): Promise<Venda | null> {
  const supabase = createServerClient()
  const userId = await getCurrentUserId()
  
  const { data, error } = await supabase
    .from('vendas')
    .select(`*, afiliado:afiliado_id(id, full_name, email), itens:venda_itens(*)`)
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Erro ao buscar venda:', error)
    return null
  }

  return data
}

export async function createVenda(formData: VendaFormData): Promise<Venda> {
  const supabase = createServerClient()
  const userId = await getCurrentUserId()

  // Calcular valores totais
  let valorTotal = 0
  const itensCalculated = formData.itens.map(item => {
    const subtotal = item.produto_preco * item.quantidade
    const itemComDesconto = subtotal - (item.desconto || 0)
    valorTotal += itemComDesconto
    return {
      ...item,
      subtotal: itemComDesconto,
    }
  })

  // Calcular comissão do afiliado se houver
  let comissaoAfiliado = 0
  if (formData.afiliado_id) {
    // Para simplificar, usar taxa padrão de 10% sobre o valor total
    comissaoAfiliado = valorTotal * 0.10
  }

  // Calcular taxas (2.5% da plataforma + 2.9% do Stripe aproximadamente)
  const taxas = valorTotal * 0.054 // 5.4% total
  const valorFinal = valorTotal - taxas

  // Criar venda
  const { data: venda, error: vendaError } = await supabase
    .from('vendas')
    .insert({
      user_id: userId,
      cliente_nome: formData.cliente_nome,
      cliente_email: formData.cliente_email,
      cliente_telefone: formData.cliente_telefone,
      cliente_documento: formData.cliente_documento,
      tipo_produto: formData.itens[0].tipo_produto,
      produto_id: formData.itens[0].produto_id,
      produto_nome: formData.itens[0].produto_nome,
      produto_preco: formData.itens[0].produto_preco,
      quantidade: formData.itens[0].quantidade,
      valor_total: valorTotal,
      desconto: formData.itens[0].desconto || 0,
      taxas: taxas,
      valor_final: valorFinal,
      moeda: 'BRL',
      data_viagem: formData.data_viagem,
      observacoes: formData.observacoes,
      afiliado_id: formData.afiliado_id,
      comissao_afiliado: comissaoAfiliado,
    })
    .select()
    .single()

  if (vendaError) {
    console.error('Erro ao criar venda:', vendaError)
    throw new Error('Erro ao criar venda')
  }

  // Criar itens da venda se houver múltiplos
  if (formData.itens.length > 1) {
    const itensData = formData.itens.slice(1).map(item => ({
      venda_id: venda.id,
      tipo_produto: item.tipo_produto,
      produto_id: item.produto_id,
      produto_nome: item.produto_nome,
      produto_preco: item.produto_preco,
      quantidade: item.quantidade,
      subtotal: (item.produto_preco * item.quantidade) - (item.desconto || 0),
      desconto: item.desconto || 0,
    }))

    const { error: itensError } = await supabase
      .from('venda_itens')
      .insert(itensData)

    if (itensError) {
      console.error('Erro ao criar itens da venda:', itensError)
      // Não lançar erro para não quebrar a venda principal
    }
  }

  // Criar transação
  await createTransacao({
    user_id: userId,
    tipo_transacao: 'venda',
    valor: valorTotal,
    moeda: 'BRL',
    status: 'concluida',
    descricao: `Venda de ${formData.itens[0].produto_nome}`,
    venda_id: venda.id,
    taxa_gateway: taxas,
    valor_liquido: valorFinal,
    afiliado_id: formData.afiliado_id,
    comissao_afiliado: comissaoAfiliado,
  })

  // Criar comissão para afiliado se houver
  if (formData.afiliado_id) {
    await createComissao({
      afiliado_id: formData.afiliado_id,
      venda_id: venda.id,
      tipo_comissao: 'venda',
      valor_comissao: comissaoAfiliado,
      percentual_comissao: 10,
      status: 'pendente',
      descricao: `Comissão por venda de ${formData.itens[0].produto_nome}`,
    })
  }

  // Atualizar cliente ou criar novo
  await upsertCliente({
    nome: formData.cliente_nome,
    email: formData.cliente_email,
    telefone: formData.cliente_telefone,
    documento: formData.cliente_documento,
    user_id: userId,
  })

  revalidatePath('/dashboard/financeiro')
  return venda
}

// ==================== TRANSAÇÕES ====================

export async function getTransacoes(): Promise<Transacao[]> {
  const supabase = createServerClient()
  const userId = await getCurrentUserId()
  
  const { data, error } = await supabase
    .from('transacoes')
    .select(`*, venda(*), assinatura(*)`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Erro ao buscar transações:', error)
    throw new Error('Erro ao buscar transações')
  }

  return data || []
}

export async function createTransacao(transacaoData: Omit<Transacao, 'id' | 'created_at'>): Promise<Transacao> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('transacoes')
    .insert(transacaoData)
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar transação:', error)
    throw new Error('Erro ao criar transação')
  }

  return data
}

// ==================== COMISSÕES ====================

export async function getComissoes(): Promise<Comissao[]> {
  const supabase = createServerClient()
  const userId = await getCurrentUserId()
  
  const { data, error } = await supabase
    .from('comissoes')
    .select(`*, afiliado:afiliado_id(id, full_name, email)`)
    .or(`afiliado_id.eq.${userId},venda.user_id.eq.${userId},assinatura.user_id.eq.${userId}`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar comissões:', error)
    throw new Error('Erro ao buscar comissões')
  }

  return data || []
}

export async function getComissoesByAfiliado(afiliadoId: string): Promise<Comissao[]> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('comissoes')
    .select(`*, venda(*), assinatura(*)`)
    .eq('afiliado_id', afiliadoId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar comissões do afiliado:', error)
    throw new Error('Erro ao buscar comissões do afiliado')
  }

  return data || []
}

export async function createComissao(comissaoData: Omit<Comissao, 'id' | 'created_at' | 'updated_at'>): Promise<Comissao> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('comissoes')
    .insert(comissaoData)
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar comissão:', error)
    throw new Error('Erro ao criar comissão')
  }

  return data
}

export async function updateComissaoStatus(id: string, status: 'paga' | 'cancelada'): Promise<Comissao> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('comissoes')
    .update({ 
      status,
      data_pagamento: status === 'paga' ? new Date().toISOString() : null
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar comissão:', error)
    throw new Error('Erro ao atualizar comissão')
  }

  return data
}

// ==================== CLIENTES ====================

export async function getClientes(): Promise<Cliente[]> {
  const supabase = createServerClient()
  const userId = await getCurrentUserId()
  
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar clientes:', error)
    throw new Error('Erro ao buscar clientes')
  }

  return data || []
}

export async function getClienteByEmail(email: string): Promise<Cliente | null> {
  const supabase = createServerClient()
  const userId = await getCurrentUserId()
  
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('email', email)
    .eq('user_id', userId)
    .single()

  if (error) {
    return null
  }

  return data
}

export async function upsertCliente(clienteData: Omit<Cliente, 'id' | 'created_at' | 'updated_at' | 'total_compras' | 'valor_total_gasto' | 'data_ultima_compra'>): Promise<Cliente> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('clientes')
    .upsert(clienteData, { onConflict: 'email,user_id' })
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar/atualizar cliente:', error)
    throw new Error('Erro ao criar/atualizar cliente')
  }

  return data
}

// ==================== RELATÓRIOS ====================

export async function getRelatorioVendas(periodo: 'mes' | 'trimestre' | 'ano' = 'mes'): Promise<any> {
  const supabase = createServerClient()
  const userId = await getCurrentUserId()
  
  let dataInicio: Date
  const dataFim = new Date()
  
  switch (periodo) {
    case 'mes':
      dataInicio = new Date(dataFim.getFullYear(), dataFim.getMonth() - 1, dataFim.getDate())
      break
    case 'trimestre':
      dataInicio = new Date(dataFim.getFullYear(), dataFim.getMonth() - 3, dataFim.getDate())
      break
    case 'ano':
      dataInicio = new Date(dataFim.getFullYear() - 1, dataFim.getMonth(), dataFim.getDate())
      break
    default:
      dataInicio = new Date(dataFim.getFullYear(), dataFim.getMonth() - 1, dataFim.getDate())
  }

  // Buscar vendas do período
  const { data: vendas, error } = await supabase
    .from('vendas')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', dataInicio.toISOString())
    .lte('created_at', dataFim.toISOString())

  if (error) {
    console.error('Erro ao buscar vendas para relatório:', error)
    throw new Error('Erro ao buscar dados do relatório')
  }

  // Calcular estatísticas
  const totalVendas = vendas.length
  const totalReceita = vendas.reduce((sum, venda) => sum + venda.valor_final, 0)
  const totalComissoes = vendas.reduce((sum, venda) => sum + venda.comissao_afiliado, 0)
  const ticketMedio = totalVendas > 0 ? totalReceita / totalVendas : 0

  // Agrupar por tipo
  const vendasPorTipo = vendas.reduce((acc, venda) => {
    acc[venda.tipo_produto] = (acc[venda.tipo_produto] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Agrupar por status
  const vendasPorStatus = vendas.reduce((acc, venda) => {
    acc[venda.status] = (acc[venda.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Agrupar por mês
  const vendasPorMes = vendas.reduce((acc, venda) => {
    const mes = new Date(venda.created_at).toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit' })
    if (!acc[mes]) {
      acc[mes] = { vendas: 0, receita: 0, comissoes: 0 }
    }
    acc[mes].vendas += 1
    acc[mes].receita += venda.valor_final
    acc[mes].comissoes += venda.comissao_afiliado
    return acc
  }, {} as Record<string, { vendas: number; receita: number; comissoes: number }>)

  return {
    periodo,
    total_vendas: totalVendas,
    total_receita: totalReceita,
    total_comissoes: totalComissoes,
    ticket_medio: ticketMedio,
    vendas_por_tipo: vendasPorTipo,
    vendas_por_status: vendasPorStatus,
    vendas_por_mes: Object.entries(vendasPorMes).map(([mes, dados]) => ({
      mes,
      ...dados,
    })),
  }
}