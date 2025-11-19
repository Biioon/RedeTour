-- RedeTour RLS Policies
-- Políticas de segurança para Row Level Security no Supabase

-- Desabilitar RLS temporariamente para configuração (será reabilitado após)
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE accommodations DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE affiliate_sales DISABLE ROW LEVEL SECURITY;

-- Habilitar RLS nas tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes (se houver)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Allow public read" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Allow own profile" ON ' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- =====================================================
-- POLÍTICAS PARA PROFILES
-- =====================================================

-- Permitir que usuários vejam seus próprios perfis
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Permitir que usuários atualizem seus próprios perfis
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Permitir que admins vejam todos os perfis
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Permitir que admins atualizem qualquer perfil
CREATE POLICY "Admins can update any profile" ON profiles
    FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Permitir inserção de novos perfis (trigger após signup)
CREATE POLICY "Service role can insert profiles" ON profiles
    FOR INSERT
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- POLÍTICAS PARA ACCOMMODATIONS
-- =====================================================

-- Permitir que todos vejam acomodações aprovadas
CREATE POLICY "Public can view approved accommodations" ON accommodations
    FOR SELECT
    USING (status = 'approved');

-- Permitir que owners vejam suas próprias acomodações (qualquer status)
CREATE POLICY "Owners can view own accommodations" ON accommodations
    FOR SELECT
    USING (owner_id = auth.uid());

-- Permitir que owners criem acomodações
CREATE POLICY "Partners can create accommodations" ON accommodations
    FOR INSERT
    WITH CHECK (
        owner_id = auth.uid() AND 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('partner', 'admin')
        )
    );

-- Permitir que owners atualizem suas acomodações
CREATE POLICY "Owners can update own accommodations" ON accommodations
    FOR UPDATE
    USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

-- Permitir que owners deletem suas acomodações
CREATE POLICY "Owners can delete own accommodations" ON accommodations
    FOR DELETE
    USING (owner_id = auth.uid());

-- Permitir que admins vejam todas as acomodações
CREATE POLICY "Admins can view all accommodations" ON accommodations
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Permitir que admins atualizem qualquer acomodação
CREATE POLICY "Admins can update any accommodation" ON accommodations
    FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- =====================================================
-- POLÍTICAS PARA ROOMS
-- =====================================================

-- Permitir que todos vejam quartos de acomodações aprovadas
CREATE POLICY "Public can view rooms from approved accommodations" ON rooms
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM accommodations 
        WHERE id = rooms.accommodation_id AND status = 'approved'
    ));

-- Permitir que owners vejam quartos de suas acomodações
CREATE POLICY "Owners can view rooms from own accommodations" ON rooms
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM accommodations 
        WHERE id = rooms.accommodation_id AND owner_id = auth.uid()
    ));

-- Permitir que owners gerenciem quartos de suas acomodações
CREATE POLICY "Owners can manage rooms from own accommodations" ON rooms
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM accommodations 
        WHERE id = rooms.accommodation_id AND owner_id = auth.uid()
    ));

-- =====================================================
-- POLÍTICAS PARA ROOM AVAILABILITY
-- =====================================================

-- Permitir que todos vejam disponibilidade de quartos
CREATE POLICY "Public can view room availability" ON room_availability
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM rooms r
        JOIN accommodations a ON a.id = r.accommodation_id
        WHERE r.id = room_availability.room_id AND a.status = 'approved'
    ));

-- Permitir que owners gerenciem disponibilidade de seus quartos
CREATE POLICY "Owners can manage room availability" ON room_availability
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM rooms r
        JOIN accommodations a ON a.id = r.accommodation_id
        WHERE r.id = room_availability.room_id AND a.owner_id = auth.uid()
    ));

-- =====================================================
-- POLÍTICAS PARA EXPERIENCES
-- =====================================================

-- Similar às políticas de accommodations
CREATE POLICY "Public can view approved experiences" ON experiences
    FOR SELECT
    USING (status = 'approved');

