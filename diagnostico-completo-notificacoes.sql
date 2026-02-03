-- ============================================================
-- 🔍 DIAGNÓSTICO COMPLETO - SISTEMA DE NOTIFICAÇÕES
-- Data: 02/02/2026
-- ============================================================

\echo '============================================================'
\echo '📋 VERIFICAÇÃO 1: TEMPLATES DE NOTIFICAÇÃO'
\echo '============================================================'
\echo ''

SELECT 
  tipo,
  ativo,
  tempo_minutos,
  power_threshold_w,
  CASE 
    WHEN ativo THEN '✅'
    ELSE '❌'
  END AS status
FROM templates_notificacao
ORDER BY 
  CASE tipo
    WHEN 'inicio_recarga' THEN 1
    WHEN 'inicio_ociosidade' THEN 2
    WHEN 'bateria_cheia' THEN 3
    WHEN 'interrupcao' THEN 4
  END;

\echo ''
\echo '============================================================'
\echo '👤 VERIFICAÇÃO 2: CLAUDEVANIA (CARREGANDO AGORA)'
\echo '============================================================'
\echo ''

SELECT 
  id,
  nome,
  apartamento,
  telefone,
  tag_rfid,
  notificacoes_ativas,
  CASE 
    WHEN tag_rfid IS NOT NULL AND tag_rfid != '' THEN '✅ Tag cadastrada'
    ELSE '❌ SEM TAG'
  END AS status_tag,
  CASE 
    WHEN telefone IS NOT NULL THEN '✅ Telefone OK'
    ELSE '❌ SEM TELEFONE'
  END AS status_tel,
  CASE 
    WHEN notificacoes_ativas THEN '✅ Notif. Ativas'
    ELSE '❌ Notif. Desativadas'
  END AS status_notif
FROM moradores
WHERE nome ILIKE '%claudevania%';

\echo ''
\echo '============================================================'
\echo '🔌 VERIFICAÇÃO 3: CARREGAMENTO ATIVO DA CLAUDEVANIA'
\echo '============================================================'
\echo ''

SELECT 
  c.id,
  c.charger_name,
  c.inicio,
  EXTRACT(EPOCH FROM (NOW() - c.inicio)) / 60 AS minutos_ativo,
  c.morador_id,
  c.notificacao_inicio_enviada AS evt1_enviado,
  c.notificacao_ociosidade_enviada AS evt2_enviado,
  c.notificacao_bateria_cheia_enviada AS evt3_enviado,
  c.interrupcao_detectada AS evt4_enviado,
  c.ultimo_power_w,
  c.primeiro_ocioso_em,
  CASE 
    WHEN c.morador_id IS NOT NULL THEN '✅ Morador identificado'
    ELSE '❌ MORADOR NÃO IDENTIFICADO'
  END AS status
FROM carregamentos c
WHERE c.id = 440159;

\echo ''
\echo '============================================================'
\echo '📊 VERIFICAÇÃO 4: TODOS OS CARREGAMENTOS ATIVOS'
\echo '============================================================'
\echo ''

SELECT 
  c.id,
  c.charger_name,
  m.nome AS morador,
  c.inicio,
  EXTRACT(EPOCH FROM (NOW() - c.inicio)) / 60 AS min_ativo,
  c.notificacao_inicio_enviada AS evt1,
  c.notificacao_ociosidade_enviada AS evt2,
  c.notificacao_bateria_cheia_enviada AS evt3,
  c.interrupcao_detectada AS evt4,
  c.ultimo_power_w AS power,
  CASE 
    WHEN c.morador_id IS NULL THEN '❌ SEM MORADOR'
    WHEN m.notificacoes_ativas = false THEN '⚠️  NOTIF OFF'
    WHEN m.telefone IS NULL THEN '⚠️  SEM TEL'
    ELSE '✅ OK'
  END AS status
FROM carregamentos c
LEFT JOIN moradores m ON c.morador_id = m.id
WHERE c.fim IS NULL
ORDER BY c.inicio DESC;

