# 🚀 Migrations - Guia Rápido

## ⚡ Uso Básico

### Executar Migrations

```bash
cd apps/backend
npm run migrate
```

### Ver Status

```bash
npm run migrate:status
```

### Reverter Última

```bash
npm run migrate:rollback
```

---

## 📦 O que foi criado?

### 8 Migrations Prontas:

1. ✅ **001** - Tabela `usuarios` (autenticação)
2. ✅ **002** - Tabela `moradores` 
3. ✅ **003** - Tabela `carregamentos`
4. ✅ **004** - Tabela `templates_notificacao` + 5 templates padrão
5. ✅ **005** - Tabela `relatorios`
6. ✅ **006** - Tabela `logs_notificacoes`
7. ✅ **007** - Tabela `configuracoes_sistema` + configs padrão
8. ✅ **008** - Tabela `tag_pk_mapping`

### Sistema de Controle:

- ✅ `migrationRunner.ts` - Executor inteligente
- ✅ `index.ts` - CLI de linha de comando
- ✅ Tabela `_migrations` - Controle automático
- ✅ Scripts no `package.json`

---

## 🎯 Quando Usar?

### ✅ Use Migrations:

- **Setup inicial** de banco de dados novo
- **Deploy em produção** (VPS)
- **Adicionar nova tabela** ou campo
- **Criar índices** para performance
- **Modificar schema** existente

### ❌ NÃO use para:

- Inserir dados de produção (use seeds)
- Backup de dados
- Queries ad-hoc

---

## 🔄 Fluxo de Trabalho

### Desenvolvimento Local

```bash
# 1. Criar nova migration
# Arquivo: src/database/migrations/009_minha_migration.ts

# 2. Executar
npm run migrate

# 3. Verificar
npm run migrate:status

# 4. Testar rollback
npm run migrate:rollback

# 5. Executar novamente
npm run migrate

# 6. Commitar
git add .
git commit -m "feat: adiciona migration 009"
```

### Deploy Produção

```bash
# Na VPS
cd /caminho/do/projeto
git pull
cd apps/backend
npm run migrate
docker-compose restart backend
```

---

## 🆕 Criar Nova Migration

### Template Base

Crie `src/database/migrations/009_nome_descritivo.ts`:

```typescript
import { Pool } from 'pg';

export const up = async (pool: Pool): Promise<void> => {
  await pool.query(`
    -- Sua SQL aqui
    CREATE TABLE IF NOT EXISTS exemplo (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(255)
    );
  `);
};

export const down = async (pool: Pool): Promise<void> => {
  await pool.query(`
    DROP TABLE IF EXISTS exemplo CASCADE;
  `);
};

export const name = '009_nome_descritivo';
export const description = 'Descrição clara do que faz';
```

---

## 🎨 Exemplos Práticos

### Adicionar Campo em Tabela

```typescript
// 009_add_cpf_to_moradores.ts
export const up = async (pool: Pool): Promise<void> => {
  await pool.query(`
    ALTER TABLE moradores 
    ADD COLUMN IF NOT EXISTS cpf VARCHAR(11) UNIQUE;
    
    CREATE INDEX IF NOT EXISTS idx_moradores_cpf 
    ON moradores(cpf);
  `);
};

export const down = async (pool: Pool): Promise<void> => {
  await pool.query(`
    DROP INDEX IF EXISTS idx_moradores_cpf;
    ALTER TABLE moradores DROP COLUMN IF EXISTS cpf;
  `);
};
```

### Criar Nova Tabela

```typescript
// 010_create_visitantes.ts
export const up = async (pool: Pool): Promise<void> => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS visitantes (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(255) NOT NULL,
      documento VARCHAR(20),
      morador_id INTEGER REFERENCES moradores(id),
      entrada TIMESTAMP NOT NULL,
      saida TIMESTAMP,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_visitantes_morador 
    ON visitantes(morador_id);
  `);
};