CREATE POLICY "Providers can view own experiences" ON experiences
    FOR SELECT
    USING (provider_id = auth.uid());

CREATE POLICY "Partners can create experiences" ON experiences
    FOR INSERT
    WITH CHECK (
        provider_id = auth.uid() AND 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('partner', 'admin')
        )
    );

CREATE POLICY "Providers can update own experiences" ON experiences
    FOR UPDATE
    USING (provider_id = auth.uid())
    WITH CHECK (provider_id = auth.uid());

CREATE POLICY "Admins can view all experiences" ON experiences
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- =====================================================
-- POLÍTICAS PARA VEHICLES
-- =====================================================

-- Similar às políticas de accommodations
CREATE POLICY "Public can view approved vehicles" ON vehicles
    FOR SELECT
    USING (status = 'approved');

CREATE POLICY "Owners can view own vehicles" ON vehicles
    FOR SELECT
    USING (owner_id = auth.uid());

CREATE POLICY "Partners can create vehicles" ON vehicles
    FOR INSERT
    WITH CHECK (
        owner_id = auth.uid() AND 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('partner', 'admin')
        )
    );

CREATE POLICY "Owners can update own vehicles" ON vehicles
    FOR UPDATE
    USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

-- =====================================================
-- POLÍTICAS PARA BOOKINGS
-- =====================================================

-- Usuários podem ver suas próprias reservas
CREATE POLICY "Users can view own bookings" ON bookings
    FOR SELECT
    USING (user_id = auth.uid());

-- Usuários podem criar reservas (com validação adicional na aplicação)
CREATE POLICY "Users can create bookings" ON bookings
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Usuários podem cancelar suas próprias reservas
CREATE POLICY "Users can cancel own bookings" ON bookings
    FOR UPDATE
    USING (user_id = auth.uid() AND status IN ('pending', 'confirmed'))
    WITH CHECK (user_id = auth.uid());

-- Parceiros podem ver reservas de seus produtos
CREATE POLICY "Partners can view bookings of their products" ON bookings
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM accommodations 
            WHERE id = bookings.product_id AND owner_id = auth.uid()
        ) OR EXISTS (
            SELECT 1 FROM experiences 
            WHERE id = bookings.product_id AND provider_id = auth.uid()
        ) OR EXISTS (
            SELECT 1 FROM vehicles 
            WHERE id = bookings.product_id AND owner_id = auth.uid()
        )
    );

-- Admins podem ver todas as reservas
CREATE POLICY "Admins can view all bookings" ON bookings
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- =====================================================
-- POLÍTICAS PARA AFFILIATES
-- =====================================================

-- Usuários podem ver seu próprio registro de afiliado
CREATE POLICY "Users can view own affiliate record" ON affiliates
    FOR SELECT
    USING (profile_id = auth.uid());

-- Usuários podem criar registro de afiliado
CREATE POLICY "Users can create affiliate record" ON affiliates
    FOR INSERT
    WITH CHECK (profile_id = auth.uid());

-- Usuários podem atualizar próprio registro de afiliado
CREATE POLICY "Users can update own affiliate record" ON affiliates
    FOR UPDATE
    USING (profile_id = auth.uid())
    WITH CHECK (profile_id = auth.uid());

-- Admins podem ver todos os afiliados
CREATE POLICY "Admins can view all affiliates" ON affiliates
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- =====================================================
-- POLÍTICAS PARA AFFILIATE_CLICKS
-- =====================================================

-- Admins podem ver todos os cliques
CREATE POLICY "Admins can view all affiliate clicks" ON affiliate_clicks
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Afiliados podem ver cliques próprios
CREATE POLICY "Affiliates can view own clicks" ON affiliate_clicks
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM affiliates 
        WHERE id = affiliate_clicks.affiliate_id AND profile_id = auth.uid()
    ));

-- =====================================================
-- POLÍTICAS PARA AFFILIATE_SALES
-- =====================================================

