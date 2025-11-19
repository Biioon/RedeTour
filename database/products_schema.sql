-- Tabelas do RedeTour - Sistema de Produtos Turísticos

-- Categorias de produtos
CREATE TABLE IF NOT EXISTS categorias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    nome TEXT NOT NULL,
    descricao TEXT,
    icone TEXT,
    cor TEXT,
    ativo BOOLEAN DEFAULT true NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Acomodações
CREATE TABLE IF NOT EXISTS acomodacoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    nome TEXT NOT NULL,
    descricao TEXT NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    imagem_url TEXT,
    ativo BOOLEAN DEFAULT true NOT NULL,
    tipo TEXT CHECK (tipo IN ('hotel', 'pousada', 'resort', 'hostel', 'casa', 'apartamento')) NOT NULL,
    endereco TEXT NOT NULL,
    cidade TEXT NOT NULL,
    estado TEXT NOT NULL,
    pais TEXT NOT NULL,
    capacidade INTEGER NOT NULL,
    quartos INTEGER NOT NULL,
    banheiros INTEGER NOT NULL,
    area_m2 INTEGER,
    comodidades TEXT[] DEFAULT '{}',
    check_in TIME NOT NULL,
    check_out TIME NOT NULL,
    politica_cancelamento TEXT NOT NULL,
    categoria_id UUID REFERENCES categorias(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Transportes
CREATE TABLE IF NOT EXISTS transportes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    nome TEXT NOT NULL,
    descricao TEXT NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    imagem_url TEXT,
    ativo BOOLEAN DEFAULT true NOT NULL,
    tipo TEXT CHECK (tipo IN ('aviao', 'onibus', 'carro', 'trem', 'barco', 'van')) NOT NULL,
    origem TEXT NOT NULL,
    destino TEXT NOT NULL,
    duracao_estimada TEXT NOT NULL,
    capacidade INTEGER NOT NULL,
    companhia TEXT NOT NULL,
    numero_voo TEXT,
    horario_partida TIME NOT NULL,
    horario_chegada TIME NOT NULL,
    inclui_bagagem BOOLEAN DEFAULT false NOT NULL,
    bagagem_descricao TEXT,
    categoria_id UUID REFERENCES categorias(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Passeios
CREATE TABLE IF NOT EXISTS passeios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    nome TEXT NOT NULL,
    descricao TEXT NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    imagem_url TEXT,
    ativo BOOLEAN DEFAULT true NOT NULL,
    duracao TEXT NOT NULL,
    dificuldade TEXT CHECK (dificuldade IN ('facil', 'moderado', 'dificil', 'extremo')) NOT NULL,
    inclui_refeicao BOOLEAN DEFAULT false NOT NULL,
    refeicao_descricao TEXT,
    inclui_transporte BOOLEAN DEFAULT false NOT NULL,
    transporte_descricao TEXT,
    roteiro TEXT[] DEFAULT '{}',
    requisitos TEXT[],
    observacoes TEXT,
    local_encontro TEXT NOT NULL,
    horario_encontro TIME NOT NULL,
    categoria_id UUID REFERENCES categorias(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Pacotes Turísticos
CREATE TABLE IF NOT EXISTS pacotes_turisticos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    nome TEXT NOT NULL,
    descricao TEXT NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    preco_original DECIMAL(10,2),
    desconto_percentual DECIMAL(5,2),
    imagem_url TEXT,
    imagens_galeria TEXT[],
    duracao_dias INTEGER NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    max_participantes INTEGER NOT NULL,
    min_participantes INTEGER NOT NULL,
    ativo BOOLEAN DEFAULT true NOT NULL,
    destaque BOOLEAN DEFAULT false NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    acomodacao_id UUID REFERENCES acomodacoes(id) ON DELETE CASCADE NOT NULL,
    transporte_id UUID REFERENCES transportes(id) ON DELETE CASCADE NOT NULL,
    passeio_ids UUID[] REFERENCES passeios(id) ON DELETE CASCADE,
    inclusos TEXT[] DEFAULT '{}',
    exclusos TEXT[] DEFAULT '{}',
    roteiro JSONB DEFAULT '[]',
    condicoes_gerais TEXT NOT NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_acomodacoes_user_id ON acomodacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_acomodacoes_categoria_id ON acomodacoes(categoria_id);
CREATE INDEX IF NOT EXISTS idx_acomodacoes_ativo ON acomodacoes(ativo);
CREATE INDEX IF NOT EXISTS idx_acomodacoes_cidade ON acomodacoes(cidade);
CREATE INDEX IF NOT EXISTS idx_acomodacoes_preco ON acomodacoes(preco);

CREATE INDEX IF NOT EXISTS idx_transportes_user_id ON transportes(user_id);
CREATE INDEX IF NOT EXISTS idx_transportes_categoria_id ON transportes(categoria_id);
CREATE INDEX IF NOT EXISTS idx_transportes_ativo ON transportes(ativo);
CREATE INDEX IF NOT EXISTS idx_transportes_origem ON transportes(origem);
CREATE INDEX IF NOT EXISTS idx_transportes_destino ON transportes(destino);
CREATE INDEX IF NOT EXISTS idx_transportes_preco ON transportes(preco);

CREATE INDEX IF NOT EXISTS idx_passeios_user_id ON passeios(user_id);
CREATE INDEX IF NOT EXISTS idx_passeios_categoria_id ON passeios(categoria_id);
CREATE INDEX IF NOT EXISTS idx_passeios_ativo ON passeios(ativo);
CREATE INDEX IF NOT EXISTS idx_passeios_dificuldade ON passeios(dificuldade);
CREATE INDEX IF NOT EXISTS idx_passeios_preco ON passeios(preco);

CREATE INDEX IF NOT EXISTS idx_pacotes_turisticos_user_id ON pacotes_turisticos(user_id);
CREATE INDEX IF NOT EXISTS idx_pacotes_turisticos_ativo ON pacotes_turisticos(ativo);
CREATE INDEX IF NOT EXISTS idx_pacotes_turisticos_destaque ON pacotes_turisticos(destaque);
CREATE INDEX IF NOT EXISTS idx_pacotes_turisticos_data_inicio ON pacotes_turisticos(data_inicio);
CREATE INDEX IF NOT EXISTS idx_pacotes_turisticos_preco ON pacotes_turisticos(preco);

CREATE INDEX IF NOT EXISTS idx_categorias_user_id ON categorias(user_id);
CREATE INDEX IF NOT EXISTS idx_categorias_ativo ON categorias(ativo);

-- Funções para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_acomodacoes_updated_at BEFORE UPDATE ON acomodacoes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transportes_updated_at BEFORE UPDATE ON transportes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_passeios_updated_at BEFORE UPDATE ON passeios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pacotes_turisticos_updated_at BEFORE UPDATE ON pacotes_turisticos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON categorias
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();