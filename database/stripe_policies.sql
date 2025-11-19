-- RLS Policies para tabelas de pagamentos e finanças

-- Configurações de comissão
ALTER TABLE configuracoes_comissao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver configurações de comissão ativas" ON configuracoes_comissao
    FOR SELECT
    USING (ativo = true);

CREATE POLICY "Usuários autenticados podem ver suas próprias configurações" ON configuracoes_comissao
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários autenticados podem criar configurações de comissão" ON configuracoes_comissao
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários autenticados podem atualizar suas próprias configurações" ON configuracoes_comissao
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Planos de assinatura
ALTER TABLE planos_assinatura ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ver planos de assinatura ativos" ON planos_assinatura
    FOR SELECT
    USING (ativo = true);

CREATE POLICY "Usuários autenticados podem ver todos os planos" ON planos_assinatura
    FOR SELECT
    TO authenticated;

CREATE POLICY "Usuários autenticados podem criar planos" ON planos_assinatura
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários autenticados podem atualizar seus próprios planos" ON planos_assinatura
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Assinaturas
ALTER TABLE assinaturas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas próprias assinaturas" ON assinaturas
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários autenticados podem criar assinaturas" ON assinaturas
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários autenticados podem atualizar suas próprias assinaturas" ON assinaturas
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Vendas
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas próprias vendas" ON vendas
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários autenticados podem criar vendas" ON vendas
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários autenticados podem atualizar suas próprias vendas" ON vendas
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Itens de vendas
ALTER TABLE venda_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver itens de suas próprias vendas" ON venda_itens
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM vendas 
        WHERE vendas.id = venda_itens.venda_id 
        AND vendas.user_id = auth.uid()
    ));

CREATE POLICY "Usuários autenticados podem criar itens de venda" ON venda_itens
    FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM vendas 
        WHERE vendas.id = venda_itens.venda_id 
        AND vendas.user_id = auth.uid()
    ));

-- Transações
ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas próprias transações" ON transacoes
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários autenticados podem criar transações" ON transacoes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários autenticados podem atualizar suas próprias transações" ON transacoes
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Comissões
ALTER TABLE comissoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Afiliados podem ver suas próprias comissões" ON comissoes
    FOR SELECT
    USING (auth.uid() = afiliado_id);

CREATE POLICY "Usuários podem ver comissões de suas vendas" ON comissoes
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM vendas 
        WHERE vendas.id = comissoes.venda_id 
        AND vendas.user_id = auth.uid()
    ) OR EXISTS (
        SELECT 1 FROM assinaturas 
        WHERE assinaturas.id = comissoes.assinatura_id 
        AND assinaturas.user_id = auth.uid()
    ));

CREATE POLICY "Usuários autenticados podem criar comissões" ON comissoes
    FOR INSERT
    WITH CHECK (auth.uid() = (SELECT user_id FROM vendas WHERE vendas.id = venda_id) OR 
                            auth.uid() = (SELECT user_id FROM assinaturas WHERE assinaturas.id = assinatura_id));

CREATE POLICY "Usuários autenticados podem atualizar comissões" ON comissoes
    FOR UPDATE
    USING (auth.uid() = (SELECT user_id FROM vendas WHERE vendas.id = venda_id) OR 
                        auth.uid() = (SELECT user_id FROM assinaturas WHERE assinaturas.id = assinatura_id));

-- Clientes
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seus próprios clientes" ON clientes
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários autenticados podem criar clientes" ON clientes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários autenticados podem atualizar seus próprios clientes" ON clientes
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Permissões para roles
GRANT SELECT ON configuracoes_comissao TO authenticated;
GRANT INSERT, UPDATE ON configuracoes_comissao TO authenticated;

GRANT SELECT ON planos_assinatura TO anon;
GRANT SELECT, INSERT, UPDATE ON planos_assinatura TO authenticated;

GRANT SELECT, INSERT, UPDATE ON assinaturas TO authenticated;

GRANT SELECT, INSERT, UPDATE ON vendas TO authenticated;

GRANT SELECT, INSERT ON venda_itens TO authenticated;

GRANT SELECT, INSERT, UPDATE ON transacoes TO authenticated;

GRANT SELECT, INSERT, UPDATE ON comissoes TO authenticated;

GRANT SELECT, INSERT, UPDATE ON clientes TO authenticated;