'use server'

import { createServerClient } from '@/lib/supabase/serverSupabase'
import type { AdminDashboardData, 
  ClienteDashboardData, 
  AfiliadoDashboardData, 
  ParceiroDashboardData,
  Usuario,
  Notificacao,
  AtividadeRecente
} from '@/types/dashboard'
import { getFavoritos } from './favorites'
import type { Venda, Transacao, Comissao } from '@/types/payments'
import type { Acomodacao, Transporte, Passeio } from '@/types/products'
import { revalidatePath } from 'next/cache'

// ==================== FUNÇÕES AUXILIARES ====================

async function getCurrentUserId(): Promise<string> {
  const supabase = createServerClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error || !session?.user) {
    throw new Error('Usuário não autenticado')
  }
  
  return session.user.id
}

async function getUserRole(userId: string): Promise<string> {
  const supabase = createServerClient()
  
  // Verificar se é admin (primeiro usuário ou com role específica)
  const { data: adminUser } = await supabase
    .from('users')
    .select('id')
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  if (adminUser?.id === userId) {
    return 'admin'
  }

  // Verificar assinatura e roles
  const { data: assinatura } = await supabase
    .from('assinaturas')
    .select('plano_id')
    .eq('user_id', userId)
    .eq('status', 'ativa')
    .single()

  if (!assinatura) {
    return 'cliente'
  }

  // Verificar se é afiliado
  const { data: afiliadoData } = await supabase
    .from('comissoes')
    .select('id')
    .eq('afiliado_id', userId)
    .limit(1)

  if (afiliadoData) {
    return 'afiliado'
  }

  // Verificar se é parceiro (tem produtos cadastrados)
  const { data: produtosData } = await supabase
    .from('acomodacoes')
    .select('id')
    .eq('user_id', userId)
    .limit(1)

  if (produtosData) {
    return 'parceiro'
  }

  return 'cliente'
}

// ==================== DASHBOARD ADMIN ====================

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const supabase = createServerClient()
  
  try {
    // Obter dados gerais
    const [
      { count: totalUsuarios },
      { count: usuariosAtivos },
      vendasData,
      comissoesData,
      produtosData,
      usuariosRecentesData,
      atividadesRecentesData
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('ativo', true),
      supabase.from('vendas').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('comissoes').select('*'),
      supabase.from('acomodacoes').select('*').limit(100),
      supabase.from('users').select('id, email, full_name, created_at, last_sign_in_at').order('created_at', { ascending: false }).limit(10),
      getAtividadesRecentes()
    ])

    // Calcular estatísticas
    const totalVendas = vendasData.data?.length || 0
    const totalReceita = vendasData.data?.reduce((sum, venda) => sum + venda.valor_final, 0) || 0
    const totalComissoes = comissoesData.data?.reduce((sum, comissao) => sum + comissao.valor_comissao, 0) || 0
    
    // Vendas por mês (últimos 6 meses)
    const vendasPorMes = calcularVendasPorMes(vendasData.data || [])
    
    // Vendas por tipo de produto
    const vendasPorTipo = calcularVendasPorTipo(vendasData.data || [])
    
    // Calcular taxa de conversão e outras métricas
    const analytics = calcularAnalytics(vendasData.data || [], usuariosAtivos.count || 0)

    return {
      resumo_geral: {
        total_usuarios: totalUsuarios?.count || 0,
        usuarios_ativos: usuariosAtivos?.count || 0,
        total_vendas: totalVendas,
        total_receita: totalReceita,
        total_comissoes: totalComissoes,
        vendas_mes_atual: vendasPorMes[vendasPorMes.length - 1]?.vendas || 0,
        vendas_mes_anterior: vendasPorMes[vendasPorMes.length - 2]?.vendas || 0,
        crescimento_percentual: calcularCrescimento(vendasPorMes),
        taxa_conversao: analytics.taxa_conversao,
        ticket_medio: analytics.ticket_medio,
      },
      
      produtos_resumo: {
        total_acomodacoes: produtosData.data?.length || 0,
        total_transportes: 0, // TODO: Adicionar quando tiver transportes
        total_passeios: 0, // TODO: Adicionar quando tiver passeios
        total_categorias: 0, // TODO: Adicionar quando tiver categorias
        produtos_ativos: produtosData.data?.filter(p => p.ativo).length || 0,
        produtos_inativos: produtosData.data?.filter(p => !p.ativo).length || 0,
        valor_total_produtos: 0, // TODO: Calcular valor total
      },
      
      vendas_por_tipo: vendasPorTipo,
      
      usuarios_novos: usuariosRecentesData.data?.map(user => ({
        data: user.created_at,
        quantidade: 1
      })) || [],
      
      vendas_recentes: vendasData.data?.slice(0, 10) || [],
      usuarios_recentes: usuariosRecentesData.data?.map(user => ({
        id: user.id,
        nome: user.full_name || user.email.split('@')[0],
        email: user.email,
        tipo: 'cliente',
        data_cadastro: user.created_at,
        ultimo_acesso: user.last_sign_in_at,
        ativo: true,
        verificado: true
      })) || [],
      
      comissoes_pendentes: comissoesData.data?.filter(c => c.status === 'pendente').slice(0, 10) || [],
      
      analytics
    }
  } catch (error) {
    console.error('Erro ao buscar dados do admin dashboard:', error)
    throw new Error('Erro ao carregar dashboard administrativo')
  }
}

