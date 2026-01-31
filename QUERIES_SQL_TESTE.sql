-- 🔍 QUERIES SQL - Teste Transação 439071 (Saskya Lorena)
-- Copie e cole no Shell do Render (psql $DATABASE_URL)

-- ========================================
-- 1️⃣ BUSCAR TRANSAÇÃO 439071
-- ========================================

SELECT 
  c.id,
  c.transaction_pk,
  c.carregador_nome,
  c.carregador_id,
  c.inicio,
  c.fim,
  c.energia_consumida,
  c.duracao_segundos,
  c.status,
  c.created_at,
  m.nome as morador_nome,
  m.tag_rfid,
  m.telefone
FROM carregamentos c
LEFT JOIN moradores m ON c.morador_id = m.id
WHERE c.transaction_pk = 439071;

-- ❓ PERGUNTAS:
-- 1. A transação existe? (1 row ou 0 rows?)
-- 2. Tem data de FIM? (NULL ou 2026-01-30...)
-- 3. Qual o status? (Charging, Completed, outro?)

-- ========================================
-- 2️⃣ BUSCAR NOTIFICAÇÕES ENVIADAS
-- ========================================

SELECT 
  id,
  created_at,
  tipo,
  destinatario,
  mensagem,
  status,
  erro
FROM logs_notificacoes
WHERE mensagem LIKE '%439071%'
   OR mensagem LIKE '%saskya%'
   OR (created_at BETWEEN '2026-01-30 20:00:00' AND '2026-01-31 02:00:00')
ORDER BY created_at DESC
LIMIT 20;

-- ❓ PERGUNTAS:
-- 1. Quantas notificações? (0, 1, 2+?)
-- 2. Tem notificação de INÍCIO?
-- 3. Tem notificação de FIM/FINALIZAÇÃO?

-- ========================================
-- 3️⃣ BUSCAR TODOS OS CARREGAMENTOS DA SASKYA
-- ========================================

SELECT 
  c.transaction_pk,
  c.carregador_nome,
  c.inicio,
  c.fim,
  c.energia_consumida,
  c.status,
  m.nome as morador_nome
FROM carregamentos c
LEFT JOIN moradores m ON c.morador_id = m.id
WHERE LOWER(m.nome) LIKE '%saskya%'
ORDER BY c.inicio DESC
LIMIT 10;

-- ❓ PERGUNTAS:
-- 1. Quantos carregamentos da Saskya existem?
-- 2. Todos têm data de FIM ou alguns têm NULL?
-- 3. Padrão: sempre sem FIM ou só alguns?

-- ========================================
-- 4️⃣ BUSCAR CARREGAMENTOS RECENTES SEM FIM
-- ========================================

SELECT 
  c.transaction_pk,
  c.carregador_nome,
  c.inicio,
  c.fim,
  c.status,
  c.created_at,
  m.nome as morador_nome
FROM carregamentos c
LEFT JOIN moradores m ON c.morador_id = m.id
WHERE c.fim IS NULL
  AND c.inicio >= '2026-01-01'
ORDER BY c.inicio DESC
LIMIT 20;

-- ❓ PERGUNTAS:
-- 1. Quantos carregamentos sem FIM?
-- 2. Todos são recentes ou tem antigos também?
-- 3. São de vários moradores ou só alguns?

-- ========================================
-- 5️⃣ ESTATÍSTICAS GERAIS
-- ========================================

SELECT 
  COUNT(*) as total_carregamentos,
  COUNT(fim) as com_fim,
  COUNT(*) - COUNT(fim) as sem_fim,
  COUNT(CASE WHEN status = 'Charging' THEN 1 END) as status_charging,
  COUNT(CASE WHEN status = 'Completed' THEN 1 END) as status_completed
FROM carregamentos
WHERE created_at >= '2026-01-01';

-- ❓ INTERPRETAÇÃO:
-- Se "sem_fim" > 0 e alto:
--   → Backend NÃO está recebendo finalizações!

-- ========================================
-- 6️⃣ VERIFICAR ESTRUTURA DAS TABELAS
-- ========================================

-- Ver colunas da tabela carregamentos
\d carregamentos

-- Ver colunas da tabela logs_notificacoes
\d logs_notificacoes

-- ========================================
-- 📋 COMO COPIAR OS RESULTADOS
-- ========================================

-- No psql, os resultados aparecem assim:
--  transaction_pk | inicio              | fim
-- ----------------+---------------------+---------------------
--  439071         | 2026-01-30 20:45:00 | 2026-01-30 22:35:00

-- Para copiar:
-- 1. Selecione o texto com o mouse
-- 2. Copie (Cmd+C ou Ctrl+C)
-- 3. Cole aqui no chat para eu analisar!

-- ========================================
-- 🎯 COMANDOS ÚTEIS DO PSQL
-- ========================================

-- Sair do psql
\q

-- Limpar tela
\! clear

-- Ver tempo de execução
\timing on

-- Expandir resultados (melhor visualização)
\x on

-- Voltar ao normal
\x off

-- ========================================
-- ✅ CHECKLIST
-- ========================================

-- [ ] Query 1 executada - Transação 439071 encontrada?
-- [ ] Query 2 executada - Quantas notificações?
-- [ ] Query 3 executada - Outros carregamentos da Saskya?
-- [ ] Query 4 executada - Padrão de carregamentos sem FIM?
-- [ ] Query 5 executada - Estatísticas gerais?

-- ========================================
-- 📊 RESULTADO ESPERADO
-- ========================================

-- CENÁRIO 1: Tudo OK
--   transaction_pk: 439071 ✅
--   fim: 2026-01-30 22:35:00 ✅
--   notificações: 2+ ✅

-- CENÁRIO 2: Backend não recebeu finalização
--   transaction_pk: 439071 ✅
--   fim: NULL ❌
--   notificações: 1 (só início) ❌

-- CENÁRIO 3: Backend não registrou
--   transaction_pk: (não existe) ❌
--   notificações: 0 ❌

