'use server'

import { createServerClient } from '@/lib/supabase/serverSupabase'
import type { Acomodacao, Transporte, Passeio, Categoria, PacoteTuristico } from '@/types/products'
import type { AcomodacaoFormData, TransporteFormData, PasseioFormData, CategoriaFormData } from '@/components/products'
import { revalidatePath } from 'next/cache'

// Função auxiliar para upload de imagens
async function uploadImage(file: File, bucket: string, path: string): Promise<string> {
  const supabase = createServerClient()
  const fileName = `${Date.now()}-${file.name}`
  const filePath = `${path}/${fileName}`

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file)

  if (error) {
    throw new Error(`Erro ao fazer upload da imagem: ${error.message}`)
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)

  return publicUrl
}

// Função auxiliar para obter user_id da sessão
async function getCurrentUserId(): Promise<string> {
  const supabase = createServerClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error || !session?.user) {
    throw new Error('Usuário não autenticado')
  }
  
  return session.user.id
}

// ==================== CATEGORIAS ====================

export async function getCategorias(): Promise<Categoria[]> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .order('nome', { ascending: true })

  if (error) {
    console.error('Erro ao buscar categorias:', error)
    throw new Error('Erro ao buscar categorias')
  }

  return data || []
}

export async function createCategoria(formData: CategoriaFormData): Promise<Categoria> {
  const supabase = createServerClient()
  const userId = await getCurrentUserId()

  let imagem_url = null
  if (formData.imagem) {
    try {
      imagem_url = await uploadImage(formData.imagem, 'categorias', 'categorias')
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error)
      throw new Error('Erro ao fazer upload da imagem')
    }
  }

  const { data, error } = await supabase
    .from('categorias')
    .insert({
      nome: formData.nome,
      descricao: formData.descricao,
      icone: formData.icone,
      cor: formData.cor,
      user_id: userId,
      imagem_url,
    })
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar categoria:', error)
    throw new Error('Erro ao criar categoria')
  }

  revalidatePath('/dashboard/categorias')
  return data
}

export async function updateCategoria(id: string, formData: CategoriaFormData): Promise<Categoria> {
  const supabase = createServerClient()
  const userId = await getCurrentUserId()

  let imagem_url = undefined
  if (formData.imagem) {
    try {
      imagem_url = await uploadImage(formData.imagem, 'categorias', 'categorias')
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error)
      throw new Error('Erro ao fazer upload da imagem')
    }
  }

  const updateData = {
    nome: formData.nome,
    descricao: formData.descricao,
    icone: formData.icone,
    cor: formData.cor,
    ...(imagem_url && { imagem_url }),
  }

  const { data, error } = await supabase
    .from('categorias')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar categoria:', error)
    throw new Error('Erro ao atualizar categoria')
  }

  revalidatePath('/dashboard/categorias')
  return data
}

export async function deleteCategoria(id: string): Promise<void> {
  const supabase = createServerClient()
  const userId = await getCurrentUserId()

  const { error } = await supabase
    .from('categorias')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    console.error('Erro ao deletar categoria:', error)
    throw new Error('Erro ao deletar categoria')
  }

  revalidatePath('/dashboard/categorias')
}

// ==================== ACOMODAÇÕES ====================

export async function getAcomodacoes(): Promise<Acomodacao[]> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('acomodacoes')
    .select(`*, categorias(nome)`)
    .order('nome', { ascending: true })

  if (error) {
    console.error('Erro ao buscar acomodações:', error)
    throw new Error('Erro ao buscar acomodações')
  }

  return data || []
}

export async function createAcomodacao(formData: AcomodacaoFormData): Promise<Acomodacao> {
  const supabase = createServerClient()
  const userId = await getCurrentUserId()

  let imagem_url = null
  if (formData.imagem) {
    try {
      imagem_url = await uploadImage(formData.imagem, 'acomodacoes', 'acomodacoes')
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error)
      throw new Error('Erro ao fazer upload da imagem')
    }
  }

  const { data, error } = await supabase
    .from('acomodacoes')
    .insert({
      ...formData,
      user_id: userId,
      imagem_url,
      comodidades: formData.comodidades || [],
    })
    .select(`*, categorias(nome)`)
    .single()

  if (error) {
    console.error('Erro ao criar acomodação:', error)
    throw new Error('Erro ao criar acomodação')
  }

  revalidatePath('/dashboard/acomodacoes')
  return data
}

export async function updateAcomodacao(id: string, formData: AcomodacaoFormData): Promise<Acomodacao> {
  const supabase = createServerClient()
  const userId = await getCurrentUserId()

  let imagem_url = undefined
  if (formData.imagem) {
    try {
      imagem_url = await uploadImage(formData.imagem, 'acomodacoes', 'acomodacoes')
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error)
      throw new Error('Erro ao fazer upload da imagem')
    }
  }

  const updateData = {
    ...formData,
    comodidades: formData.comodidades || [],
    ...(imagem_url && { imagem_url }),
  }

  const { data, error } = await supabase
    .from('acomodacoes')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId)
    .select(`*, categorias(nome)`)
    .single()

  if (error) {
    console.error('Erro ao atualizar acomodação:', error)
    throw new Error('Erro ao atualizar acomodação')
  }

  revalidatePath('/dashboard/acomodacoes')
  return data
}