// ==================== DASHBOARD CLIENTE ====================

export async function getClienteDashboardData(userId?: string): Promise<ClienteDashboardData> {
  const supabase = createServerClient()
  const currentUserId = userId || await getCurrentUserId()
  
  try {
    // Buscar compras do cliente
    const { data: comprasData } = await supabase
      .from('vendas')
      .select('*')
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: false })
      .limit(20)

    // Buscar transações
    const { data: transacoesData } = await supabase
      .from('transacoes')
      .select('*')
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: false })
      .limit(10)

    // Buscar dados do usuário
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', currentUserId)
      .single()

    // Calcular resumo pessoal
    const totalCompras = comprasData?.length || 0
    const valorTotalGasto = comprasData?.reduce((sum, compra) => sum + compra.valor_final, 0) || 0
    const reservasAtivas = comprasData?.filter(c => c.status === 'confirmada' && c.data_viagem && new Date(c.data_viagem) > new Date()).length || 0

    // Buscar favoritos reais do cliente
    const favoritos = await getFavoritos(currentUserId)

    // Mock: recomendações baseadas em compras anteriores
    const recomendacoes = gerarRecomendacoesCliente(comprasData || [])

    return {
      resumo_pessoal: {
        total_compras: totalCompras,
        valor_total_gasto: valorTotalGasto,
        reservas_ativas: reservasAtivas,
        proxima_viagem: comprasData?.find(c => c.data_viagem && new Date(c.data_viagem) > new Date())?.data_viagem || null,
        pontos_fidelidade: Math.floor(valorTotalGasto / 100), // 1 ponto a cada R$ 100
        nivel_cliente: calcularNivelCliente(valorTotalGasto)
      },
      
      minhas_compras: comprasData || [],
      minhas_reservas: comprasData?.filter(c => c.data_viagem && new Date(c.data_viagem) > new Date()).map(c => ({
        id: c.id,
        venda_id: c.id,
        produto_tipo: c.tipo_produto,
        produto_nome: c.produto_nome,
        data_checkin: c.data_viagem,
        data_checkout: c.data_viagem, // TODO: Adicionar data checkout
        localizacao: 'Local não especificado', // TODO: Adicionar localização
        status: c.status,
        valor: c.valor_final,
        observacoes: c.observacoes
      })) || [],
      
      proximas_viagens: comprasData?.filter(c => c.data_viagem && new Date(c.data_viagem) > new Date()).map(c => ({
        id: c.id,
        destino: c.produto_nome,
        data_ida: c.data_viagem,
        data_volta: c.data_viagem, // TODO: Adicionar data volta
        dias_restantes: Math.ceil((new Date(c.data_viagem).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
        tipo: c.tipo_produto,
        status: c.status === 'confirmada' ? 'confirmado' : 'pendente',
        valor_total: c.valor_final
      })) || [],
      
      historico_pagamentos: {
        transacoes: transacoesData || [],
        metodos_salvos: [], // TODO: Implementar métodos de pagamento salvos
        cartoes: []
      },
      
      favoritos: {
        acomodacoes: favoritos.filter(f => f.tipo === 'accommodation'),
        passeios: favoritos.filter(f => f.tipo === 'experience'),
        pacotes: favoritos.filter(f => f.tipo === 'vehicle')
      },
      
      recomendacoes
    }
  } catch (error) {
    console.error('Erro ao buscar dados do cliente dashboard:', error)
    throw new Error('Erro ao carregar dashboard do cliente')
  }
}

// ==================== DASHBOARD AFILIADO ====================