-- Admins podem ver todas as vendas de afiliados
CREATE POLICY "Admins can view all affiliate sales" ON affiliate_sales
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Afiliados podem ver próprias vendas
CREATE POLICY "Affiliates can view own sales" ON affiliate_sales
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM affiliates 
        WHERE id = affiliate_sales.affiliate_id AND profile_id = auth.uid()
    ));

-- =====================================================
-- POLÍTICAS PARA COMMISSIONS
-- =====================================================

-- Todos podem ver comissões ativas (para cálculo)
CREATE POLICY "Public can view active commissions" ON commissions
    FOR SELECT
    USING (is_active = TRUE);

-- Admins podem gerenciar todas as comissões
CREATE POLICY "Admins can manage commissions" ON commissions
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- =====================================================
-- POLÍTICAS PARA AFFILIATE_WITHDRAWALS
-- =====================================================

-- Afiliados podem ver próprios saques
CREATE POLICY "Affiliates can view own withdrawals" ON affiliate_withdrawals
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM affiliates 
        WHERE id = affiliate_withdrawals.affiliate_id AND profile_id = auth.uid()
    ));

-- Afiliados podem criar saques
CREATE POLICY "Affiliates can create withdrawals" ON affiliate_withdrawals
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM affiliates 
            WHERE id = affiliate_withdrawals.affiliate_id AND profile_id = auth.uid()
        )
    );

-- Admins podem gerenciar todos os saques
CREATE POLICY "Admins can manage withdrawals" ON affiliate_withdrawals
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- =====================================================
-- POLÍTICAS PARA REVIEWS
-- =====================================================

-- Todos podem ver avaliações públicas
CREATE POLICY "Public can view reviews" ON reviews
    FOR SELECT
    USING (is_verified = TRUE);

-- Usuários podem ver próprias avaliações
CREATE POLICY "Users can view own reviews" ON reviews
    FOR SELECT
    USING (user_id = auth.uid());

-- Usuários podem criar avaliações
CREATE POLICY "Users can create reviews" ON reviews
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Usuários podem atualizar próprias avaliações
CREATE POLICY "Users can update own reviews" ON reviews
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- =====================================================
-- POLÍTICAS PARA FAVORITES
-- =====================================================

-- Usuários podem ver próprios favoritos
CREATE POLICY "Users can view own favorites" ON favorites
    FOR SELECT
    USING (user_id = auth.uid());

-- Usuários podem criar favoritos
CREATE POLICY "Users can create favorites" ON favorites
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Usuários podem deletar próprios favoritos
CREATE POLICY "Users can delete own favorites" ON favorites
    FOR DELETE
    USING (user_id = auth.uid());

-- =====================================================
-- POLÍTICAS PARA SECURITY_EVENTS
-- =====================================================

-- Admins podem ver eventos de segurança
CREATE POLICY "Admins can view security events" ON security_events
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Serviço pode criar eventos de segurança
CREATE POLICY "Service can create security events" ON security_events
    FOR INSERT
    WITH CHECK (auth.jwt() ->> 'role' IN ('service_role', 'authenticated'));

-- =====================================================
-- PERMISSÕES BÁSICAS PARA ANON E AUTHENTICATED
-- =====================================================

-- Conceder permissões básicas para anon role
GRANT SELECT ON accommodations TO anon;
GRANT SELECT ON rooms TO anon;
GRANT SELECT ON room_availability TO anon;
GRANT SELECT ON experiences TO anon;
GRANT SELECT ON vehicles TO anon;
GRANT SELECT ON commissions TO anon;
GRANT SELECT ON reviews TO anon;

-- Conceder permissões básicas para authenticated role
GRANT SELECT ON accommodations TO authenticated;
GRANT SELECT ON rooms TO authenticated;
GRANT SELECT ON room_availability TO authenticated;
GRANT SELECT ON experiences TO authenticated;
GRANT SELECT ON vehicles TO authenticated;
GRANT SELECT ON commissions TO authenticated;
GRANT SELECT ON reviews TO authenticated;

