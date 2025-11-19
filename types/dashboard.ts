// Tipos para dashboards personalizados do RedeTour

import type { 
  Venda, 
  Transacao, 
  Comissao, 
  Assinatura, 
  PlanoAssinatura,
  Cliente 
} from './payments'
import type { Acomodacao, Transporte, Passeio, Categoria } from './products'
import type { FavoritoItem } from '@/lib/actions/favorites'

// ==================== DASHBOARD ADMIN ====================

export interface AdminDashboardData {
  resumo_geral: {
    total_usuarios: number
    usuarios_ativos: number
    total_vendas: number
    total_receita: number
    total_comissoes: number
    vendas_mes_atual: number
    vendas_mes_anterior: number
    crescimento_percentual: number
    taxa_conversao: number
    ticket_medio: number
  }
  
  produtos_resumo: {
    total_acomodacoes: number
    total_transportes: number
    total_passeios: number
    total_categorias: number
    produtos_ativos: number
    produtos_inativos: number
    valor_total_produtos: number
  }
  
  vendas_por_tipo: Array<{
    tipo: string
    quantidade: number
    valor_total: number
    percentual: number
  }>
  
  usuarios_novos: Array<{
    data: string
    quantidade: number
  }>
  
  vendas_recentes: Venda[]
  usuarios_recentes: Usuario[]
  comissoes_pendentes: Comissao[]
  
  analytics: {
    taxa_conversao: number
    tempo_medio_compra: number
    valor_vida_cliente: number
    churn_rate: number
  }
}

// ==================== DASHBOARD CLIENTE ====================

export interface ClienteDashboardData {
  resumo_pessoal: {
    total_compras: number
    valor_total_gasto: number
    reservas_ativas: number
    proxima_viagem: string | null
    pontos_fidelidade: number
    nivel_cliente: 'bronze' | 'prata' | 'ouro' | 'diamante'
  }
  
  minhas_compras: Venda[]
  minhas_reservas: Reserva[]
  proximas_viagens: ProximaViagem[]
  
  historico_pagamentos: {
    transacoes: Transacao[]
    metodos_salvos: MetodoPagamento[]
    cartoes: CartaoCredito[]
  }
  
  favoritos: {
    acomodacoes: FavoritoItem[]
    passeios: FavoritoItem[]
    pacotes: FavoritoItem[]
  }
  
  recomendacoes: Recomendacao[]
}

export interface Reserva {
  id: string
  venda_id: string
  produto_tipo: 'acomodacao' | 'transporte' | 'passeio' | 'pacote'
  produto_nome: string
  data_checkin: string
  data_checkout: string
  localizacao: string
  status: 'confirmada' | 'pendente' | 'cancelada'
  valor: number
  imagem_url?: string
  observacoes?: string
}

export interface ProximaViagem {
  id: string
  destino: string
  data_ida: string
  data_volta: string
  dias_restantes: number
  tipo: 'acomodacao' | 'pacote' | 'passeio'
  status: 'confirmado' | 'pendente'
  valor_total: number
}

export interface MetodoPagamento {
  id: string
  tipo: 'cartao' | 'pix' | 'boleto'
  descricao: string
  ultimos_digitos?: string
  bandeira?: string
  validade?: string
  preferencial: boolean
}

export interface CartaoCredito {
  id: string
  numero_mascarado: string
  bandeira: string
  validade: string
  nome_titular: string
  preferencial: boolean
}

export interface Recomendacao {
  id: string
  tipo: 'acomodacao' | 'passeio' | 'pacote'
  titulo: string
  descricao: string
  preco: number
  desconto?: number
  imagem_url?: string
  motivo: string
}

// ==================== DASHBOARD AFILIADO ====================

export interface AfiliadoDashboardData {
  resumo_performance: {
    total_comissoes: number
    comissoes_pendentes: number
    comissoes_pagas: number
    total_indicacoes: number
    taxa_conversao: number
    valor_medio_comissao: number
    nivel_afiliado: 'bronze' | 'prata' | 'ouro' | 'diamante'
    proximo_nivel: {
      nivel: string
      requisito: number
      progresso: number
    }
  }
  
  estatisticas_mensais: {
    mes: string
    comissoes: number
    indicacoes: number
    conversao: number
  }[]
  
  comissoes_recentes: Comissao[]
  indicacoes_recentes: Indicacao[]
  
