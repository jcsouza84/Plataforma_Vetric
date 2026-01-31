# 🔄 VETRIC - Sistema de Migrations

Sistema profissional de migrations para controle de versão do banco de dados PostgreSQL.

## 📋 Índice

- [O que são Migrations?](#o-que-são-migrations)
- [Como Usar](#como-usar)
- [Comandos Disponíveis](#comandos-disponíveis)
- [Estrutura das Migrations](#estrutura-das-migrations)
- [Criar Nova Migration](#criar-nova-migration)
- [Boas Práticas](#boas-práticas)

---

## 🎯 O que são Migrations?

Migrations são uma forma de versionar as mudanças no schema do banco de dados. Cada migration representa uma alteração específica (criar tabela, adicionar coluna, criar índice, etc).

### Vantagens:

✅ **Versionamento**: Histórico completo de alterações no banco  
✅ **Idempotência**: Pode rodar múltiplas vezes sem problemas  
✅ **Rollback**: Reverter alterações se necessário  
✅ **Colaboração**: Time inteiro sincronizado  
✅ **Deploy**: Automatizar atualizações em produção  

---

## 🚀 Como Usar

### Executar Todas as Migrations Pendentes

```bash
# No diretório apps/backend
npm run migrate
```

### Ver Status das Migrations

```bash
npm run migrate:status
```

### Reverter Última Migration

```bash
npm run migrate:rollback
```

---

## 📚 Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run migrate` | Executa todas as migrations pendentes |
| `npm run migrate:status` | Mostra status de cada migration |
| `npm run migrate:rollback` | Reverte a última migration |

### Executar Diretamente com ts-node

```bash
# Executar migrations
ts-node src/database/index.ts run

# Ver status
ts-node src/database/index.ts status

# Rollback
ts-node src/database/index.ts rollback
```

---

## 📁 Estrutura das Migrations

### Localização

```
apps/backend/src/database/
├── migrations/
│   ├── 001_create_usuarios.ts
│   ├── 002_create_moradores.ts
│   ├── 003_create_carregamentos.ts
│   ├── 004_create_templates_notificacao.ts
│   ├── 005_create_relatorios.ts
│   ├── 006_create_logs_notificacoes.ts
│   ├── 007_create_configuracoes_sistema.ts
│   └── 008_create_tag_pk_mapping.ts
├── migrationRunner.ts (executor)
├── index.ts (CLI)
└── README.md
```

### Migrations Atuais

| # | Nome | Descrição |
|---|------|-----------|
| 001 | `create_usuarios` | Tabela de usuários (autenticação) |
| 002 | `create_moradores` | Tabela de moradores |
| 003 | `create_carregamentos` | Histórico de carregamentos |
| 004 | `create_templates_notificacao` | Templates WhatsApp |
| 005 | `create_relatorios` | Relatórios mensais |
| 006 | `create_logs_notificacoes` | Logs de notificações |
| 007 | `create_configuracoes_sistema` | Configurações dinâmicas |
| 008 | `create_tag_pk_mapping` | Mapeamento ocppTagPk |

---

## ➕ Criar Nova Migration

### 1. Criar Arquivo

Crie um novo arquivo em `migrations/` com numeração sequencial:

```
009_add_campo_xyz.ts
```

### 2. Template da Migration

```typescript
/**
 * Migration 009: Adicionar campo XYZ na tabela ABC
 */

import { Pool } from 'pg';

export const up = async (pool: Pool): Promise<void> => {
  await pool.query(`
    ALTER TABLE abc 
    ADD COLUMN xyz VARCHAR(100);
    
    CREATE INDEX IF NOT EXISTS idx_abc_xyz ON abc(xyz);
  `);
};

export const down = async (pool: Pool): Promise<void> => {
  await pool.query(`
    DROP INDEX IF EXISTS idx_abc_xyz;
    ALTER TABLE abc DROP COLUMN IF EXISTS xyz;
  `);
};

export const name = '009_add_campo_xyz';
export const description = 'Adicionar campo XYZ na tabela ABC';
```

### 3. Executar

```bash
npm run migrate
```

---

## ✅ Boas Práticas

### 1. **Sempre use IF EXISTS / IF NOT EXISTS**

```sql
-- ✅ BOM
CREATE TABLE IF NOT EXISTS usuarios (...);
DROP TABLE IF EXISTS usuarios;

-- ❌ RUIM
CREATE TABLE usuarios (...);
DROP TABLE usuarios;
```

### 2. **Sempre crie função `down()`**

Mesmo que nunca use, é importante ter rollback disponível.

### 3. **Uma alteração por migration**

```
✅ 009_add_campo_email.ts
✅ 010_create_index_email.ts

❌ 009_add_varios_campos_e_indices.ts
```

### 4. **Nomeie claramente**

```
✅ 009_add_telefone_to_moradores.ts
✅ 010_create_table_visitantes.ts

❌ 009_alteracao.ts
❌ 010_mudanca_banco.ts
```

### 5. **Teste antes de commitar**

```bash
# 1. Executar
npm run migrate

# 2. Verificar
npm run migrate:status

# 3. Testar rollback
npm run migrate:rollback

# 4. Executar novamente
npm run migrate
```

### 6. **Dados sensíveis**

Nunca coloque dados sensíveis nas migrations. Use seeds separados.

---

## 🔍 Como Funciona

### 1. Tabela de Controle

O sistema cria automaticamente uma tabela `_migrations`:

```sql
CREATE TABLE _migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  execution_time_ms INTEGER
);
```

### 2. Fluxo de Execução

```
1. Conectar ao banco
2. Criar tabela _migrations (se não existir)
3. Buscar migrations já executadas
4. Filtrar pendentes
5. Executar em ordem (001, 002, 003...)
6. Registrar na tabela _migrations
7. Relatório final
```

### 3. Exemplo de Saída

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║           🔄 VETRIC - Executando Migrations               ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

✅ Conectado ao banco de dados

📦 8 migration(s) carregada(s)
✅ 5 migration(s) já executada(s)

🔄 3 migration(s) pendente(s):

⏳ Executando: 006_create_logs_notificacoes
   📝 Criar tabela de logs de notificações enviadas
   ✅ Concluída em 45ms

⏳ Executando: 007_create_configuracoes_sistema
   📝 Criar tabela de configurações do sistema
   ✅ Concluída em 38ms

⏳ Executando: 008_create_tag_pk_mapping
   📝 Criar tabela de mapeamento ocppTagPk para moradores
   ✅ Concluída em 42ms

═══════════════════════════════════════════════════════════

✅ 3 migration(s) executada(s) com sucesso

✨ Migrations concluídas!
```

---

## 🚨 Troubleshooting

### Erro: "Cannot find module 'pg'"

```bash
cd apps/backend
npm install
```

### Erro: "Connection refused"

Verifique se o PostgreSQL está rodando:

```bash
# macOS (Homebrew)
brew services list | grep postgresql

# Ver configurações
cat apps/backend/.env | grep DB_
```

### Migration travou / falhou

1. Verificar qual foi executada por último:

```bash
npm run migrate:status
```

2. Conectar ao banco e verificar:

```bash
psql -U postgres -d vetric_db

SELECT * FROM _migrations ORDER BY executed_at DESC;
```

3. Se necessário, reverter:

```bash
npm run migrate:rollback
```

### Resetar completamente o banco

```bash
# ⚠️ CUIDADO: Apaga TUDO!

# 1. Conectar ao postgres
psql -U postgres

# 2. Dropar e recriar banco
DROP DATABASE vetric_db;
CREATE DATABASE vetric_db;

# 3. Executar migrations
npm run migrate
```

---

## 🌍 Uso em Produção

### Deploy na VPS

```bash
# 1. Fazer pull do código
git pull origin main

# 2. Instalar dependências
cd apps/backend
npm install

# 3. Executar migrations
npm run migrate

# 4. Reiniciar serviço
docker-compose restart backend
```

### Rollback em Produção

```bash
# 1. Reverter código
git checkout <commit-anterior>

# 2. Rollback da migration
npm run migrate:rollback

# 3. Reiniciar
docker-compose restart backend
```

---

## 📖 Referências

- [PostgreSQL Migrations Best Practices](https://www.postgresql.org/docs/current/ddl.html)
- [Database Migration Patterns](https://martinfowler.com/articles/evodb.html)

---

## 🤝 Suporte

Dúvidas? Entre em contato com o time de desenvolvimento.

**VETRIC Dashboard** - Sistema de Gerenciamento de Carregadores Elétricos