export async function getAfiliadoDashboardData(userId?: string): Promise<AfiliadoDashboardData> {
  const supabase = createServerClient()
  const currentUserId = userId || await getCurrentUserId()
  
  try {
    // Buscar comissões do afiliado
    const { data: comissoesData } = await supabase
      .from('comissoes')
      .select('*')
      .eq('afiliado_id', currentUserId)
      .order('created_at', { ascending: false })

    // Buscar vendas indicadas por este afiliado
    const { data: vendasIndicadas } = await supabase
      .from('vendas')
      .select('*')
      .eq('afiliado_id', currentUserId)
      .order('created_at', { ascending: false })

    // Calcular estatísticas
    const totalComissoes = comissoesData?.reduce((sum, comissao) => sum + comissao.valor_comissao, 0) || 0
    const comissoesPagas = comissoesData?.filter(c => c.status === 'paga').reduce((sum, comissao) => sum + comissao.valor_comissao, 0) || 0
    const comissoesPendentes = comissoesData?.filter(c => c.status === 'pendente').reduce((sum, comissao) => sum + comissao.valor_comissao, 0) || 0
    const totalIndicacoes = vendasIndicadas?.length || 0

    // Calcular taxa de conversão
    const taxaConversao = totalIndicacoes > 0 ? (vendasIndicadas?.filter(v => v.status === 'confirmada').length || 0) / totalIndicacoes * 100 : 0

    // Gerar estatísticas mensais (últimos 6 meses)
    const estatisticasMensais = calcularEstatisticasMensaisAfiliado(comissoesData || [], vendasIndicadas || [])

    // Mock: links de afiliado
    const linksAfiliado = gerarLinksAfiliado(currentUserId)

    // Mock: campanhas ativas
    const campanhasAtivas = gerarCampanhasAfiliado()

    // Mock: ranking
    const ranking = {
      posicao: Math.floor(Math.random() * 100) + 1,
      total_afiliados: 500,
      top_afiliados: [
        { nome: 'João Silva', comissoes: 15000, foto: '' },
        { nome: 'Maria Santos', comissoes: 12000, foto: '' },
        { nome: 'Pedro Oliveira', comissoes: 10000, foto: '' }
      ]
    }

    return {
      resumo_performance: {
        total_comissoes,
        comissoes_pagas,
        comissoes_pendentes,
        total_indicacoes,
        taxa_conversao,
        valor_medio_comissao: comissoesData?.length ? totalComissoes / comissoesData.length : 0,
        nivel_afiliado: calcularNivelAfiliado(totalComissoes),
        proximo_nivel: calcularProximoNivelAfiliado(totalComissoes)
      },
      
      estatisticas_mensais,
      
      comissoes_recentes: comissoesData?.slice(0, 10) || [],
      
      indicacoes_recentes: vendasIndicadas?.map(venda => ({
        id: venda.id,
        data: venda.created_at,
        nome_indicado: venda.cliente_nome,
        email_indicado: venda.cliente_email,
        produto: venda.produto_nome,
        valor_venda: venda.valor_final,
        comissao: venda.comissao_afiliado,
        status: venda.status === 'confirmada' ? 'confirmada' : 'pendente',
        codigo_afiliado: 'AFF001' // TODO: Implementar código real
      })) || [],
      
      links_afiliado,
      campanhas_ativas,
      ranking
    }
  } catch (error) {
    console.error('Erro ao buscar dados do afiliado dashboard:', error)
    throw new Error('Erro ao carregar dashboard do afiliado')
  }
}

// ==================== DASHBOARD PARCEIRO ====================