export async function deleteAcomodacao(id: string): Promise<void> {
  const supabase = createServerClient()
  const userId = await getCurrentUserId()

  const { error } = await supabase
    .from('acomodacoes')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    console.error('Erro ao deletar acomodação:', error)
    throw new Error('Erro ao deletar acomodação')
  }

  revalidatePath('/dashboard/acomodacoes')
}

// ==================== TRANSPORTES ====================

export async function getTransportes(): Promise<Transporte[]> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('transportes')
    .select(`*, categorias(nome)`)
    .order('nome', { ascending: true })

  if (error) {
    console.error('Erro ao buscar transportes:', error)
    throw new Error('Erro ao buscar transportes')
  }

  return data || []
}

export async function createTransporte(formData: TransporteFormData): Promise<Transporte> {
  const supabase = createServerClient()
  const userId = await getCurrentUserId()

  let imagem_url = null
  if (formData.imagem) {
    try {
      imagem_url = await uploadImage(formData.imagem, 'transportes', 'transportes')
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error)
      throw new Error('Erro ao fazer upload da imagem')
    }
  }

  const { data, error } = await supabase
    .from('transportes')
    .insert({
      ...formData,
      user_id: userId,
      imagem_url,
    })
    .select(`*, categorias(nome)`)
    .single()

  if (error) {
    console.error('Erro ao criar transporte:', error)
    throw new Error('Erro ao criar transporte')
  }

  revalidatePath('/dashboard/transportes')
  return data
}

export async function updateTransporte(id: string, formData: TransporteFormData): Promise<Transporte> {
  const supabase = createServerClient()
  const userId = await getCurrentUserId()

  let imagem_url = undefined
  if (formData.imagem) {
    try {
      imagem_url = await uploadImage(formData.imagem, 'transportes', 'transportes')
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error)
      throw new Error('Erro ao fazer upload da imagem')
    }
  }

  const updateData = {
    ...formData,
    ...(imagem_url && { imagem_url }),
  }

  const { data, error } = await supabase
    .from('transportes')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId)
    .select(`*, categorias(nome)`)
    .single()

  if (error) {
    console.error('Erro ao atualizar transporte:', error)
    throw new Error('Erro ao atualizar transporte')
  }

  revalidatePath('/dashboard/transportes')
  return data
}

export async function deleteTransporte(id: string): Promise<void> {
  const supabase = createServerClient()
  const userId = await getCurrentUserId()

  const { error } = await supabase
    .from('transportes')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    console.error('Erro ao deletar transporte:', error)
    throw new Error('Erro ao deletar transporte')
  }

  revalidatePath('/dashboard/transportes')
}

// ==================== PASSEIOS ====================

export async function getPasseios(): Promise<Passeio[]> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('passeios')
    .select(`*, categorias(nome)`)
    .order('nome', { ascending: true })

  if (error) {
    console.error('Erro ao buscar passeios:', error)
    throw new Error('Erro ao buscar passeios')
  }

  return data || []
}

export async function createPasseio(formData: PasseioFormData): Promise<Passeio> {
  const supabase = createServerClient()
  const userId = await getCurrentUserId()

  let imagem_url = null
  if (formData.imagem) {
    try {
      imagem_url = await uploadImage(formData.imagem, 'passeios', 'passeios')
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error)
      throw new Error('Erro ao fazer upload da imagem')
    }
  }

  const { data, error } = await supabase
    .from('passeios')
    .insert({
      ...formData,
      user_id: userId,
      imagem_url,
      roteiro: formData.roteiro || [],
      requisitos: formData.requisitos || [],
    })
    .select(`*, categorias(nome)`)
    .single()

  if (error) {
    console.error('Erro ao criar passeio:', error)
    throw new Error('Erro ao criar passeio')
  }

  revalidatePath('/dashboard/passeios')
  return data
}

export async function updatePasseio(id: string, formData: PasseioFormData): Promise<Passeio> {
  const supabase = createServerClient()
  const userId = await getCurrentUserId()

  let imagem_url = undefined
  if (formData.imagem) {
    try {
      imagem_url = await uploadImage(formData.imagem, 'passeios', 'passeios')
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error)
      throw new Error('Erro ao fazer upload da imagem')
    }
  }

  const updateData = {
    ...formData,
    roteiro: formData.roteiro || [],
    requisitos: formData.requisitos || [],
    ...(imagem_url && { imagem_url }),
  }

  const { data, error } = await supabase
    .from('passeios')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId)
    .select(`*, categorias(nome)`)
    .single()

  if (error) {
    console.error('Erro ao atualizar passeio:', error)
    throw new Error('Erro ao atualizar passeio')
  }

  revalidatePath('/dashboard/passeios')
  return data
}

export async function deletePasseio(id: string): Promise<void> {
  const supabase = createServerClient()
  const userId = await getCurrentUserId()

  const { error } = await supabase
    .from('passeios')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    console.error('Erro ao deletar passeio:', error)
    throw new Error('Erro ao deletar passeio')
  }

  revalidatePath('/dashboard/passeios')
}