-- Conceder permissões de modificação para authenticated (serão restringidas por RLS)
GRANT INSERT, UPDATE, DELETE ON profiles TO authenticated;
GRANT INSERT, UPDATE, DELETE ON bookings TO authenticated;
GRANT INSERT, UPDATE, DELETE ON affiliates TO authenticated;
GRANT INSERT, UPDATE, DELETE ON affiliate_withdrawals TO authenticated;
GRANT INSERT, UPDATE, DELETE ON reviews TO authenticated;
GRANT INSERT, UPDATE, DELETE ON favorites TO authenticated;

-- Conceder todas as permissões para service_role (uso interno)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- =====================================================
-- FUNÇÕES AUXILIARES
-- =====================================================

-- Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = user_uuid AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se usuário é owner de acomodação
CREATE OR REPLACE FUNCTION is_accommodation_owner(acc_id UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM accommodations 
        WHERE id = acc_id AND owner_id = user_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se usuário é afiliado
CREATE OR REPLACE FUNCTION is_affiliate(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM affiliates 
        WHERE profile_id = user_uuid AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMENTÁRIOS DE DOCUMENTAÇÃO
-- =====================================================

COMMENT ON POLICY "Users can view own profile" ON profiles IS 'Usuários podem ver seus próprios perfis';
COMMENT ON POLICY "Admins can view all profiles" ON profiles IS 'Administradores podem ver todos os perfis';
COMMENT ON POLICY "Public can view approved accommodations" ON accommodations IS 'Público pode ver acomodações aprovadas';
COMMENT ON POLICY "Owners can update own accommodations" ON accommodations IS 'Proprietários podem atualizar suas acomodações';
COMMENT ON POLICY "Users can view own bookings" ON bookings IS 'Usuários podem ver suas próprias reservas';
COMMENT ON POLICY "Partners can view bookings of their products" ON bookings IS 'Parceiros podem ver reservas de seus produtos';
COMMENT ON POLICY "Admins can view all bookings" ON bookings IS 'Administradores podem ver todas as reservas';
COMMENT ON POLICY "Affiliates can view own sales" ON affiliate_sales IS 'Afiliados podem ver suas próprias vendas';
COMMENT ON POLICY "Admins can view all affiliate sales" ON affiliate_sales IS 'Administradores podem ver todas as vendas de afiliados';

-- =====================================================
-- INSTRUÇÕES DE TESTE
-- =====================================================

/*
Para testar as políticas RLS:

1. Testar como usuário anônimo:
   SET ROLE anon;
   SELECT * FROM accommodations WHERE status = 'approved'; -- Deve funcionar
   SELECT * FROM accommodations; -- Deve mostrar apenas aprovadas

2. Testar como usuário autenticado:
   SET ROLE authenticated;
   -- Simular auth.uid() com UUID do usuário
   SET local auth.uid = 'seu-uuid-aqui';
   SELECT * FROM profiles WHERE id = 'seu-uuid-aqui'; -- Deve funcionar
   SELECT * FROM bookings WHERE user_id = 'seu-uuid-aqui'; -- Deve funcionar

3. Testar como admin:
   -- Verificar se usuário tem role admin
   SELECT role FROM profiles WHERE id = 'seu-uuid-aqui';
   -- Se for admin, deve conseguir ver todas as tabelas

4. Testar permissões de parceiro:
   -- Criar acomodação como parceiro
   INSERT INTO accommodations (owner_id, title, slug, base_price, status)
   VALUES ('seu-uuid-aqui', 'Teste', 'teste-slug', 100.00, 'pending');
   -- Deve funcionar se o usuário for partner

5. Testar permissões de afiliado:
   -- Criar registro de afiliado
   INSERT INTO affiliates (profile_id, code)
   VALUES ('seu-uuid-aqui', 'TESTE123');
   -- Deve funcionar

Dicas de debugging:
- Use EXPLAIN (ANALYZE, BUFFERS) para verificar se RLS está sendo aplicada
- Verifique logs do Supabase para ver erros de política
- Use SELECT current_user, current_role para verificar roles atuais
- Teste com diferentes UUIDs para simular diferentes usuários
*/