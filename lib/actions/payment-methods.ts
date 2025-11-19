'use server'

import { createServerClient } from '@/lib/supabase/serverSupabase'

export async function getMetodosPagamento(userId?: string) {
  const supabase = createServerClient()
  const currentUserId = userId || await getCurrentUserId()
  
  try {
    const { data: metodosData } = await supabase
      .from('saved_payment_methods')
      .select('*')
      .eq('user_id', currentUserId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (!metodosData || metodosData.length === 0) {
      return []
    }

    return metodosData
  } catch (error) {
    console.error('Erro ao buscar métodos de pagamento:', error)
    return []
  }
}

export async function salvarCartao(
  brand: string,
  last4: string,
  expMonth: number,
  expYear: number,
  holderName?: string,
  isDefault: boolean = false,
  userId?: string
) {
  const supabase = createServerClient()
  const currentUserId = userId || await getCurrentUserId()
  
  try {
    const { data: metodoData, error: metodoError } = await supabase
      .from('saved_payment_methods')
      .insert({
        user_id: currentUserId,
        type: 'card',
        is_active: true,
        is_default: isDefault
      })
      .select()
      .single()

    if (metodoError || !metodoData) {
      console.error('Erro ao criar método de pagamento:', metodoError)
      return null
    }

    const { error: cartaoError } = await supabase
      .from('saved_cards')
      .insert({
        payment_method_id: metodoData.id,
        brand: brand.toLowerCase(),
        last4,
        exp_month: expMonth,
        exp_year: expYear,
        holder_name: holderName
      })

    if (cartaoError) {
      console.error('Erro ao salvar cartão:', cartaoError)
      await supabase.from('saved_payment_methods').delete().eq('id', metodoData.id)
      return null
    }

    if (isDefault) {
      await desmarcarOutrosPadroes(metodoData.id, currentUserId)
    }

    return metodoData.id
  } catch (error) {
    console.error('Erro ao salvar cartão:', error)
    return null
  }
}

async function getCurrentUserId() {
  const supabase = createServerClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error || !session?.user) {
    throw new Error('Usuário não autenticado')
  }
  
  return session.user.id
}

async function desmarcarOutrosPadroes(metodoId: string, userId: string) {
  const supabase = createServerClient()
  
  const { error } = await supabase
    .from('saved_payment_methods')
    .update({ is_default: false })
    .eq('user_id', userId)
    .eq('is_default', true)
    .neq('id', metodoId)

  if (error) {
    console.error('Erro ao desmarcar outros métodos padrão:', error)
  }
}