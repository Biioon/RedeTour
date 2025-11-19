-- Tabela de métodos de pagamento salvos
CREATE TABLE saved_payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('card', 'pix', 'boleto')),
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para saved_payment_methods
CREATE INDEX idx_saved_payment_methods_user_id ON saved_payment_methods(user_id);
CREATE INDEX idx_saved_payment_methods_active ON saved_payment_methods(is_active);
CREATE INDEX idx_saved_payment_methods_default ON saved_payment_methods(is_default);

-- Tabela de cartões de crédito salvos (dados mascarados)
CREATE TABLE saved_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_method_id UUID REFERENCES saved_payment_methods(id) ON DELETE CASCADE,
    brand TEXT NOT NULL, -- visa, mastercard, etc
    last4 TEXT NOT NULL,
    exp_month INTEGER NOT NULL,
    exp_year INTEGER NOT NULL,
    holder_name TEXT,
    fingerprint TEXT, -- identificador único do cartão (do Stripe)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para saved_cards
CREATE INDEX idx_saved_cards_payment_method_id ON saved_cards(payment_method_id);
CREATE INDEX idx_saved_cards_brand ON saved_cards(brand);
CREATE INDEX idx_saved_cards_fingerprint ON saved_cards(fingerprint);

-- Tabela de chaves PIX salvas
CREATE TABLE saved_pix_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_method_id UUID REFERENCES saved_payment_methods(id) ON DELETE CASCADE,
    key_type TEXT NOT NULL CHECK (key_type IN ('cpf', 'cnpj', 'email', 'phone', 'random')),
    key_value TEXT NOT NULL,
    holder_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para saved_pix_keys
CREATE INDEX idx_saved_pix_keys_payment_method_id ON saved_pix_keys(payment_method_id);
CREATE INDEX idx_saved_pix_keys_key_value ON saved_pix_keys(key_value);

-- Triggers para updated_at
CREATE TRIGGER update_saved_payment_methods_updated_at 
    BEFORE UPDATE ON saved_payment_methods 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_cards_updated_at 
    BEFORE UPDATE ON saved_cards 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_pix_keys_updated_at 
    BEFORE UPDATE ON saved_pix_keys 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE saved_payment_methods IS 'Métodos de pagamento salvos dos usuários';
COMMENT ON TABLE saved_cards IS 'Cartões de crédito salvos (dados mascarados)';
COMMENT ON TABLE saved_pix_keys IS 'Chaves PIX salvas dos usuários';