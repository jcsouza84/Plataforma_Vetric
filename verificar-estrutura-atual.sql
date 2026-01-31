-- ================================================
-- 🔍 VERIFICAR ESTRUTURA ATUAL DO BANCO
-- ================================================

-- 1. Ver TODOS os campos da tabela "carregamentos"
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_name = 'carregamentos'
ORDER BY 
    ordinal_position;

-- 2. Verificar se tabela "mensagens_notificacoes" existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'mensagens_notificacoes'
);

-- 3. Verificar se tabela "configuracoes_sistema" existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'configuracoes_sistema'
);

-- 4. Ver campos de "logs_notificacoes" (se existe)
SELECT 
    column_name,
    data_type
FROM 
    information_schema.columns
WHERE 
    table_name = 'logs_notificacoes'
ORDER BY 
    ordinal_position;

