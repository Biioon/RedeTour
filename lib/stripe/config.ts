import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY não está configurada')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  typescript: true,
})

export const STRIPE_CONFIG = {
  currency: 'BRL',
  locale: 'pt-BR',
  successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
  cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  plans: {
    starter: {
      monthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID || '',
      yearly: process.env.STRIPE_STARTER_YEARLY_PRICE_ID || '',
    },
    professional: {
      monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '',
      yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || '',
    },
    enterprise: {
      monthly: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || '',
      yearly: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID || '',
    },
  },
  commissionRates: {
    direct: 0.15, // 15% para afiliados diretos
    indirect: 0.05, // 5% para afiliados indiretos
  },
  platformFee: 0.025, // 2.5% taxa da plataforma
}

// Tipos de produtos para comissão
export const PRODUCT_TYPES = {
  PACOTE_TURISTICO: 'pacote_turistico',
  ACOMODACAO: 'acomodacao',
  TRANSPORTE: 'transporte',
  PASSEIO: 'passeio',
  ASSINATURA: 'assinatura',
} as const

export type ProductType = typeof PRODUCT_TYPES[keyof typeof PRODUCT_TYPES]

// Status de pagamento
export const PAYMENT_STATUS = {
  PENDING: 'pendente',
  CONFIRMED: 'confirmada',
  CANCELLED: 'cancelada',
  REFUNDED: 'reembolsada',
} as const

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS]

// Métodos de pagamento
export const PAYMENT_METHODS = {
  CREDIT_CARD: 'cartao_credito',
  DEBIT_CARD: 'cartao_debito',
  PIX: 'pix',
  BOLETO: 'boleto',
} as const

export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS]

// Tipos de transação
export const TRANSACTION_TYPES = {
  SALE: 'venda',
  REFUND: 'reembolso',
  COMMISSION: 'comissao',
  SUBSCRIPTION: 'assinatura',
  FEE: 'taxa',
} as const

export type TransactionType = typeof TRANSACTION_TYPES[keyof typeof TRANSACTION_TYPES]

// Configuração de comissões por tipo de produto
export const COMMISSION_RATES = {
  [PRODUCT_TYPES.PACOTE_TURISTICO]: {
    default: 0.10, // 10%
    direct: 0.15,  // 15% para afiliados diretos
    indirect: 0.05, // 5% para afiliados indiretos
  },
  [PRODUCT_TYPES.ACOMODACAO]: {
    default: 0.08, // 8%
    direct: 0.12,  // 12% para afiliados diretos
    indirect: 0.03, // 3% para afiliados indiretos
  },
  [PRODUCT_TYPES.TRANSPORTE]: {
    default: 0.05, // 5%
    direct: 0.08,  // 8% para afiliados diretos
    indirect: 0.02, // 2% para afiliados indiretos
  },
  [PRODUCT_TYPES.PASSEIO]: {
    default: 0.10, // 10%
    direct: 0.15,  // 15% para afiliados diretos
    indirect: 0.05, // 5% para afiliados indiretos
  },
  [PRODUCT_TYPES.ASSINATURA]: {
    default: 0.20, // 20%
    direct: 0.30,  // 30% para afiliados diretos
    indirect: 0.10, // 10% para afiliados indiretos
  },
}

// Funções utilitárias
export function calculateCommission(
  productType: ProductType,
  amount: number,
  isDirect: boolean = false,
  isIndirect: boolean = false
): number {
  const rates = COMMISSION_RATES[productType]
  
  if (isDirect) {
    return amount * rates.direct
  } else if (isIndirect) {
    return amount * rates.indirect
  } else {
    return amount * rates.default
  }
}

export function calculatePlatformFee(amount: number): number {
  return amount * STRIPE_CONFIG.platformFee
}

export function formatCurrency(amount: number, currency: string = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

// Configuração de webhooks
export const STRIPE_WEBHOOK_EVENTS = {
  PAYMENT_INTENT_SUCCEEDED: 'payment_intent.succeeded',
  PAYMENT_INTENT_PAYMENT_FAILED: 'payment_intent.payment_failed',
  PAYMENT_INTENT_CANCELLED: 'payment_intent.cancelled',
  CHECKOUT_SESSION_COMPLETED: 'checkout.session.completed',
  CHECKOUT_SESSION_EXPIRED: 'checkout.session.expired',
  INVOICE_PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
  CUSTOMER_SUBSCRIPTION_CREATED: 'customer.subscription.created',
  CUSTOMER_SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  CUSTOMER_SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  TRANSFER_CREATED: 'transfer.created',
  TRANSFER_PAID: 'transfer.paid',
} as const

// Configuração de produtos Stripe
export interface StripeProductConfig {
  name: string
  description: string
  images?: string[]
  metadata?: Record<string, string>
}

export interface StripePriceConfig {
  unit_amount: number
  currency: string
  recurring?: {
    interval: 'month' | 'year'
    interval_count: number
  }
}

// Função para criar configuração de checkout
export function createCheckoutSessionConfig(
  items: Array<{
    price_data: {
      currency: string
      product_data: {
        name: string
        description?: string
        images?: string[]
        metadata?: Record<string, string>
      }
      unit_amount: number
      recurring?: {
        interval: 'month' | 'year'
        interval_count: number
      }
    }
    quantity: number
  }>,
  customerEmail?: string,
  metadata?: Record<string, string>,
  successUrl?: string,
  cancelUrl?: string
) {
  return {
    payment_method_types: ['card', 'boleto'],
    line_items: items,
    mode: items[0]?.price_data?.recurring ? 'subscription' : 'payment',
    success_url: successUrl || STRIPE_CONFIG.successUrl,
    cancel_url: cancelUrl || STRIPE_CONFIG.cancelUrl,
    customer_email: customerEmail,
    metadata: {
      ...metadata,
      platform: 'redetour',
      timestamp: new Date().toISOString(),
    },
    payment_intent_data: {
      metadata: metadata,
    },
    locale: STRIPE_CONFIG.locale,
    currency: STRIPE_CONFIG.currency,
  }
}