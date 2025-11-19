import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_CONFIG, STRIPE_WEBHOOK_EVENTS } from '@/lib/stripe/config'
import { createServerClient } from '@/lib/supabase/serverSupabase'
import { createTransacao, createComissao, updateComissaoStatus } from '@/lib/stripe/actions'

// Função auxiliar para obter user_id da sessão
async function getUserIdFromCustomer(customerId: string): Promise<string | null> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (error || !data) {
    console.error('Erro ao buscar user_id do customer:', error)
    return null
  }

  return data.id
}

// Processar checkout.session.completed
async function handleCheckoutSessionCompleted(session: any) {
  console.log('[Webhook] Processando checkout.session.completed:', session.id)
  
  const supabase = createServerClient()
  const { metadata } = session

  if (!metadata?.userId) {
    console.error('[Webhook] userId não encontrado nos metadados')
    return
  }

  try {
    // Verificar se é uma assinatura ou pagamento único
    if (session.mode === 'subscription' && session.subscription) {
      // Processar assinatura
      await handleSubscriptionCreated(session)
    } else if (session.payment_intent) {
      // Processar pagamento único
      await handlePaymentIntentSucceeded({
        id: session.payment_intent,
        amount: session.amount_total,
        currency: session.currency,
        metadata: metadata,
        charges: {
          data: [{
            id: session.payment_intent,
            amount: session.amount_total,
            currency: session.currency,
            status: 'succeeded',
            billing_details: {
              name: session.customer_details?.name,
              email: session.customer_details?.email,
              phone: session.customer_details?.phone,
              address: session.customer_details?.address,
            },
            payment_method_details: {
              type: 'card', // Simplificado, pode ser mais complexo
            },
          }],
        },
      })
    }

    console.log('[Webhook] Checkout session processado com sucesso:', session.id)
  } catch (error) {
    console.error('[Webhook] Erro ao processar checkout session:', error)
    throw error
  }
}

// Processar payment_intent.succeeded
async function handlePaymentIntentSucceeded(paymentIntent: any) {
  console.log('[Webhook] Processando payment_intent.succeeded:', paymentIntent.id)
  
  const { metadata, charges } = paymentIntent
  const userId = metadata?.userId
  const afiliadoId = metadata?.afiliadoId

  if (!userId) {
    console.error('[Webhook] userId não encontrado nos metadados')
    return
  }

  try {
    const charge = charges.data[0]
    const valorLiquido = paymentIntent.amount / 100 // Converter de centavos
    const taxaGateway = valorLiquido * 0.029 // 2.9% do Stripe
    const valorFinal = valorLiquido - taxaGateway

    // Criar transação de venda
    await createTransacao({
      user_id: userId,
      tipo_transacao: 'venda',
      valor: valorLiquido,
      moeda: paymentIntent.currency.toUpperCase(),
      status: 'concluida',
      descricao: `Pagamento via ${charge.payment_method_details.type}`,
      stripe_transaction_id: paymentIntent.id,
      gateway: 'stripe',
      taxa_gateway: taxaGateway,
      valor_liquido: valorFinal,
      afiliado_id: afiliadoId || null,
      comissao_afiliado: 0, // Será calculado posteriormente
    })

    // Se houver afiliado, criar comissão
    if (afiliadoId) {
      const comissaoValor = valorLiquido * 0.10 // 10% de comissão
      await createComissao({
        afiliado_id: afiliadoId,
        tipo_comissao: 'venda',
        valor_comissao: comissaoValor,
        percentual_comissao: 10,
        status: 'pendente',
        descricao: `Comissão por venda processada`,
      })
    }

    console.log('[Webhook] Payment intent processado com sucesso:', paymentIntent.id)
  } catch (error) {
    console.error('[Webhook] Erro ao processar payment intent:', error)
    throw error
  }
}

// Processar payment_intent.payment_failed
async function handlePaymentIntentPaymentFailed(paymentIntent: any) {
  console.log('[Webhook] Processando payment_intent.payment_failed:', paymentIntent.id)
  
  const { metadata } = paymentIntent
  const userId = metadata?.userId

  if (!userId) {
    console.error('[Webhook] userId não encontrado nos metadados')
    return
  }

  try {
    // Criar transação de falha
    await createTransacao({
      user_id: userId,
      tipo_transacao: 'venda',
      valor: paymentIntent.amount / 100,
      moeda: paymentIntent.currency.toUpperCase(),
      status: 'falhou',
      descricao: 'Pagamento falhou',
      stripe_transaction_id: paymentIntent.id,
      gateway: 'stripe',
      taxa_gateway: 0,
      valor_liquido: 0,
    })

    console.log('[Webhook] Payment intent falha processada:', paymentIntent.id)
  } catch (error) {
    console.error('[Webhook] Erro ao processar payment intent falha:', error)
    throw error
  }
}

