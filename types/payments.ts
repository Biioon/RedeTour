// Tipos para sistema de pagamentos Stripe do RedeTour

// Planos de assinatura
export interface PlanoAssinatura {
  id: string
  created_at: string
  updated_at: string
  nome: string
  descricao: string | null
  preco_mensal: number
  preco_anual: number
  recursos: string[]
  limite_produtos: number
  limite_imagens: number
  ativo: boolean
  stripe_price_id_mensal: string | null
  stripe_price_id_anual: string | null
  user_id: string
}

// Assinaturas dos usuários
export interface Assinatura {
  id: string
  created_at: string
  updated_at: string
  user_id: string
  plano_id: string
  status: 'ativa' | 'cancelada' | 'expirada' | 'suspensa'
  data_inicio: string
  data_fim: string | null
  intervalo: 'mensal' | 'anual'
  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  cancelar_no_fim_do_periodo: boolean
  valor_pago: number
  comissao_afiliado: number
  afiliado_id: string | null
  plano?: PlanoAssinatura
}

// Vendas de produtos
export interface Venda {
  id: string
  created_at: string
  updated_at: string
  user_id: string
  cliente_nome: string
  cliente_email: string
  cliente_telefone: string | null
  cliente_documento: string | null
  tipo_produto: 'pacote_turistico' | 'acomodacao' | 'transporte' | 'passeio'
  produto_id: string
  produto_nome: string
  produto_preco: number
  quantidade: number
  valor_total: number
  desconto: number
  taxas: number
  valor_final: number
  moeda: string
  status: 'pendente' | 'confirmada' | 'cancelada' | 'reembolsada'
  metodo_pagamento: 'cartao_credito' | 'cartao_debito' | 'pix' | 'boleto'
  parcelas: number
  data_viagem: string | null
  numero_voucher: string | null
  observacoes: string | null
  afiliado_id: string | null
  comissao_afiliado: number
  stripe_payment_intent_id: string | null
  stripe_checkout_session_id: string | null
  afiliado?: {
    id: string
    full_name: string
    email: string
  }
}

// Itens de vendas (para vendas múltiplas)
export interface VendaItem {
  id: string
  created_at: string
  venda_id: string
  tipo_produto: 'pacote_turistico' | 'acomodacao' | 'transporte' | 'passeio'
  produto_id: string
  produto_nome: string
  produto_preco: number
  quantidade: number
  subtotal: number
  desconto: number
}

// Transações financeiras
export interface Transacao {
  id: string
  created_at: string
  user_id: string
  tipo_transacao: 'venda' | 'reembolso' | 'comissao' | 'assinatura' | 'taxa'
  valor: number
  moeda: string
  status: 'pendente' | 'concluida' | 'falhou' | 'cancelada'
  descricao: string
  venda_id: string | null
  assinatura_id: string | null
  stripe_transaction_id: string | null
  gateway: string
  taxa_gateway: number
  valor_liquido: number
  afiliado_id: string | null
  comissao_afiliado: number
  venda?: Venda
  assinatura?: Assinatura
}

// Comissões de afiliados
export interface Comissao {
  id: string
  created_at: string
  updated_at: string
  afiliado_id: string
  venda_id: string | null
  assinatura_id: string | null
  tipo_comissao: 'venda' | 'assinatura'
  valor_comissao: number
  percentual_comissao: number
  status: 'pendente' | 'paga' | 'cancelada'
  data_pagamento: string | null
  stripe_transfer_id: string | null
  descricao: string
  afiliado?: {
    id: string
    full_name: string
    email: string
  }
  venda?: Venda
  assinatura?: Assinatura
}

// Configurações de comissão
export interface ConfiguracaoComissao {
  id: string
  created_at: string
  updated_at: string
  tipo_produto: 'pacote_turistico' | 'acomodacao' | 'transporte' | 'passeio' | 'assinatura'
  percentual_padrao: number
  percentual_afiliado_direto: number
  percentual_afiliado_indireto: number
  valor_minimo_comissao: number
  dias_para_pagamento: number
  ativo: boolean
  user_id: string
}

// Clientes (para histórico e retenção)
export interface Cliente {
  id: string
  created_at: string
  updated_at: string
  nome: string
  email: string
  telefone: string | null
  documento: string | null
  data_nascimento: string | null
  endereco: string | null
  cidade: string | null
  estado: string | null
  pais: string
  cep: string | null
  user_id: string
  total_compras: number
  valor_total_gasto: number
  data_ultima_compra: string | null
  status: 'ativo' | 'inativo' | 'vip'
}

