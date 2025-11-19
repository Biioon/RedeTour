// Tipos base para produtos do RedeTour

export interface BaseProduct {
  id: string
  created_at: string
  updated_at: string
  nome: string
  descricao: string
  preco: number
  imagem_url?: string | null
  ativo: boolean
  user_id: string
}

// Categorias
export interface Categoria {
  id: string
  created_at: string
  updated_at: string
  nome: string
  descricao?: string | null
  icone?: string | null
  cor?: string | null
  ativo: boolean
  user_id: string
}

// Acomodações
export interface Acomodacao extends BaseProduct {
  tipo: 'hotel' | 'pousada' | 'resort' | 'hostel' | 'casa' | 'apartamento'
  endereco: string
  cidade: string
  estado: string
  pais: string
  capacidade: number
  quartos: number
  banheiros: number
  area_m2?: number | null
  comodidades: string[]
  check_in: string
  check_out: string
  politica_cancelamento: string
  categoria_id: string
}

// Transportes
export interface Transporte extends BaseProduct {
  tipo: 'aviao' | 'onibus' | 'carro' | 'trem' | 'barco' | 'van'
  origem: string
  destino: string
  duracao_estimada: string
  capacidade: number
  companhia: string
  numero_voo?: string | null
  horario_partida: string
  horario_chegada: string
  inclui_bagagem: boolean
  bagagem_descricao?: string | null
  categoria_id: string
}

// Passeios
export interface Passeio extends BaseProduct {
  duracao: string
  dificuldade: 'facil' | 'moderado' | 'dificil' | 'extremo'
  inclui_refeicao: boolean
  refeicao_descricao?: string | null
  inclui_transporte: boolean
  transporte_descricao?: string | null
  roteiro: string[]
  requisitos?: string[] | null
  observacoes?: string | null
  local_encontro: string
  horario_encontro: string
  categoria_id: string
}

// Pacotes Turísticos
export interface PacoteTuristico {
  id: string
  created_at: string
  updated_at: string
  nome: string
  descricao: string
  preco: number
  preco_original?: number | null
  desconto_percentual?: number | null
  imagem_url?: string | null
  imagens_galeria?: string[] | null
  duracao_dias: number
  data_inicio: string
  data_fim: string
  max_participantes: number
  min_participantes: number
  ativo: boolean
  destaque: boolean
  user_id: string
  acomodacao_id: string
  transporte_id: string
  passeio_ids: string[]
  inclusos: string[]
  exclusos: string[]
  roteiro: {
    dia: number
    titulo: string
    descricao: string
    atividades: string[]
  }[]
  condicoes_gerais: string
}

// Tipos para formulários
export interface AcomodacaoFormData {
  nome: string
  descricao: string
  preco: number
  tipo: Acomodacao['tipo']
  endereco: string
  cidade: string
  estado: string
  pais: string
  capacidade: number
  quartos: number
  banheiros: number
  area_m2?: number | null
  comodidades: string[]
  check_in: string
  check_out: string
  politica_cancelamento: string
  categoria_id: string
  imagem?: File | null
}

export interface TransporteFormData {
  nome: string
  descricao: string
  preco: number
  tipo: Transporte['tipo']
  origem: string
  destino: string
  duracao_estimada: string
  capacidade: number
  companhia: string
  numero_voo?: string | null
  horario_partida: string
  horario_chegada: string
  inclui_bagagem: boolean
  bagagem_descricao?: string | null
  categoria_id: string
  imagem?: File | null
}

export interface PasseioFormData {
  nome: string
  descricao: string
  preco: number
  duracao: string
  dificuldade: Passeio['dificuldade']
  inclui_refeicao: boolean
  refeicao_descricao?: string | null
  inclui_transporte: boolean
  transporte_descricao?: string | null
  roteiro: string[]
  requisitos?: string[] | null
  observacoes?: string | null
  local_encontro: string
  horario_encontro: string
  categoria_id: string
  imagem?: File | null
}

export interface PacoteTuristicoFormData {
  nome: string
  descricao: string
  preco: number
  preco_original?: number | null
  desconto_percentual?: number | null
  duracao_dias: number
  data_inicio: string
  data_fim: string
  max_participantes: number
  min_participantes: number
  acomodacao_id: string
  transporte_id: string
  passeio_ids: string[]
  inclusos: string[]
  exclusos: string[]
  roteiro: {
    dia: number
    titulo: string
    descricao: string
    atividades: string[]
  }[]
  condicoes_gerais: string
  imagem?: File | null
  imagens_galeria?: File[] | null
}

export interface CategoriaFormData {
  nome: string
  descricao?: string | null
  icone?: string | null
  cor?: string | null
}

// Tipos para filtros e busca
export interface ProductFilters {
  search?: string
  categoria?: string
  preco_min?: number
  preco_max?: number
  ativo?: boolean
  destaque?: boolean
  data_inicio?: string
  data_fim?: string
}

export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// Tipos para upload de imagens
export interface ImageUploadResult {
  url: string
  path: string
  size: number
  mimeType: string
}

// Tipos para relatórios e estatísticas
export interface ProductStats {
  totalProducts: number
  activeProducts: number
  productsByCategory: Record<string, number>
  averagePrice: number
  totalRevenue: number
}

export interface SalesStats {
  totalSales: number
  totalRevenue: number
  salesByMonth: { month: string; sales: number; revenue: number }[]
  topProducts: { product: string; sales: number; revenue: number }[]
}