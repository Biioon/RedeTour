-- RedeTour Database Schema
-- PostgreSQL com extensões Supabase

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabela de perfis (estende auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    role TEXT DEFAULT 'client' CHECK (role IN ('client', 'partner', 'affiliate', 'admin')),
    phone TEXT,
    document TEXT,
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para profiles
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_created_at ON profiles(created_at DESC);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Tabela de acomodações
CREATE TABLE accommodations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    location JSONB,
    address TEXT,
    base_price NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'BRL',
    images TEXT[],
    amenities TEXT[],
    max_guests INTEGER DEFAULT 2,
    check_in_time TEXT DEFAULT '15:00',
    check_out_time TEXT DEFAULT '11:00',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para accommodations
CREATE INDEX idx_accommodations_owner_id ON accommodations(owner_id);
CREATE INDEX idx_accommodations_slug ON accommodations(slug);
CREATE INDEX idx_accommodations_status ON accommodations(status);
CREATE INDEX idx_accommodations_created_at ON accommodations(created_at DESC);

-- Trigger para updated_at
CREATE TRIGGER update_accommodations_updated_at 
    BEFORE UPDATE ON accommodations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Tabela de quartos
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    accommodation_id UUID REFERENCES accommodations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    capacity INTEGER NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    amenities TEXT[],
    images TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para rooms
CREATE INDEX idx_rooms_accommodation_id ON rooms(accommodation_id);
CREATE INDEX idx_rooms_is_active ON rooms(is_active);

-- Trigger para updated_at
CREATE TRIGGER update_rooms_updated_at 
    BEFORE UPDATE ON rooms 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Tabela de disponibilidade de quartos
CREATE TABLE room_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    available BOOLEAN DEFAULT TRUE,
    price_override NUMERIC(10,2),
    minimum_stay INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(room_id, date)
);

-- Índices para room_availability
CREATE INDEX idx_room_availability_room_id ON room_availability(room_id);
CREATE INDEX idx_room_availability_date ON room_availability(date);
CREATE INDEX idx_room_availability_available ON room_availability(available);

-- Trigger para updated_at
CREATE TRIGGER update_room_availability_updated_at 
    BEFORE UPDATE ON room_availability 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Tabela de experiências
CREATE TABLE experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    duration_minutes INTEGER,
    max_participants INTEGER DEFAULT 10,
    price NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'BRL',
    images TEXT[],
    includes TEXT[],
    requirements TEXT[],
    meeting_point JSONB,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para experiences
CREATE INDEX idx_experiences_provider_id ON experiences(provider_id);
CREATE INDEX idx_experiences_slug ON experiences(slug);
CREATE INDEX idx_experiences_category ON experiences(category);
CREATE INDEX idx_experiences_status ON experiences(status);
CREATE INDEX idx_experiences_created_at ON experiences(created_at DESC);

-- Trigger para updated_at
CREATE TRIGGER update_experiences_updated_at 
    BEFORE UPDATE ON experiences 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Tabela de veículos
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    brand TEXT,
    model TEXT,
    year INTEGER,
    capacity INTEGER,
    price NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'BRL',
    images TEXT[],
    features TEXT[],
    location JSONB,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para vehicles
CREATE INDEX idx_vehicles_owner_id ON vehicles(owner_id);
CREATE INDEX idx_vehicles_slug ON vehicles(slug);
CREATE INDEX idx_vehicles_category ON vehicles(category);
CREATE INDEX idx_vehicles_status ON vehicles(status);

