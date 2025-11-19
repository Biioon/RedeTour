-- Tabelas de Pagamentos e Finanças do RedeTour

-- Tabela de assinaturas/planos
CREATE TABLE IF NOT EXISTS planos_assinatura (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    nome TEXT NOT NULL,
    descricao TEXT,
    preco_mensal DECIMAL(10,2) NOT NULL,
    preco_anual DECIMAL(10,2) NOT NULL,
    recursos TEXT[] DEFAULT '{}',
    limite_produtos INTEGER DEFAULT 100,
    limite_imagens INTEGER DEFAULT 1000,
    ativo BOOLEAN DEFAULT true NOT NULL,
    stripe_price_id_mensal TEXT,
    stripe_price_id_anual TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Tabela de assinaturas dos usuários
CREATE TABLE IF NOT EXISTS assinaturas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plano_id UUID REFERENCES planos_assinatura(id) ON DELETE CASCADE NOT NULL,
    status TEXT CHECK (status IN ('ativa', 'cancelada', 'expirada', 'suspensa')) DEFAULT 'ativa',
    data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    data_fim TIMESTAMP WITH TIME ZONE,
    intervalo TEXT CHECK (intervalo IN ('mensal', 'anual')) NOT NULL,
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT,
    cancelar_no_fim_do_periodo BOOLEAN DEFAULT false,
    valor_pago DECIMAL(10,2) DEFAULT 0,
    comissao_afiliado DECIMAL(10,2) DEFAULT 0,
    afiliado_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Tabela de vendas de produtos
CREATE TABLE IF NOT EXISTS vendas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    cliente_nome TEXT NOT NULL,
    cliente_email TEXT NOT NULL,
    cliente_telefone TEXT,
    cliente_documento TEXT,
    tipo_produto TEXT CHECK (tipo_produto IN ('pacote_turistico', 'acomodacao', 'transporte', 'passeio')) NOT NULL,
    produto_id UUID NOT NULL,
    produto_nome TEXT NOT NULL,
    produto_preco DECIMAL(10,2) NOT NULL,
    quantidade INTEGER DEFAULT 1 NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    desconto DECIMAL(10,2) DEFAULT 0,
    taxas DECIMAL(10,2) DEFAULT 0,
    valor_final DECIMAL(10,2) NOT NULL,
    moeda TEXT DEFAULT 'BRL' NOT NULL,
    status TEXT CHECK (status IN ('pendente', 'confirmada', 'cancelada', 'reembolsada')) DEFAULT 'pendente',
    metodo_pagamento TEXT CHECK (metodo_pagamento IN ('cartao_credito', 'cartao_debito', 'pix', 'boleto')) DEFAULT 'cartao_credito',
    parcelas INTEGER DEFAULT 1,
    data_viagem DATE,
    numero_voucher TEXT,
    observacoes TEXT,
    afiliado_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    comissao_afiliado DECIMAL(10,2) DEFAULT 0,
    stripe_payment_intent_id TEXT,
    stripe_checkout_session_id TEXT
);

-- Tabela de itens de vendas (para vendas múltiplas)
CREATE TABLE IF NOT EXISTS venda_itens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    venda_id UUID REFERENCES vendas(id) ON DELETE CASCADE NOT NULL,
    tipo_produto TEXT CHECK (tipo_produto IN ('pacote_turistico', 'acomodacao', 'transporte', 'passeio')) NOT NULL,
    produto_id UUID NOT NULL,
    produto_nome TEXT NOT NULL,
    produto_preco DECIMAL(10,2) NOT NULL,
    quantidade INTEGER DEFAULT 1 NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    desconto DECIMAL(10,2) DEFAULT 0
);

-- Tabela de transações financeiras
CREATE TABLE IF NOT EXISTS transacoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    tipo_transacao TEXT CHECK (tipo_transacao IN ('venda', 'reembolso', 'comissao', 'assinatura', 'taxa')) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    moeda TEXT DEFAULT 'BRL' NOT NULL,
    status TEXT CHECK (status IN ('pendente', 'concluida', 'falhou', 'cancelada')) DEFAULT 'pendente',
    descricao TEXT NOT NULL,
    venda_id UUID REFERENCES vendas(id) ON DELETE SET NULL,
    assinatura_id UUID REFERENCES assinaturas(id) ON DELETE SET NULL,
    stripe_transaction_id TEXT,
    gateway TEXT DEFAULT 'stripe' NOT NULL,
    taxa_gateway DECIMAL(10,2) DEFAULT 0,
    valor_liquido DECIMAL(10,2) DEFAULT 0,
    afiliado_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    comissao_afiliado DECIMAL(10,2) DEFAULT 0
);

-- Tabela de comissões de afiliados
CREATE TABLE IF NOT EXISTS comissoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    afiliado_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    venda_id UUID REFERENCES vendas(id) ON DELETE CASCADE,
    assinatura_id UUID REFERENCES assinaturas(id) ON DELETE CASCADE,
    tipo_comissao TEXT CHECK (tipo_comissao IN ('venda', 'assinatura')) NOT NULL,
    valor_comissao DECIMAL(10,2) NOT NULL,
    percentual_comissao DECIMAL(5,2) NOT NULL,
    status TEXT CHECK (status IN ('pendente', 'paga', 'cancelada')) DEFAULT 'pendente',
    data_pagamento TIMESTAMP WITH TIME ZONE,
    stripe_transfer_id TEXT,
    descricao TEXT NOT NULL
);