export async function getParceiroDashboardData(userId?: string): Promise<ParceiroDashboardData> {
  const supabase = createServerClient()
  const currentUserId = userId || await getCurrentUserId()
  
  try {
    // Buscar produtos do parceiro
    const { data: acomodacoesData } = await supabase
      .from('acomodacoes')
      .select('*')
      .eq('user_id', currentUserId)

    // Buscar vendas dos produtos do parceiro
    const { data: vendasData } = await supabase
      .from('vendas')
      .select('*')
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: false })

    // Calcular estatísticas
    const totalProdutos = acomodacoesData?.length || 0
    const produtosAtivos = acomodacoesData?.filter(p => p.ativo).length || 0
    const totalVendas = vendasData?.length || 0
    const receitaTotal = vendasData?.reduce((sum, venda) => sum + venda.valor_final, 0) || 0
    const comissoesPagas = vendasData?.reduce((sum, venda) => sum + venda.comissao_afiliado, 0) || 0

    // Analytics por produto
    const analyticsProdutos = calcularAnalyticsProdutos(acomodacoesData || [], vendasData || [])

    // Mock: feedback dos clientes
    const feedbackClientes = gerarFeedbackClientes()

    // Mock: financeiro
    const financeiro = {
      saldo_disponivel: receitaTotal * 0.85, // 85% após comissões
      saldo_bloqueado: receitaTotal * 0.15, // 15% em comissões
      proximo_recebimento: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 dias
      historico_recebimentos: gerarHistoricoRecebimentos(receitaTotal)
    }

    return {
      resumo_negocio: {
        total_produtos: totalProdutos,
        produtos_ativos: produtosAtivos,
        total_vendas: totalVendas,
        receita_total: receitaTotal,
        comissoes_pagas: comissoesPagas,
        avaliacao_media: 4.5, // TODO: Implementar sistema de avaliação
        tempo_resposta_medio: 2.3 // TODO: Implementar métrica real
      },
      
      meus_produtos: {
        acomodacoes: acomodacoesData || [],
        transportes: [], // TODO: Adicionar transportes
        passeios: [] // TODO: Adicionar passeios
      },
      
      vendas_produtos: vendasData?.map(venda => ({
        id: venda.id,
        produto_nome: venda.produto_nome,
        produto_tipo: venda.tipo_produto,
        cliente_nome: venda.cliente_nome,
        data_venda: venda.created_at,
        data_viagem: venda.data_viagem,
        valor: venda.valor_final,
        comissao_plataforma: venda.valor_final * 0.10, // 10% da plataforma
        valor_liquido: venda.valor_final * 0.90,
        status: venda.status
      })) || [],
      
      analytics_produtos: analyticsProdutos,
      feedback_clientes: feedbackClientes,
      financeiro
    }
  } catch (error) {
    console.error('Erro ao buscar dados do parceiro dashboard:', error)
    throw new Error('Erro ao carregar dashboard do parceiro')
  }
}

// ==================== FUNÇÕES AUXILIARES ====================

function calcularVendasPorMes(vendas: Venda[]) {
  const vendasPorMes: Record<string, number> = {}
  
  vendas.forEach(venda => {
    const mes = new Date(venda.created_at).toISOString().slice(0, 7) // YYYY-MM
    vendasPorMes[mes] = (vendasPorMes[mes] || 0) + 1
  })

  // Converter para array e ordenar
  return Object.entries(vendasPorMes)
    .map(([mes, vendas]) => ({ mes, vendas }))
    .sort((a, b) => a.mes.localeCompare(b.mes))
    .slice(-6) // Últimos 6 meses
}

function calcularVendasPorTipo(vendas: Venda[]) {
  const vendasPorTipo: Record<string, { quantidade: number; valor_total: number }> = {}
  
  vendas.forEach(venda => {
    if (!vendasPorTipo[venda.tipo_produto]) {
      vendasPorTipo[venda.tipo_produto] = { quantidade: 0, valor_total: 0 }
    }
    vendasPorTipo[venda.tipo_produto].quantidade += 1
    vendasPorTipo[venda.tipo_produto].valor_total += venda.valor_final
  })

  const total = vendas.length
  return Object.entries(vendasPorTipo).map(([tipo, dados]) => ({
    tipo,
    quantidade: dados.quantidade,
    valor_total: dados.valor_total,
    percentual: (dados.quantidade / total) * 100
  }))
}

function calcularAnalytics(vendas: Venda[], usuariosAtivos: number) {
  const vendasConfirmadas = vendas.filter(v => v.status === 'confirmada').length
  const taxaConversao = usuariosAtivos > 0 ? (vendasConfirmadas / usuariosAtivos) * 100 : 0
  const ticketMedio = vendasConfirmadas > 0 ? vendas.filter(v => v.status === 'confirmada').reduce((sum, v) => sum + v.valor_final, 0) / vendasConfirmadas : 0

  return {
    taxa_conversao: taxaConversao,
    tempo_medio_compra: 3.5, // TODO: Implementar cálculo real
    valor_vida_cliente: ticketMedio * 2.5, // Estimativa
    churn_rate: 15.2 // TODO: Implementar cálculo real
  }
}

function calcularCrescimento(vendasPorMes: Array<{ mes: string; vendas: number }>) {
  if (vendasPorMes.length < 2) return 0
  
  const mesAtual = vendasPorMes[vendasPorMes.length - 1].vendas
  const mesAnterior = vendasPorMes[vendasPorMes.length - 2].vendas
  
  return mesAnterior > 0 ? ((mesAtual - mesAnterior) / mesAnterior) * 100 : 0
}

