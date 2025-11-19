'use server'

import { createServerClient } from '@/lib/supabase/serverSupabase'
import type { Acomodacao, Passeio, Transporte } from '@/types/products'

export interface FavoritoItem {
  id: string
  tipo: 'accommodation' | 'experience' | 'vehicle'
  titulo: string
  descricao: string
  preco: number
  imagem_url?: string
  localizacao?: string
  categoria?: string
  avaliacao_media?: number
  total_avaliacoes?: number
  created_at: string
}

export async function getFavoritos(userId?: string): Promise<FavoritoItem[]> {
  const supabase = createServerClient()
  const currentUserId = userId || await getCurrentUserId()
  
  try {
    // Buscar favoritos do usuário
    const { data: favoritosData } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: false })

    if (!favoritosData || favoritosData.length === 0) {
      return []
    }

    // Buscar detalhes de cada produto favoritado
    const favoritosComDetalhes = await Promise.all(
      favoritosData.map(async (favorito) => {
        let produto = null
        
        switch (favorito.product_type) {
          case 'accommodation':
            const { data: acomodacao } = await supabase
              .from('accommodations')
              .select(`
                *,
                reviews!inner(rating)
              `)
              .eq('id', favorito.product_id)
              .single()
            
            if (acomodacao) {
              const avaliacaoMedia = calcularMediaAvaliacoes(acomodacao.reviews)
              produto = {
                id: acomodacao.id,
                tipo: 'accommodation' as const,
                titulo: acomodacao.title,
                descricao: acomodacao.description,
                preco: parseFloat(acomodacao.base_price),
                imagem_url: acomodacao.images?.[0],
                localizacao: acomodacao.address,
                categoria: 'Acomodação',
                avaliacao_media: avaliacaoMedia,
                total_avaliacoes: acomodacao.reviews?.length || 0,
                created_at: favorito.created_at
              }
            }
            break
            
          case 'experience':
            const { data: experiencia } = await supabase
              .from('experiences')
              .select(`
                *,
                reviews!inner(rating)
              `)
              .eq('id', favorito.product_id)
              .single()
            
            if (experiencia) {
              const avaliacaoMedia = calcularMediaAvaliacoes(experiencia.reviews)
              produto = {
                id: experiencia.id,
                tipo: 'experience' as const,
                titulo: experiencia.title,
                descricao: experiencia.description,
                preco: parseFloat(experiencia.price),
                imagem_url: experiencia.images?.[0],
                localizacao: experiencia.meeting_point?.address,
                categoria: experiencia.category,
                avaliacao_media: avaliacaoMedia,
                total_avaliacoes: experiencia.reviews?.length || 0,
                created_at: favorito.created_at
              }
            }
            break
            
          case 'vehicle':
            const { data: veiculo } = await supabase
              .from('vehicles')
              .select(`
                *,
                reviews!inner(rating)
              `)
              .eq('id', favorito.product_id)
              .single()
            
            if (veiculo) {
              const avaliacaoMedia = calcularMediaAvaliacoes(veiculo.reviews)
              produto = {
                id: veiculo.id,
                tipo: 'vehicle' as const,
                titulo: veiculo.title,
                descricao: veiculo.description,
                preco: parseFloat(veiculo.price),
                imagem_url: veiculo.images?.[0],
                localizacao: veiculo.location?.address,
                categoria: veiculo.category,
                avaliacao_media: avaliacaoMedia,
                total_avaliacoes: veiculo.reviews?.length || 0,
                created_at: favorito.created_at
              }
            }
            break
        }
        
        return produto
      })
    )

    return favoritosComDetalhes.filter(Boolean) as FavoritoItem[]
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error)
    return []
  }
}

export async function adicionarFavorito(productType: 'accommodation' | 'experience' | 'vehicle', productId: string, userId?: string): Promise<boolean> {
  const supabase = createServerClient()
  const currentUserId = userId || await getCurrentUserId()
  
  try {
    const { error } = await supabase
      .from('favorites')
      .insert({
        user_id: currentUserId,
        product_type: productType,
        product_id: productId
      })

    if (error) {
      console.error('Erro ao adicionar favorito:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Erro ao adicionar favorito:', error)
    return false
  }
}

export async function removerFavorito(productType: 'accommodation' | 'experience' | 'vehicle', productId: string, userId?: string): Promise<boolean> {
  const supabase = createServerClient()
  const currentUserId = userId || await getCurrentUserId()
  
  try {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', currentUserId)
      .eq('product_type', productType)
      .eq('product_id', productId)

    if (error) {
      console.error('Erro ao remover favorito:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Erro ao remover favorito:', error)
    return false
  }
}

export async function verificarFavorito(productType: 'accommodation' | 'experience' | 'vehicle', productId: string, userId?: string): Promise<boolean> {
  const supabase = createServerClient()
  const currentUserId = userId || await getCurrentUserId()
  
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', currentUserId)
      .eq('product_type', productType)
      .eq('product_id', productId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao verificar favorito:', error)
      return false
    }

    return !!data
  } catch (error) {
    console.error('Erro ao verificar favorito:', error)
    return false
  }
}

// Função auxiliar para obter o ID do usuário atual
async function getCurrentUserId(): Promise<string> {
  const supabase = createServerClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error || !session?.user) {
    throw new Error('Usuário não autenticado')
  }
  
  return session.user.id
}

// Função auxiliar para calcular média de avaliações
function calcularMediaAvaliacoes(reviews: any[]): number {
  if (!reviews || reviews.length === 0) return 0
  
  const soma = reviews.reduce((acc, review) => acc + (review.rating || 0), 0)
  return Math.round((soma / reviews.length) * 10) / 10
}