-- Tabelas principais
CREATE TABLE IF NOT EXISTS usuarios (
  uid VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL,
  phone VARCHAR(50),
  whatsapp VARCHAR(50),
  address TEXT,
  avatar TEXT,
  barbershop_name VARCHAR(255),
  barbershop_description TEXT
);

-- Migrações seguras de colunas
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS barbershop_name VARCHAR(255);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS barbershop_description TEXT;
ALTER TABLE usuarios ALTER COLUMN avatar TYPE TEXT;

CREATE TABLE IF NOT EXISTS barbearias (
  id VARCHAR(255) PRIMARY KEY,
  owner_uid VARCHAR(255) REFERENCES usuarios(uid) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  phone VARCHAR(50),
  whatsapp VARCHAR(50),
  lat DECIMAL(10, 7),
  lng DECIMAL(10, 7),
  rating DECIMAL(3,2) DEFAULT 5.0,
  total_reviews INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Adiciona owner_uid se tabela já existia sem ele
ALTER TABLE barbearias ADD COLUMN IF NOT EXISTS owner_uid VARCHAR(255) REFERENCES usuarios(uid) ON DELETE CASCADE;
ALTER TABLE barbearias ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE barbearias ADD COLUMN IF NOT EXISTS lat DECIMAL(10, 7);
ALTER TABLE barbearias ADD COLUMN IF NOT EXISTS lng DECIMAL(10, 7);
ALTER TABLE barbearias ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(50);
ALTER TABLE barbearias ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

CREATE TABLE IF NOT EXISTS servicos (
  id VARCHAR(255) PRIMARY KEY,
  barbershop_id VARCHAR(255) REFERENCES barbearias(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  duration INT NOT NULL DEFAULT 30,
  description TEXT,
  icon VARCHAR(10) DEFAULT '✂️',
  active BOOLEAN DEFAULT true
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
  status VARCHAR(50) NOT NULL DEFAULT 'pendente',
  price DECIMAL(10,2) NOT NULL,
  client_notes TEXT,
  barber_notes TEXT,
  google_synced BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS historico_fidelidade (
  client_id VARCHAR(255) PRIMARY KEY REFERENCES usuarios(uid) ON DELETE CASCADE,
  cuts_count INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS custos (
  id VARCHAR(255) PRIMARY KEY,
  barbershop_id VARCHAR(255) REFERENCES barbearias(id) ON DELETE CASCADE,
  description VARCHAR(255) NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  category VARCHAR(100) NOT NULL
);

-- Trigger de gamificação (fidelidade)
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

DROP TRIGGER IF EXISTS trigger_conclusao_agendamento ON agendamentos;
CREATE TRIGGER trigger_conclusao_agendamento
AFTER UPDATE ON agendamentos
FOR EACH ROW
EXECUTE FUNCTION incrementa_cartao_fidelidade();

-- Views para BI
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