function calcularNivelCliente(valorGasto: number): 'bronze' | 'prata' | 'ouro' | 'diamante' {
  if (valorGasto >= 10000) return 'diamante'
  if (valorGasto >= 5000) return 'ouro'
  if (valorGasto >= 1000) return 'prata'
  return 'bronze'
}

function calcularNivelAfiliado(totalComissoes: number): 'bronze' | 'prata' | 'ouro' | 'diamante' {
  if (totalComissoes >= 50000) return 'diamante'
  if (totalComissoes >= 20000) return 'ouro'
  if (totalComissoes >= 5000) return 'prata'
  return 'bronze'
}

function calcularProximoNivelAfiliado(totalComissoes: number) {
  const niveis = [
    { nivel: 'prata', requisito: 5000 },
    { nivel: 'ouro', requisito: 20000 },
    { nivel: 'diamante', requisito: 50000 }
  ]
  
  const proximo = niveis.find(n => totalComissoes < n.requisito)
  
  if (!proximo) {
    return { nivel: 'diamante', requisito: 100000, progresso: Math.min((totalComissoes / 100000) * 100, 100) }
  }
  
  return {
    nivel: proximo.nivel,
    requisito: proximo.requisito,
    progresso: Math.min((totalComissoes / proximo.requisito) * 100, 100)
  }
}

function calcularEstatisticasMensaisAfiliado(comissoes: Comissao[], vendas: Venda[]) {
  const stats: Record<string, { comissoes: number; indicacoes: number; conversao: number }> = {}
  
  // Processar comissões
  comissoes.forEach(comissao => {
    const mes = new Date(comissao.created_at).toISOString().slice(0, 7)
    if (!stats[mes]) {
      stats[mes] = { comissoes: 0, indicacoes: 0, conversao: 0 }
    }
    stats[mes].comissoes += comissao.valor_comissao
  })
  
  // Processar vendas
  vendas.forEach(venda => {
    const mes = new Date(venda.created_at).toISOString().slice(0, 7)
    if (!stats[mes]) {
      stats[mes] = { comissoes: 0, indicacoes: 0, conversao: 0 }
    }
    stats[mes].indicacoes += 1
  })
  
  // Calcular conversão
  Object.keys(stats).forEach(mes => {
    const stat = stats[mes]
    stat.conversao = stat.indicacoes > 0 ? 100 : 0 // Simplificado
  })
  
  return Object.entries(stats)
    .map(([mes, dados]) => ({ mes, ...dados }))
    .sort((a, b) => a.mes.localeCompare(b.mes))
    .slice(-6)
}

function gerarLinksAfiliado(userId: string) {
  return [
    {
      id: '1',
      codigo: 'PROMO2024',
      url: `https://redetour.com/r/PROMO2024`,
      nome_campanha: 'Promoção 2024',
      clicks: 1250,
      conversoes: 45,
      taxa_conversao: 3.6,
      comissoes_geradas: 2250,
      criado_em: '2024-01-01',
      ativo: true
    },
    {
      id: '2',
      codigo: 'VERAO24',
      url: `https://redetour.com/r/VERAO24`,
      nome_campanha: 'Verão 2024',
      clicks: 890,
      conversoes: 32,
      taxa_conversao: 3.6,
      comissoes_geradas: 1600,
      criado_em: '2024-02-01',
      ativo: true
    }
  ]
}

function gerarCampanhasAfiliado() {
  return [
    {
      id: '1',
      nome: 'Black Friday',
      descricao: 'Campanha especial de Black Friday com comissões dobradas',
      tipo: 'geral' as const,
      comissao_extra: 10,
      data_inicio: '2024-11-01',
      data_fim: '2024-11-30',
      ativa: true,
      performance: {
        clicks: 5000,
        conversoes: 200,
        comissoes: 10000
      }
    }
  ]
}

function gerarRecomendacoesCliente(compras: Venda[]) {
  return [
    {
      id: '1',
      tipo: 'acomodacao' as const,
      titulo: 'Resort Paradise - Maceió',
      descricao: 'Resort all-inclusive com praia privativa',
      preco: 450,
      desconto: 50,
      imagem_url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400',
      motivo: 'Baseado em suas compras anteriores'
    },
    {
      id: '2',
      tipo: 'passeio' as const,
      titulo: 'City Tour São Paulo',
      descricao: 'Tour completo pelos principais pontos turísticos',
      preco: 120,
      desconto: 20,
      imagem_url: 'https://images.unsplash.com/photo-1560717845-968823efbee1?w=400',
      motivo: 'Promoção especial para você'
    }
  ]
}