// Tipos do Stripe
export interface StripeCheckoutSession {
  id: string
  object: string
  amount_total: number
  currency: string
  customer: string | null
  customer_email: string | null
  payment_intent: string | null
  payment_status: 'paid' | 'unpaid' | 'no_payment_required'
  status: 'open' | 'complete' | 'expired'
  success_url: string
  cancel_url: string
  metadata: Record<string, string>
  line_items: {
    data: Array<{
      id: string
      amount_total: number
      currency: string
      description: string
      price: {
        id: string
        unit_amount: number
        currency: string
        product: string
      }
      quantity: number
    }>
  }
  url: string
}

export interface StripePaymentIntent {
  id: string
  object: string
  amount: number
  currency: string
  status: 'succeeded' | 'processing' | 'requires_payment_method' | 'requires_confirmation' | 'canceled'
  customer: string | null
  payment_method: string | null
  charges: {
    data: Array<{
      id: string
      amount: number
      currency: string
      status: string
      payment_method_details: {
        type: string
        [key: string]: any
      }
      billing_details: {
        name: string | null
        email: string | null
        phone: string | null
        address: {
          city: string | null
          country: string | null
          line1: string | null
          line2: string | null
          postal_code: string | null
          state: string | null
        }
      }
    }>
  }
  metadata: Record<string, string>
}

export interface StripeSubscription {
  id: string
  object: string
  status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid'
  current_period_start: number
  current_period_end: number
  customer: string
  items: {
    data: Array<{
      id: string
      price: {
        id: string
        unit_amount: number
        currency: string
        recurring: {
          interval: 'month' | 'year'
        }
        product: string
      }
    }>
  }
  metadata: Record<string, string>
}

// Tipos para formulários
export interface CheckoutFormData {
  cliente_nome: string
  cliente_email: string
  cliente_telefone?: string
  cliente_documento?: string
  metodo_pagamento: 'cartao_credito' | 'cartao_debito' | 'pix' | 'boleto'
  parcelas?: number
  observacoes?: string
  afiliado_id?: string
}

export interface VendaFormData {
  cliente_nome: string
  cliente_email: string
  cliente_telefone?: string
  cliente_documento?: string
  data_viagem?: string
  observacoes?: string
  afiliado_id?: string
  itens: Array<{
    tipo_produto: 'pacote_turistico' | 'acomodacao' | 'transporte' | 'passeio'
    produto_id: string
    quantidade: number
    desconto?: number
  }>
}

// Tipos para relatórios
export interface RelatorioVendas {
  periodo: string
  total_vendas: number
  total_receita: number
  total_comissoes: number
  ticket_medio: number
  vendas_por_tipo: Record<string, number>
  vendas_por_status: Record<string, number>
  vendas_por_mes: Array<{
    mes: string
    vendas: number
    receita: number
    comissoes: number
  }>
  top_afiliados: Array<{
    afiliado_id: string
    nome: string
    total_vendas: number
    total_comissao: number
  }>
}

export interface RelatorioComissoes {
  periodo: string
  total_comissoes: number
  comissoes_pagas: number
  comissoes_pendentes: number
  comissoes_canceladas: number
  afiliados_ativos: number
  comissoes_por_afiliado: Array<{
    afiliado_id: string
    nome: string
    total_comissoes: number
    comissoes_pagas: number
    comissoes_pendentes: number
  }>
  comissoes_por_mes: Array<{
    mes: string
    total_comissoes: number
    comissoes_pagas: number
  }>
}

// Tipos para dashboard financeiro
export interface DashboardFinanceiro {
  resumo_geral: {
    total_vendas: number
    total_receita: number
    total_comissoes: number
    total_taxas: number
    receita_liquida: number
    vendas_mes_atual: number
    vendas_mes_anterior: number
    crescimento_percentual: number
  }
  vendas_recentes: Venda[]
  comissoes_pendentes: Comissao[]
  transacoes_recentes: Transacao[]
  grafico_vendas_mensal: Array<{
    mes: string
    vendas: number
    receita: number
  }>
  grafico_comissoes_mensal: Array<{
    mes: string
    comissoes: number
  }>
}