-- Criação das Tabelas
CREATE TABLE IF NOT EXISTS usuarios (
  uid VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL, -- client, barber, admin
  phone VARCHAR(50),
  whatsapp VARCHAR(50),
  address TEXT,
  avatar TEXT, -- Changed to TEXT to allow compressed Base64 images
  barbershop_name VARCHAR(255),
  barbershop_description TEXT
);

-- Migrações seguras de colunas adicionais para tabelas existentes
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS barbershop_name VARCHAR(255);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS barbershop_description TEXT;
ALTER TABLE usuarios ALTER COLUMN avatar TYPE TEXT; -- Upgrade type to allow base64 strings

CREATE TABLE IF NOT EXISTS barbearias (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  rating DECIMAL(3,2) DEFAULT 5.0,
  total_reviews INT DEFAULT 0,
  distance DECIMAL(5,2),
  address TEXT NOT NULL,
  phone VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS agendamentos (
  id VARCHAR(255) PRIMARY KEY,
  client_id VARCHAR(255) REFERENCES usuarios(uid) ON DELETE CASCADE,
  client_name VARCHAR(255) NOT NULL,
  client_avatar VARCHAR(255),
  service VARCHAR(255) NOT NULL,
  service_id VARCHAR(255),
  barbershop_id VARCHAR(255) REFERENCES barbearias(id) ON DELETE CASCADE,
  barbershop_name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pendente', -- pendente, confirmado, concluído, cancelado
  price DECIMAL(10,2) NOT NULL,
  client_notes TEXT,
  barber_notes TEXT,
  google_synced BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS historico_fidelidade (
  client_id VARCHAR(255) PRIMARY KEY REFERENCES usuarios(uid) ON DELETE CASCADE,
  cuts_count INT DEFAULT 0
);

-- Triggers de Gamificação (Preenchimento automático do histórico de fidelidade)
-- Sempre que um agendamento for atualizado para 'concluído', adicionamos um corte ao cartão fidelidade.
CREATE OR REPLACE FUNCTION incrementa_cartao_fidelidade()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'concluído' AND OLD.status != 'concluído' THEN
    INSERT INTO historico_fidelidade (client_id, cuts_count)
    VALUES (NEW.client_id, 1)
    ON CONFLICT (client_id)
    DO UPDATE SET cuts_count = historico_fidelidade.cuts_count + 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_conclusao_agendamento
AFTER UPDATE ON agendamentos
FOR EACH ROW
EXECUTE FUNCTION incrementa_cartao_fidelidade();

-- Views para BI e Analíticas
CREATE OR REPLACE VIEW vw_faturamento_mensal AS
SELECT 
  DATE_TRUNC('month', date)::DATE AS mes,
  barbershop_name AS barbearia,
  SUM(price) AS faturamento_bruto,
  COUNT(*) AS total_agendamentos
FROM agendamentos
WHERE status IN ('confirmado', 'concluído')
GROUP BY mes, barbearia;

CREATE OR REPLACE VIEW vw_popularidade_servicos AS
SELECT 
  service AS servico,
  COUNT(*) AS total_agendamentos,
  SUM(price) AS receita_gerada
FROM agendamentos
GROUP BY service;

CREATE OR REPLACE VIEW vw_conversao_fidelidade AS
SELECT 
  u.name AS cliente,
  u.email,
  h.cuts_count AS cortes_acumulados,
  FLOOR(h.cuts_count / 10)::INT AS premios_resgatados
FROM historico_fidelidade h
JOIN usuarios u ON u.uid = h.client_id;

-- Inserção de Dados Iniciais (Seed Data)
INSERT INTO usuarios (uid, name, email, role, phone, whatsapp, address, avatar) VALUES
('client-001', 'Carlos Silva', 'carlos@email.com', 'client', '(11) 98765-4321', '5511987654321', 'Rua dos Clientes, 456 — Vila Madalena', NULL),
('barber-001', 'João Barbeiro', 'joao@barbearia.com', 'barber', '(11) 99999-8888', '5511999998888', 'Rua das Flores, 123 — Centro', NULL),
('admin-001', 'Admin Master', 'admin@barberpro.com', 'admin', '(11) 90000-0000', '5511900000000', 'Sede BarberPro, 999 — Alphaville', NULL)
ON CONFLICT (uid) DO NOTHING;

INSERT INTO barbearias (id, name, rating, total_reviews, distance, address, phone) VALUES
('barbershop-001', 'Barbearia Estilo & Arte', 4.8, 124, 1.2, 'Avenida Paulista, 1000 — Bela Vista', '(11) 3214-5555'),
('barbershop-002', 'Corte Real', 4.9, 85, 2.5, 'Rua Augusta, 500 — Consolação', '(11) 3105-4444'),
('barbershop-003', 'Barba Negra', 4.7, 98, 3.1, 'Alameda Lorena, 200 — Jardins', '(11) 3088-3333')
ON CONFLICT (id) DO NOTHING;

INSERT INTO agendamentos (id, client_id, client_name, client_avatar, service, service_id, barbershop_id, barbershop_name, date, time, status, price, client_notes, barber_notes, google_synced) VALUES
('apt-001', 'client-001', 'Carlos Silva', NULL, 'Corte Masculino', 'svc-001', 'barbershop-001', 'Barbearia Estilo & Arte', CURRENT_DATE, '14:00:00', 'confirmado', 50.00, 'Degradê na lateral', 'Corte com máquina 2 e tesoura em cima', TRUE),
('apt-002', 'client-001', 'Carlos Silva', NULL, 'Cabelo e Barba', 'svc-003', 'barbershop-001', 'Barbearia Estilo & Arte', CURRENT_DATE - INTERVAL '3 days', '10:00:00', 'concluído', 85.00, 'Aparar barba', 'Sobrancelha feita também', FALSE),
('apt-003', 'client-001', 'Carlos Silva', NULL, 'Barba Completa', 'svc-002', 'barbershop-002', 'Corte Real', CURRENT_DATE - INTERVAL '15 days', '16:30:00', 'concluído', 40.00, NULL, NULL, FALSE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO historico_fidelidade (client_id, cuts_count) VALUES
('client-001', 8)
ON CONFLICT (client_id) DO NOTHING;