function gerarFeedbackClientes() {
  return [
    {
      id: '1',
      cliente_nome: 'Ana Silva',
      produto_nome: 'Hotel Paradise',
      avaliacao: 5,
      comentario: 'Excelente experiência, recomendo muito!',
      data: '2024-01-15',
      respondido: true,
      resposta: 'Obrigado pela avaliação, Ana! Ficamos felizes que você tenha gostado.'
    },
    {
      id: '2',
      cliente_nome: 'Carlos Santos',
      produto_nome: 'Passeio City Tour',
      avaliacao: 4,
      comentario: 'Muito bom, mas poderia ter mais tempo em cada parada.',
      data: '2024-01-10',
      respondido: false
    }
  ]
}

function calcularAnalyticsProdutos(produtos: Acomodacao[], vendas: Venda[]) {
  return produtos.map(produto => {
    const vendasProduto = vendas.filter(v => v.produto_id === produto.id)
    const visualizacoes = Math.floor(Math.random() * 1000) + 100 // Mock
    const interacoes = Math.floor(visualizacoes * 0.1) // 10% das visualizações
    
    return {
      produto_id: produto.id,
      produto_nome: produto.nome,
      tipo: 'acomodacao',
      visualizacoes,
      interacoes,
      vendas: vendasProduto.length,
      taxa_conversao: visualizacoes > 0 ? (vendasProduto.length / visualizacoes) * 100 : 0,
      receita: vendasProduto.reduce((sum, v) => sum + v.valor_final, 0)
    }
  })
}

function gerarHistoricoRecebimentos(receitaTotal: number) {
  return [
    {
      id: '1',
      data: '2024-01-01',
      descricao: 'Pagamento mensal - Dezembro 2023',
      valor: receitaTotal * 0.3,
      status: 'pago' as const,
      metodo: 'transferencia' as const
    },
    {
      id: '2',
      data: '2023-12-01',
      descricao: 'Pagamento mensal - Novembro 2023',
      valor: receitaTotal * 0.25,
      status: 'pago' as const,
      metodo: 'transferencia' as const
    }
  ]
}

// ==================== NOTIFICAÇÕES E ATIVIDADES ====================

export async function getNotificacoes(userId?: string): Promise<Notificacao[]> {
  const supabase = createServerClient()
  const currentUserId = userId || await getCurrentUserId()
  
  try {
    // Mock: notificações baseadas no tipo de usuário
    return [
      {
        id: '1',
        titulo: 'Nova venda realizada',
        mensagem: 'Você acabou de receber uma nova venda no valor de R$ 450,00',
        tipo: 'sucesso',
        data: new Date().toISOString(),
        lida: false,
        acao: {
          texto: 'Ver detalhes',
          url: '/dashboard/vendas'
        }
      },
      {
        id: '2',
        titulo: 'Comissão liberada',
        mensagem: 'Sua comissão de R$ 67,50 foi liberada e está disponível para saque',
        tipo: 'info',
        data: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        lida: true
      }
    ]
  } catch (error) {
    console.error('Erro ao buscar notificações:', error)
    return []
  }
}

export async function getAtividadesRecentes(): Promise<AtividadeRecente[]> {
  try {
    // Mock: atividades recentes
    return [
      {
        id: '1',
        tipo: 'venda',
        descricao: 'Nova venda realizada - Hotel Paradise',
        data: new Date().toISOString(),
        usuario: 'João Silva',
        icone: '💰'
      },
      {
        id: '2',
        tipo: 'cadastro',
        descricao: 'Novo usuário cadastrado',
        data: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        usuario: 'Maria Santos',
        icone: '👤'
      },
      {
        id: '3',
        tipo: 'comissao',
        descricao: 'Comissão de R$ 67,50 liberada',
        data: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        icone: '💳'
      }
    ]
  } catch (error) {
    console.error('Erro ao buscar atividades recentes:', error)
    return []
  }
}

export async function marcarNotificacaoComoLida(notificacaoId: string): Promise<void> {
  const supabase = createServerClient()
  
  try {
    // TODO: Implementar marcação real no banco
    console.log(`Notificação ${notificacaoId} marcada como lida`)
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error)
    throw new Error('Erro ao marcar notificação como lida')
  }
}