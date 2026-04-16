-- ==============================================================================
-- 🚀 DADOS DE EXEMPLO - FICHÁRIO MULTI-CLIENTES
-- ==============================================================================
-- Execute este script após o schema_update para ter dados de teste
-- ==============================================================================

-- 1. INSERIR CLIENTES DE EXEMPLO
INSERT INTO clients (full_name, email, phone, birth_date, address) VALUES 
('Maria Silva Santos', 'maria.silva@email.com', '(11) 99999-1234', '1985-03-15', 'Rua das Flores, 123 - São Paulo, SP'),
('Ana Paula Oliveira', 'ana.paula@email.com', '(11) 98888-5678', '1990-07-22', 'Av. Paulista, 456 - São Paulo, SP'),
('Carla Mendes Costa', 'carla.mendes@email.com', '(11) 97777-9012', '1988-11-08', 'Rua Augusta, 789 - São Paulo, SP'),
('Fernanda Lima', 'fernanda.lima@email.com', '(11) 96666-3456', '1992-01-30', 'Rua Oscar Freire, 321 - São Paulo, SP'),
('Juliana Rodrigues', 'juliana.rodrigues@email.com', '(11) 95555-7890', '1987-09-12', 'Av. Faria Lima, 654 - São Paulo, SP')
ON CONFLICT (cpf) DO NOTHING;

-- 2. INSERIR PRONTUÁRIOS DE EXEMPLO
WITH client_ids AS (
  SELECT id, full_name FROM clients WHERE full_name IN (
    'Maria Silva Santos', 
    'Ana Paula Oliveira', 
    'Carla Mendes Costa'
  )
)
INSERT INTO prontuarios (client_id, allergies, skin_type, medical_history, current_treatments, observations)
SELECT 
  id,
  CASE full_name
    WHEN 'Maria Silva Santos' THEN 'Alergia a produtos com álcool'
    WHEN 'Ana Paula Oliveira' THEN 'Sensibilidade a fragrâncias'
    WHEN 'Carla Mendes Costa' THEN 'Nenhuma alergia conhecida'
  END,
  CASE full_name
    WHEN 'Maria Silva Santos' THEN 'Oleosa'
    WHEN 'Ana Paula Oliveira' THEN 'Sensível'
    WHEN 'Carla Mendes Costa' THEN 'Mista'
  END,
  CASE full_name
    WHEN 'Maria Silva Santos' THEN 'Histórico de acne na adolescência'
    WHEN 'Ana Paula Oliveira' THEN 'Pele sensível desde a infância'
    WHEN 'Carla Mendes Costa' THEN 'Sem histórico médico relevante'
  END,
  CASE full_name
    WHEN 'Maria Silva Santos' THEN 'Limpeza de pele mensal, uso de ácido salicílico'
    WHEN 'Ana Paula Oliveira' THEN 'Hidratação semanal, produtos hipoalergênicos'
    WHEN 'Carla Mendes Costa' THEN 'Peeling químico trimestral'
  END,
  CASE full_name
    WHEN 'Maria Silva Santos' THEN 'Cliente muito satisfeita com os resultados'
    WHEN 'Ana Paula Oliveira' THEN 'Requer cuidados especiais devido à sensibilidade'
    WHEN 'Carla Mendes Costa' THEN 'Excelente aderência aos tratamentos'
  END
FROM client_ids;

-- 3. INSERIR EVOLUÇÕES DE EXEMPLO
WITH client_data AS (
  SELECT id, full_name FROM clients WHERE full_name IN (
    'Maria Silva Santos', 
    'Ana Paula Oliveira'
  )
)
INSERT INTO evolucoes (client_id, notes, treatment_type, observations, created_at)
SELECT 
  id,
  CASE 
    WHEN full_name = 'Maria Silva Santos' THEN 'Realizada limpeza profunda com extração de cravos. Pele respondeu muito bem ao tratamento. Aplicado máscara calmante.'
    WHEN full_name = 'Ana Paula Oliveira' THEN 'Hidratação intensiva com produtos hipoalergênicos. Pele apresentou melhora significativa na textura.'
  END,
  CASE 
    WHEN full_name = 'Maria Silva Santos' THEN 'Limpeza de Pele'
    WHEN full_name = 'Ana Paula Oliveira' THEN 'Hidratação'
  END,
  CASE 
    WHEN full_name = 'Maria Silva Santos' THEN 'Recomendado uso de protetor solar diário e retorno em 30 dias'
    WHEN full_name = 'Ana Paula Oliveira' THEN 'Orientada sobre rotina de cuidados em casa'
  END,
  NOW() - INTERVAL '7 days'
FROM client_data

UNION ALL

SELECT 
  id,
  CASE 
    WHEN full_name = 'Maria Silva Santos' THEN 'Sessão de peeling químico suave. Pele apresentou descamação normal. Aplicado hidratante pós-peeling.'
    WHEN full_name = 'Ana Paula Oliveira' THEN 'Massagem facial relaxante com óleos essenciais. Cliente relatou sensação de bem-estar.'
  END,
  CASE 
    WHEN full_name = 'Maria Silva Santos' THEN 'Peeling'
    WHEN full_name = 'Ana Paula Oliveira' THEN 'Massagem Facial'
  END,
  CASE 
    WHEN full_name = 'Maria Silva Santos' THEN 'Evitar exposição solar por 48h. Usar apenas produtos recomendados.'
    WHEN full_name = 'Ana Paula Oliveira' THEN 'Continuar com a rotina de hidratação diária'
  END,
  NOW() - INTERVAL '3 days'
FROM client_data;

-- ==============================================================================
-- ✅ DADOS DE EXEMPLO INSERIDOS
-- Agora você tem clientes, prontuários e evoluções para testar o sistema
-- ==============================================================================