  links_afiliado: LinkAfiliado[]
  campanhas_ativas: CampanhaAfiliado[]
  
  ranking: {
    posicao: number
    total_afiliados: number
    top_afiliados: Array<{
      nome: string
      comissoes: number
      foto?: string
    }>
  }
}

export interface Indicacao {
  id: string
  data: string
  nome_indicado: string
  email_indicado: string
  produto: string
  valor_venda: number
  comissao: number
  status: 'pendente' | 'confirmada' | 'cancelada'
  codigo_afiliado: string
}

export interface LinkAfiliado {
  id: string
  codigo: string
  url: string
  nome_campanha: string
  produto_tipo?: 'acomodacao' | 'transporte' | 'passeio' | 'pacote' | 'assinatura'
  produto_id?: string
  clicks: number
  conversoes: number
  taxa_conversao: number
  comissoes_geradas: number
  criado_em: string
  ativo: boolean
}

export interface CampanhaAfiliado {
  id: string
  nome: string
  descricao: string
  tipo: 'produto' | 'geral' | 'assinatura'
  comissao_extra: number
  data_inicio: string
  data_fim: string
  ativa: boolean
  performance: {
    clicks: number
    conversoes: number
    comissoes: number
  }
}

// ==================== DASHBOARD PARCEIRO ====================

export interface ParceiroDashboardData {
  resumo_negocio: {
    total_produtos: number
    produtos_ativos: number
    total_vendas: number
    receita_total: number
    comissoes_pagas: number
    avaliacao_media: number
    tempo_resposta_medio: number
  }
  
  meus_produtos: {
    acomodacoes: Acomodacao[]
    transportes: Transporte[]
    passeios: Passeio[]
  }
  
  vendas_produtos: VendaProduto[]
  
  analytics_produtos: {
    produto_id: string
    produto_nome: string
    tipo: string
    visualizacoes: number
    interacoes: number
    vendas: number
    taxa_conversao: number
    receita: number
  }[]
  
  feedback_clientes: FeedbackCliente[]
  
  financeiro: {
    saldo_disponivel: number
    saldo_bloqueado: number
    proximo_recebimento: string
    historico_recebimentos: Recebimento[]
  }
}

export interface VendaProduto {
  id: string
  produto_nome: string
  produto_tipo: string
  cliente_nome: string
  data_venda: string
  data_viagem: string
  valor: number
  comissao_plataforma: number
  valor_liquido: number
  status: 'confirmada' | 'pendente' | 'cancelada'
}

export interface FeedbackCliente {
  id: string
  cliente_nome: string
  produto_nome: string
  avaliacao: number
  comentario: string
  data: string
  respondido: boolean
  resposta?: string
}

export interface Recebimento {
  id: string
  data: string
  descricao: string
  valor: number
  status: 'pendente' | 'processando' | 'pago' | 'falhou'
  metodo: 'transferencia' | 'paypal' | 'stripe'
}

// ==================== DADOS COMUNS ====================

export interface Usuario {
  id: string
  nome: string
  email: string
  tipo: 'admin' | 'cliente' | 'afiliado' | 'parceiro'
  avatar?: string
  telefone?: string
  data_cadastro: string
  ultimo_acesso: string
  ativo: boolean
  verificado: boolean
}

export interface Notificacao {
  id: string
  titulo: string
  mensagem: string
  tipo: 'info' | 'sucesso' | 'aviso' | 'erro'
  data: string
  lida: boolean
  acao?: {
    texto: string
    url: string
  }
}

export interface AtividadeRecente {
  id: string
  tipo: 'venda' | 'comissao' | 'cadastro' | 'atualizacao' | 'sistema'
  descricao: string
  data: string
  usuario?: string
  icone: string
}

// ==================== CONFIGURAÇÕES DE DASHBOARD ====================

export interface DashboardConfig {
  tipo_usuario: 'admin' | 'cliente' | 'afiliado' | 'parceiro'
  widgets: WidgetConfig[]
  tema: 'claro' | 'escuro' | 'sistema'
  layout: 'compacto' | 'normal' | 'expandido'
}

export interface WidgetConfig {
  id: string
  tipo: 'card' | 'grafico' | 'tabela' | 'lista' | 'calendario'
  titulo: string
  visivel: boolean
  ordem: number
  tamanho: 'pequeno' | 'medio' | 'grande'
  configuracoes?: Record<string, any>
}