export const down = async (pool: Pool): Promise<void> => {
  await pool.query(`
    DROP TABLE IF EXISTS visitantes CASCADE;
  `);
};
```

### Modificar Campo Existente

```typescript
// 011_change_telefone_format.ts
export const up = async (pool: Pool): Promise<void> => {
  await pool.query(`
    ALTER TABLE moradores 
    ALTER COLUMN telefone TYPE VARCHAR(15);
  `);
};

export const down = async (pool: Pool): Promise<void> => {
  await pool.query(`
    ALTER TABLE moradores 
    ALTER COLUMN telefone TYPE VARCHAR(20);
  `);
};
```

---

## 🔍 Ver Tabelas Criadas

```bash
# Via CLI
psql -U postgres -d vetric_db -c "\dt"

# Via Node
ts-node -e "
const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost',
  database: 'vetric_db',
  user: 'postgres',
  password: 'postgres'
});
pool.query('SELECT tablename FROM pg_tables WHERE schemaname = \\'public\\'')
  .then(r => console.log(r.rows))
  .then(() => pool.end());
"
```

---

## ⚠️ Dicas Importantes

### ✅ SEMPRE faça:

1. **Backup antes de produção**
2. **Teste localmente primeiro**
3. **Use IF EXISTS / IF NOT EXISTS**
4. **Crie função down() (rollback)**
5. **Nome descritivo na migration**
6. **Commit após testar**

### ❌ NUNCA faça:

1. **Editar migration já executada**
2. **Dropar tabelas sem IF EXISTS**
3. **Colocar dados sensíveis**
4. **Pular numeração**
5. **Migration sem teste**

---

## 🚨 Troubleshooting

### "Module not found"

```bash
cd apps/backend
npm install
```

### "Connection refused"

```bash
# Verificar .env
cat .env | grep DB_

# Verificar PostgreSQL
brew services list | grep postgres
```

### Reset Completo (Desenvolvimento)

```bash
# ⚠️ APAGA TUDO!
psql -U postgres -c "DROP DATABASE vetric_db;"
psql -U postgres -c "CREATE DATABASE vetric_db;"
npm run migrate
```

---

## 📊 Exemplo de Saída

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║           🔄 VETRIC - Executando Migrations               ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

✅ Conectado ao banco de dados

📦 8 migration(s) carregada(s)
✅ 0 migration(s) já executada(s)

🔄 8 migration(s) pendente(s):

⏳ Executando: 001_create_usuarios
   📝 Criar tabela de usuários com autenticação JWT
   ✅ Concluída em 52ms

⏳ Executando: 002_create_moradores
   📝 Criar tabela de moradores do condomínio
   ✅ Concluída em 41ms

⏳ Executando: 003_create_carregamentos
   📝 Criar tabela de histórico de carregamentos
   ✅ Concluída em 48ms

⏳ Executando: 004_create_templates_notificacao
   📝 Criar tabela de templates de notificação WhatsApp
   ✅ Concluída em 156ms

⏳ Executando: 005_create_relatorios
   📝 Criar tabela de relatórios mensais
   ✅ Concluída em 39ms

⏳ Executando: 006_create_logs_notificacoes
   📝 Criar tabela de logs de notificações enviadas
   ✅ Concluída em 42ms

⏳ Executando: 007_create_configuracoes_sistema
   📝 Criar tabela de configurações do sistema
   ✅ Concluída em 65ms

⏳ Executando: 008_create_tag_pk_mapping
   📝 Criar tabela de mapeamento ocppTagPk para moradores
   ✅ Concluída em 44ms

═══════════════════════════════════════════════════════════

✅ 8 migration(s) executada(s) com sucesso

✨ Migrations concluídas!
```

---

## 📚 Documentação Completa

Ver: `apps/backend/src/database/README.md`

---

**VETRIC Dashboard** 🔋⚡
Sistema de Gerenciamento de Carregadores Elétricos