// Processar customer.subscription.created
async function handleSubscriptionCreated(session: any) {
  console.log('[Webhook] Processando assinatura criada:', session.subscription)
  
  const supabase = createServerClient()
  const { metadata } = session
  const userId = metadata?.userId
  const planoId = metadata?.planoId
  const interval = metadata?.interval
  const afiliadoId = metadata?.afiliadoId

  if (!userId || !planoId || !interval) {
    console.error('[Webhook] Dados incompletos para assinatura')
    return
  }

  try {
    // Buscar detalhes da assinatura no Stripe
    const subscription = await stripe.subscriptions.retrieve(session.subscription)
    
    // Criar assinatura no banco de dados
    const { data: assinatura, error } = await supabase
      .from('assinaturas')
      .insert({
        user_id: userId,
        plano_id: planoId,
        status: 'ativa',
        data_inicio: new Date(subscription.current_period_start * 1000).toISOString(),
        data_fim: new Date(subscription.current_period_end * 1000).toISOString(),
        intervalo: interval,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer,
        valor_pago: subscription.items.data[0].price.unit_amount / 100,
        comissao_afiliado: 0,
        afiliado_id: afiliadoId || null,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Criar transação de assinatura
    const valorLiquido = subscription.items.data[0].price.unit_amount / 100
    const taxaGateway = valorLiquido * 0.029 // 2.9% do Stripe
    
    await createTransacao({
      user_id: userId,
      tipo_transacao: 'assinatura',
      valor: valorLiquido,
      moeda: 'BRL',
      status: 'concluida',
      descricao: `Assinatura ${interval === 'month' ? 'mensal' : 'anual'} criada`,
      assinatura_id: assinatura.id,
      stripe_transaction_id: subscription.id,
      gateway: 'stripe',
      taxa_gateway: taxaGateway,
      valor_liquido: valorLiquido - taxaGateway,
      afiliado_id: afiliadoId || null,
      comissao_afiliado: 0,
    })

    // Se houver afiliado, criar comissão
    if (afiliadoId) {
      const comissaoValor = valorLiquido * 0.30 // 30% de comissão para assinaturas
      await createComissao({
        afiliado_id: afiliadoId,
        assinatura_id: assinatura.id,
        tipo_comissao: 'assinatura',
        valor_comissao: comissaoValor,
        percentual_comissao: 30,
        status: 'pendente',
        descricao: `Comissão por assinatura ${interval === 'month' ? 'mensal' : 'anual'}`,
      })
    }

    console.log('[Webhook] Assinatura criada com sucesso:', subscription.id)
  } catch (error) {
    console.error('[Webhook] Erro ao processar assinatura:', error)
    throw error
  }
}

// Processar invoice.payment_succeeded (renovação de assinatura)
async function handleInvoicePaymentSucceeded(invoice: any) {
  console.log('[Webhook] Processando invoice.payment_succeeded:', invoice.id)
  
  if (!invoice.subscription) {
    console.log('[Webhook] Invoice não é de assinatura')
    return
  }

  try {
    const supabase = createServerClient()
    
    // Buscar assinatura no banco
    const { data: assinatura, error } = await supabase
      .from('assinaturas')
      .select('*')
      .eq('stripe_subscription_id', invoice.subscription)
      .single()

    if (error || !assinatura) {
      console.error('[Webhook] Assinatura não encontrada no banco')
      return
    }

    // Atualizar período da assinatura
    await supabase
      .from('assinaturas')
      .update({
        data_inicio: new Date(invoice.period_start * 1000).toISOString(),
        data_fim: new Date(invoice.period_end * 1000).toISOString(),
        valor_pago: invoice.amount_paid / 100,
      })
      .eq('id', assinatura.id)

    // Criar transação de renovação
    const valorLiquido = invoice.amount_paid / 100
    const taxaGateway = valorLiquido * 0.029
    
    await createTransacao({
      user_id: assinatura.user_id,
      tipo_transacao: 'assinatura',
      valor: valorLiquido,
      moeda: 'BRL',
      status: 'concluida',
      descricao: 'Renovação de assinatura',
      assinatura_id: assinatura.id,
      stripe_transaction_id: invoice.id,
      gateway: 'stripe',
      taxa_gateway: taxaGateway,
      valor_liquido: valorLiquido - taxaGateway,
      afiliado_id: assinatura.afiliado_id,
      comissao_afiliado: 0,
    })

    // Se houver afiliado, criar comissão de renovação
    if (assinatura.afiliado_id) {
      const comissaoValor = valorLiquido * 0.30 // 30% de comissão para renovações
      await createComissao({
        afiliado_id: assinatura.afiliado_id,
        assinatura_id: assinatura.id,
        tipo_comissao: 'assinatura',
        valor_comissao: comissaoValor,
        percentual_comissao: 30,
        status: 'pendente',
        descricao: 'Comissão por renovação de assinatura',
      })
    }

    console.log('[Webhook] Renovação de assinatura processada:', invoice.subscription)
  } catch (error) {
    console.error('[Webhook] Erro ao processar renovação:', error)
    throw error
  }
}

// Handler principal do webhook
export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Assinatura Stripe não fornecida' }, { status: 400 })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(body, sig, STRIPE_CONFIG.webhookSecret)
  } catch (err: any) {
    console.error('[Webhook] Erro na verificação da assinatura:', err.message)
    return NextResponse.json({ error: `Erro na verificação: ${err.message}` }, { status: 400 })
  }

  console.log('[Webhook] Evento recebido:', event.type)

  try {
    switch (event.type) {
      case STRIPE_WEBHOOK_EVENTS.CHECKOUT_SESSION_COMPLETED:
        await handleCheckoutSessionCompleted(event.data.object)
        break

      case STRIPE_WEBHOOK_EVENTS.PAYMENT_INTENT_SUCCEEDED:
        await handlePaymentIntentSucceeded(event.data.object)
        break

      case STRIPE_WEBHOOK_EVENTS.PAYMENT_INTENT_PAYMENT_FAILED:
        await handlePaymentIntentPaymentFailed(event.data.object)
        break

      case STRIPE_WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_CREATED:
        await handleSubscriptionCreated({
          subscription: event.data.object.id,
          metadata: event.data.object.metadata,
          mode: 'subscription',
        })
        break

      case STRIPE_WEBHOOK_EVENTS.INVOICE_PAYMENT_SUCCEEDED:
        await handleInvoicePaymentSucceeded(event.data.object)
        break

      default:
        console.log(`[Webhook] Evento não tratado: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Webhook] Erro ao processar evento:', error)
    return NextResponse.json({ error: 'Erro ao processar evento' }, { status: 500 })
  }
}