-- Tabela de configurações de comissão
CREATE TABLE IF NOT EXISTS configuracoes_comissao (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    tipo_produto TEXT CHECK (tipo_produto IN ('pacote_turistico', 'acomodacao', 'transporte', 'passeio', 'assinatura')) NOT NULL,
    percentual_padrao DECIMAL(5,2) NOT NULL,
    percentual_afiliado_direto DECIMAL(5,2) NOT NULL,
    percentual_afiliado_indireto DECIMAL(5,2) DEFAULT 0,
    valor_minimo_comissao DECIMAL(10,2) DEFAULT 10,
    dias_para_pagamento INTEGER DEFAULT 30,
    ativo BOOLEAN DEFAULT true NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Tabela de clientes (para histórico e retenção)
CREATE TABLE IF NOT EXISTS clientes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    telefone TEXT,
    documento TEXT,
    data_nascimento DATE,
    endereco TEXT,
    cidade TEXT,
    estado TEXT,
    pais TEXT DEFAULT 'Brasil',
    cep TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    total_compras DECIMAL(10,2) DEFAULT 0,
    valor_total_gasto DECIMAL(10,2) DEFAULT 0,
    data_ultima_compra TIMESTAMP WITH TIME ZONE,
    status TEXT CHECK (status IN ('ativo', 'inativo', 'vip')) DEFAULT 'ativo'
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_vendas_user_id ON vendas(user_id);
CREATE INDEX IF NOT EXISTS idx_vendas_cliente_email ON vendas(cliente_email);
CREATE INDEX IF NOT EXISTS idx_vendas_status ON vendas(status);
CREATE INDEX IF NOT EXISTS idx_vendas_data_viagem ON vendas(data_viagem);
CREATE INDEX IF NOT EXISTS idx_vendas_stripe_payment_intent_id ON vendas(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_vendas_stripe_checkout_session_id ON vendas(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_vendas_afiliado_id ON vendas(afiliado_id);

CREATE INDEX IF NOT EXISTS idx_transacoes_user_id ON transacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_tipo_transacao ON transacoes(tipo_transacao);
CREATE INDEX IF NOT EXISTS idx_transacoes_status ON transacoes(status);
CREATE INDEX IF NOT EXISTS idx_transacoes_venda_id ON transacoes(venda_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_assinatura_id ON transacoes(assinatura_id);

CREATE INDEX IF NOT EXISTS idx_comissoes_afiliado_id ON comissoes(afiliado_id);
CREATE INDEX IF NOT EXISTS idx_comissoes_status ON comissoes(status);
CREATE INDEX IF NOT EXISTS idx_comissoes_venda_id ON comissoes(venda_id);
CREATE INDEX IF NOT EXISTS idx_comissoes_assinatura_id ON comissoes(assinatura_id);

CREATE INDEX IF NOT EXISTS idx_assinaturas_user_id ON assinaturas(user_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_status ON assinaturas(status);
CREATE INDEX IF NOT EXISTS idx_assinaturas_stripe_subscription_id ON assinaturas(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_afiliado_id ON assinaturas(afiliado_id);

CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);
CREATE INDEX IF NOT EXISTS idx_clientes_user_id ON clientes(user_id);
CREATE INDEX IF NOT EXISTS idx_clientes_status ON clientes(status);

-- Funções para atualizar updated_at
CREATE TRIGGER update_assinaturas_updated_at BEFORE UPDATE ON assinaturas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comissoes_updated_at BEFORE UPDATE ON comissoes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Dados iniciais de configuração de comissão
INSERT INTO configuracoes_comissao (tipo_produto, percentual_padrao, percentual_afiliado_direto, percentual_afiliado_indireto, valor_minimo_comissao, dias_para_pagamento, user_id) VALUES
('pacote_turistico', 10.00, 15.00, 5.00, 50.00, 30, (SELECT id FROM auth.users LIMIT 1)),
('acomodacao', 8.00, 12.00, 3.00, 25.00, 30, (SELECT id FROM auth.users LIMIT 1)),
('transporte', 5.00, 8.00, 2.00, 15.00, 30, (SELECT id FROM auth.users LIMIT 1)),
('passeio', 10.00, 15.00, 5.00, 20.00, 30, (SELECT id FROM auth.users LIMIT 1)),
('assinatura', 20.00, 30.00, 10.00, 10.00, 30, (SELECT id FROM auth.users LIMIT 1));

-- Plano inicial de assinatura
INSERT INTO planos_assinatura (nome, descricao, preco_mensal, preco_anual, recursos, limite_produtos, limite_imagens, stripe_price_id_mensal, stripe_price_id_anual, user_id) VALUES
('Starter', 'Plano ideal para iniciantes', 29.90, 299.00, ARRAY['Até 50 produtos', 'Até 500 imagens', 'Suporte básico', 'Sem comissão de afiliados'], 50, 500, 'price_starter_monthly', 'price_starter_yearly', (SELECT id FROM auth.users LIMIT 1)),
('Professional', 'Plano para profissionais', 79.90, 799.00, ARRAY['Até 200 produtos', 'Até 2000 imagens', 'Suporte prioritário', 'Comissão de afiliados'], 200, 2000, 'price_pro_monthly', 'price_pro_yearly', (SELECT id FROM auth.users LIMIT 1)),
('Enterprise', 'Plano completo para empresas', 199.90, 1999.00, ARRAY['Produtos ilimitados', 'Imagens ilimitadas', 'Suporte VIP', 'Comissão de afiliados', 'API avançada'], 999999, 999999, 'price_enterprise_monthly', 'price_enterprise_yearly', (SELECT id FROM auth.users LIMIT 1));