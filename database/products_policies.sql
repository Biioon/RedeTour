-- RLS Policies para tabelas de produtos do RedeTour

-- Categorias
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;

-- Políticas de Categorias
CREATE POLICY "Usuários podem ver categorias ativas" ON categorias
    FOR SELECT
    USING (ativo = true);

CREATE POLICY "Usuários autenticados podem ver suas próprias categorias" ON categorias
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários autenticados podem criar categorias" ON categorias
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários autenticados podem atualizar suas próprias categorias" ON categorias
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários autenticados podem deletar suas próprias categorias" ON categorias
    FOR DELETE
    USING (auth.uid() = user_id);

-- Acomodações
ALTER TABLE acomodacoes ENABLE ROW LEVEL SECURITY;

-- Políticas de Acomodações
CREATE POLICY "Usuários podem ver acomodações ativas" ON acomodacoes
    FOR SELECT
    USING (ativo = true);

CREATE POLICY "Usuários autenticados podem ver suas próprias acomodações" ON acomodacoes
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários autenticados podem criar acomodações" ON acomodacoes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários autenticados podem atualizar suas próprias acomodações" ON acomodacoes
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários autenticados podem deletar suas próprias acomodações" ON acomodacoes
    FOR DELETE
    USING (auth.uid() = user_id);

-- Transportes
ALTER TABLE transportes ENABLE ROW LEVEL SECURITY;

-- Políticas de Transportes
CREATE POLICY "Usuários podem ver transportes ativos" ON transportes
    FOR SELECT
    USING (ativo = true);

CREATE POLICY "Usuários autenticados podem ver seus próprios transportes" ON transportes
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários autenticados podem criar transportes" ON transportes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários autenticados podem atualizar seus próprios transportes" ON transportes
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários autenticados podem deletar seus próprios transportes" ON transportes
    FOR DELETE
    USING (auth.uid() = user_id);

-- Passeios
ALTER TABLE passeios ENABLE ROW LEVEL SECURITY;

-- Políticas de Passeios
CREATE POLICY "Usuários podem ver passeios ativos" ON passeios
    FOR SELECT
    USING (ativo = true);

CREATE POLICY "Usuários autenticados podem ver seus próprios passeios" ON passeios
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários autenticados podem criar passeios" ON passeios
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários autenticados podem atualizar seus próprios passeios" ON passeios
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários autenticados podem deletar seus próprios passeios" ON passeios
    FOR DELETE
    USING (auth.uid() = user_id);

-- Pacotes Turísticos
ALTER TABLE pacotes_turisticos ENABLE ROW LEVEL SECURITY;

-- Políticas de Pacotes Turísticos
CREATE POLICY "Usuários podem ver pacotes turísticos ativos" ON pacotes_turisticos
    FOR SELECT
    USING (ativo = true);

CREATE POLICY "Usuários autenticados podem ver seus próprios pacotes turísticos" ON pacotes_turisticos
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários autenticados podem criar pacotes turísticos" ON pacotes_turisticos
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários autenticados podem atualizar seus próprios pacotes turísticos" ON pacotes_turisticos
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários autenticados podem deletar seus próprios pacotes turísticos" ON pacotes_turisticos
    FOR DELETE
    USING (auth.uid() = user_id);

-- Permissões para roles
-- Conceder permissões básicas para usuários autenticados
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE, DELETE ON categorias TO authenticated;
GRANT INSERT, UPDATE, DELETE ON acomodacoes TO authenticated;
GRANT INSERT, UPDATE, DELETE ON transportes TO authenticated;
GRANT INSERT, UPDATE, DELETE ON passeios TO authenticated;
GRANT INSERT, UPDATE, DELETE ON pacotes_turisticos TO authenticated;

-- Conceder permissões de leitura para usuários anônimos (apenas dados públicos)
GRANT SELECT ON categorias TO anon;
GRANT SELECT ON acomodacoes TO anon;
GRANT SELECT ON transportes TO anon;
GRANT SELECT ON passeios TO anon;
GRANT SELECT ON pacotes_turisticos TO anon;