-- Trigger para updated_at
CREATE TRIGGER update_vehicles_updated_at 
    BEFORE UPDATE ON vehicles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Tabela de reservas
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    product_type TEXT NOT NULL CHECK (product_type IN ('accommodation', 'experience', 'vehicle')),
    product_id UUID NOT NULL,
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE,
    guest_count INTEGER DEFAULT 1,
    total_price NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'BRL',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'refunded')),
    stripe_session_id TEXT,
    stripe_payment_intent_id TEXT,
    special_requests TEXT,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para bookings
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_product_type ON bookings(product_type);
CREATE INDEX idx_bookings_product_id ON bookings(product_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_start_date ON bookings(start_date);
CREATE INDEX idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX idx_bookings_stripe_session_id ON bookings(stripe_session_id);

-- Trigger para updated_at
CREATE TRIGGER update_bookings_updated_at 
    BEFORE UPDATE ON bookings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Tabela de afiliados
CREATE TABLE affiliates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    commission_rate NUMERIC(5,4) DEFAULT 0.05,
    total_earned NUMERIC(10,2) DEFAULT 0,
    total_withdrawn NUMERIC(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para affiliates
CREATE INDEX idx_affiliates_profile_id ON affiliates(profile_id);
CREATE INDEX idx_affiliates_code ON affiliates(code);
CREATE INDEX idx_affiliates_is_active ON affiliates(is_active);

-- Trigger para updated_at
CREATE TRIGGER update_affiliates_updated_at 
    BEFORE UPDATE ON affiliates 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Tabela de cliques de afiliados
CREATE TABLE affiliate_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
    path TEXT,
    ip INET,
    user_agent TEXT,
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    clicked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para affiliate_clicks
CREATE INDEX idx_affiliate_clicks_affiliate_id ON affiliate_clicks(affiliate_id);
CREATE INDEX idx_affiliate_clicks_ip ON affiliate_clicks(ip);
CREATE INDEX idx_affiliate_clicks_clicked_at ON affiliate_clicks(clicked_at DESC);

-- Tabela de vendas de afiliados
CREATE TABLE affiliate_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    commission_amount NUMERIC(10,2) NOT NULL,
    commission_rate NUMERIC(5,4) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para affiliate_sales
CREATE INDEX idx_affiliate_sales_affiliate_id ON affiliate_sales(affiliate_id);
CREATE INDEX idx_affiliate_sales_booking_id ON affiliate_sales(booking_id);
CREATE INDEX idx_affiliate_sales_status ON affiliate_sales(status);
CREATE INDEX idx_affiliate_sales_created_at ON affiliate_sales(created_at DESC);

-- Trigger para updated_at
CREATE TRIGGER update_affiliate_sales_updated_at 
    BEFORE UPDATE ON affiliate_sales 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Tabela de configurações de comissão
CREATE TABLE commissions (
    id SERIAL PRIMARY KEY,
    product_type TEXT NOT NULL CHECK (product_type IN ('accommodation', 'experience', 'vehicle')),
    category TEXT,
    default_percent NUMERIC(5,4) NOT NULL DEFAULT 0.05,
    min_amount NUMERIC(10,2) DEFAULT 0,
    max_amount NUMERIC(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para commissions
CREATE INDEX idx_commissions_product_type ON commissions(product_type);
CREATE INDEX idx_commissions_category ON commissions(category);
CREATE INDEX idx_commissions_is_active ON commissions(is_active);

-- Trigger para updated_at
CREATE TRIGGER update_commissions_updated_at 
    BEFORE UPDATE ON commissions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Tabela de eventos de segurança
CREATE TABLE security_events (
    id BIGSERIAL PRIMARY KEY,
    event_type TEXT NOT NULL,
    user_id UUID,
    ip INET,
    user_agent TEXT,
    country TEXT,
    city TEXT,
    meta JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para security_events
CREATE INDEX idx_security_events_event_type ON security_events(event_type);
CREATE INDEX idx_security_events_user_id ON security_events(user_id);
CREATE INDEX idx_security_events_ip ON security_events(ip);
CREATE INDEX idx_security_events_created_at ON security_events(created_at DESC);

-- Tabela de saques de afiliados
CREATE TABLE affiliate_withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    method TEXT NOT NULL CHECK (method IN ('pix', 'bank_transfer', 'stripe_connect')),
    pix_key TEXT,
    bank_account JSONB,
    stripe_account_id TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    processed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para affiliate_withdrawals
CREATE INDEX idx_affiliate_withdrawals_affiliate_id ON affiliate_withdrawals(affiliate_id);
CREATE INDEX idx_affiliate_withdrawals_status ON affiliate_withdrawals(status);
CREATE INDEX idx_affiliate_withdrawals_created_at ON affiliate_withdrawals(created_at DESC);

-- Trigger para updated_at
CREATE TRIGGER update_affiliate_withdrawals_updated_at 
    BEFORE UPDATE ON affiliate_withdrawals 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Tabela de avaliações
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    product_type TEXT NOT NULL CHECK (product_type IN ('accommodation', 'experience', 'vehicle')),
    product_id UUID NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    images TEXT[],
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para reviews
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX idx_reviews_product ON reviews(product_type, product_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- Trigger para updated_at
CREATE TRIGGER update_reviews_updated_at 
    BEFORE UPDATE ON reviews 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Tabela de favoritos
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    product_type TEXT NOT NULL CHECK (product_type IN ('accommodation', 'experience', 'vehicle')),
    product_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_type, product_id)
);

-- Índices para favorites
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_product ON favorites(product_type, product_id);
CREATE INDEX idx_favorites_created_at ON favorites(created_at DESC);

-- Inserir dados iniciais de comissão
INSERT INTO commissions (product_type, category, default_percent, min_amount, max_amount) VALUES
('accommodation', NULL, 0.05, 0, NULL),
('experience', NULL, 0.08, 0, NULL),
('vehicle', NULL, 0.03, 0, NULL);

-- Comentários para documentação
COMMENT ON TABLE profiles IS 'Perfis de usuários que estendem auth.users';
COMMENT ON TABLE accommodations IS 'Acomodações cadastradas pelos parceiros';
COMMENT ON TABLE rooms IS 'Quartos dentro das acomodações';
COMMENT ON TABLE room_availability IS 'Disponibilidade diária dos quartos';
COMMENT ON TABLE experiences IS 'Experiências e passeios turísticos';
COMMENT ON TABLE vehicles IS 'Veículos para aluguel';
COMMENT ON TABLE bookings IS 'Reservas de produtos';
COMMENT ON TABLE affiliates IS 'Cadastro de afiliados';
COMMENT ON TABLE affiliate_clicks IS 'Registro de cliques de afiliados';
COMMENT ON TABLE affiliate_sales IS 'Vendas geradas por afiliados';
COMMENT ON TABLE commissions IS 'Configurações de comissão por tipo de produto';
COMMENT ON TABLE security_events IS 'Eventos de segurança para auditoria';
COMMENT ON TABLE affiliate_withdrawals IS 'Solicitações de saque de afiliados';
COMMENT ON TABLE reviews IS 'Avaliações de produtos';
COMMENT ON TABLE favorites IS 'Produtos favoritados pelos usuários';