\echo ''
\echo '============================================================'
\echo '📱 VERIFICAÇÃO 5: ÚLTIMAS NOTIFICAÇÕES ENVIADAS'
\echo '============================================================'
\echo ''

SELECT 
  ln.criado_em,
  m.nome,
  ln.tipo,
  ln.status,
  SUBSTRING(ln.erro, 1, 50) AS erro_resumo
FROM logs_notificacoes ln
LEFT JOIN moradores m ON ln.morador_id = m.id
ORDER BY ln.criado_em DESC
LIMIT 10;

\echo ''
\echo '============================================================'
\echo '🔧 VERIFICAÇÃO 6: MORADORES SEM TAG RFID'
\echo '============================================================'
\echo ''

SELECT 
  id,
  nome,
  apartamento,
  telefone,
  CASE 
    WHEN tag_rfid IS NULL OR tag_rfid = '' THEN '❌ SEM TAG'
    ELSE tag_rfid
  END AS tag_rfid
FROM moradores
WHERE tag_rfid IS NULL OR tag_rfid = ''
ORDER BY nome;

\echo ''
\echo '============================================================'
\echo '🔗 VERIFICAÇÃO 7: MAPEAMENTOS MANUAIS (tag_pk_mapping)'
\echo '============================================================'
\echo ''

SELECT 
  tpm.ocpp_tag_pk,
  m.nome AS morador,
  m.apartamento,
  tpm.observacao,
  tpm.criado_em
FROM tag_pk_mapping tpm
LEFT JOIN moradores m ON tpm.morador_id = m.id
ORDER BY tpm.criado_em DESC;

\echo ''
\echo '============================================================'
\echo '⚠️  VERIFICAÇÃO 8: CARREGAMENTOS LONGOS SEM EVENTOS 2,3,4'
\echo '============================================================'
\echo ''

SELECT 
  c.id,
  c.charger_name,
  m.nome,
  c.inicio,
  c.fim,
  EXTRACT(EPOCH FROM (COALESCE(c.fim, NOW()) - c.inicio)) / 60 AS duracao_min,
  c.notificacao_inicio_enviada AS evt1,
  c.notificacao_ociosidade_enviada AS evt2,
  c.notificacao_bateria_cheia_enviada AS evt3,
  c.interrupcao_detectada AS evt4,
  CASE 
    WHEN c.notificacao_ociosidade_enviada = false 
     AND c.notificacao_bateria_cheia_enviada = false 
     AND c.interrupcao_detectada = false 
    THEN '❌ NENHUM EVENTO ENVIADO'
    ELSE '✅ Eventos enviados'
  END AS status
FROM carregamentos c
LEFT JOIN moradores m ON c.morador_id = m.id
WHERE EXTRACT(EPOCH FROM (COALESCE(c.fim, NOW()) - c.inicio)) / 60 > 60 -- Mais de 1 hora
  AND c.inicio > NOW() - INTERVAL '24 hours' -- Últimas 24h
ORDER BY c.inicio DESC
LIMIT 10;

\echo ''
\echo '============================================================'
\echo '📈 VERIFICAÇÃO 9: ESTATÍSTICAS DE NOTIFICAÇÕES (HOJE)'
\echo '============================================================'
\echo ''

SELECT 
  tipo,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE status = 'enviado') AS sucesso,
  COUNT(*) FILTER (WHERE status = 'erro') AS erro,
  ROUND(COUNT(*) FILTER (WHERE status = 'enviado')::numeric / NULLIF(COUNT(*), 0) * 100, 1) AS taxa_sucesso_pct
FROM logs_notificacoes
WHERE DATE(criado_em) = CURRENT_DATE
GROUP BY tipo
ORDER BY tipo;

\echo ''
\echo '============================================================'
\echo '✅ DIAGNÓSTICO COMPLETO'
\echo '============================================================'
\echo ''
\echo 'Próximos passos:'
\echo '1. Verificar se templates estão ativos'
\echo '2. Verificar se Claudevania tem tag_rfid ou mapeamento'
\echo '3. Verificar logs do backend no Render'
\echo '4. Ver arquivo ANALISE_PROBLEMAS_NOTIFICACOES_02FEV2026.md'
\echo ''
