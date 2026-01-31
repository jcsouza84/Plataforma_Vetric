# ✅ Sistema de Migrations VETRIC - Criado com Sucesso!

## 🎉 O que foi criado?

### 📁 Estrutura Completa

```
apps/backend/src/database/
├── migrations/
│   ├── 001_create_usuarios.ts              ✅ Tabela de autenticação
│   ├── 002_create_moradores.ts             ✅ Tabela de moradores
│   ├── 003_create_carregamentos.ts         ✅ Histórico de cargas
│   ├── 004_create_templates_notificacao.ts ✅ Templates WhatsApp
│   ├── 005_create_relatorios.ts            ✅ Relatórios mensais
│   ├── 006_create_logs_notificacoes.ts     ✅ Logs de envios
│   ├── 007_create_configuracoes_sistema.ts ✅ Configs dinâmicas
│   └── 008_create_tag_pk_mapping.ts        ✅ Mapeamento tags
├── migrationRunner.ts                       ✅ Sistema executor
├── index.ts                                 ✅ CLI interface
└── README.md                                ✅ Documentação completa

apps/backend/
├── MIGRATIONS_QUICKSTART.md                 ✅ Guia rápido
└── package.json                             ✅ Scripts adicionados
```

---

## 🚀 Como Usar (PASSO A PASSO)

### 1️⃣ Executar Migrations pela Primeira Vez

```bash
# Entre no diretório do backend
cd apps/backend

# Execute as migrations
npm run migrate
```

**Resultado esperado:**
```
╔═══════════════════════════════════════════════════════════╗
║           🔄 VETRIC - Executando Migrations               ║
╚═══════════════════════════════════════════════════════════╝

✅ Conectado ao banco de dados
📦 8 migration(s) carregada(s)
✅ 0 migration(s) já executada(s)
🔄 8 migration(s) pendente(s):

⏳ Executando: 001_create_usuarios
   📝 Criar tabela de usuários com autenticação JWT
   ✅ Concluída em 52ms

[... todas as 8 migrations ...]

✅ 8 migration(s) executada(s) com sucesso
✨ Migrations concluídas!
```

### 2️⃣ Ver Status das Migrations

```bash
npm run migrate:status
```

### 3️⃣ Reverter Última Migration (se necessário)

```bash
npm run migrate:rollback
```

---

## 🎯 Comandos Disponíveis

| Comando | O que faz |
|---------|-----------|
| `npm run migrate` | Executa todas as migrations pendentes |
| `npm run migrate:status` | Mostra quais foram executadas |
| `npm run migrate:rollback` | Reverte a última migration |

---

## ✨ Funcionalidades

### ✅ O Sistema de Migrations Tem:

1. **Controle de Versão Automático**
   - Tabela `_migrations` rastreia o que foi executado
   - Nunca executa a mesma migration duas vezes

2. **Idempotência**
   - Pode rodar `npm run migrate` múltiplas vezes
   - Só executa o que está pendente

3. **Rollback**
   - Cada migration tem função `up()` e `down()`
   - Pode reverter alterações

4. **Ordem Garantida**
   - Executa em ordem numérica (001, 002, 003...)
   - Migrations dependentes funcionam corretamente

5. **Logs Detalhados**
   - Mostra progresso em tempo real
   - Registra tempo de execução
   - Salva histórico no banco

6. **Segurança**
   - Para na primeira falha
   - Usa IF EXISTS / IF NOT EXISTS
   - Previne duplicações

---

## 📊 Tabelas que Serão Criadas

| # | Tabela | Descrição | Colunas Principais |
|---|--------|-----------|-------------------|
| 1 | `usuarios` | Autenticação JWT | email, senha_hash, role |
| 2 | `moradores` | Moradores do condomínio | nome, apartamento, tag_rfid |
| 3 | `carregamentos` | Histórico de cargas | charger_uuid, status, energia_kwh |
| 4 | `templates_notificacao` | Mensagens WhatsApp | tipo, mensagem, ativo |
| 5 | `relatorios` | Relatórios mensais | titulo, arquivo_path, mes/ano |
| 6 | `logs_notificacoes` | Log de envios | morador_id, status, erro |
| 7 | `configuracoes_sistema` | Configs dinâmicas | chave, valor, descricao |
| 8 | `tag_pk_mapping` | Mapeamento tags | ocpp_tag_pk, morador_id |
| * | `_migrations` | Controle (auto) | name, executed_at |

**Total: 9 tabelas** (8 do sistema + 1 de controle)

---

## 🔧 Exemplo: Criar Nova Migration

### Cenário: Adicionar campo "CPF" na tabela moradores

**1. Criar arquivo:**
```bash
touch src/database/migrations/009_add_cpf_to_moradores.ts
```

**2. Código:**
```typescript
import { Pool } from 'pg';

export const up = async (pool: Pool): Promise<void> => {
  await pool.query(`
    ALTER TABLE moradores 
    ADD COLUMN IF NOT EXISTS cpf VARCHAR(11) UNIQUE;
    
    CREATE INDEX IF NOT EXISTS idx_moradores_cpf 
    ON moradores(cpf);
    
    COMMENT ON COLUMN moradores.cpf IS 'CPF do morador (apenas números)';
  `);
};

export const down = async (pool: Pool): Promise<void> => {
  await pool.query(`
    DROP INDEX IF EXISTS idx_moradores_cpf;
    ALTER TABLE moradores DROP COLUMN IF EXISTS cpf;
  `);
};

export const name = '009_add_cpf_to_moradores';
export const description = 'Adicionar campo CPF na tabela moradores';
```

**3. Executar:**
```bash
npm run migrate
```

---

## 🌍 Uso em Produção (VPS com Docker)

### Deploy Inicial

```bash
# 1. SSH na VPS
ssh user@seu-servidor.com

# 2. Ir para o projeto
cd /caminho/do/vetric

# 3. Pull do código
git pull origin main

# 4. Entrar no container do backend
docker-compose exec backend bash

# 5. Executar migrations
npm run migrate

# 6. Sair do container
exit
```

### Atualizações Futuras

```bash
# Na VPS
cd /caminho/do/vetric
git pull origin main
docker-compose exec backend npm run migrate
docker-compose restart backend
```

---

## 🔍 Verificar se Funcionou

### Via npm run migrate:status

```bash
npm run migrate:status
```

Deve mostrar todas as 8 migrations como **EXECUTADA**.

### Via psql

```bash
# Conectar ao banco
psql -U postgres -d vetric_db

# Ver tabelas criadas
\dt

# Ver histórico de migrations
SELECT * FROM _migrations ORDER BY executed_at;

# Sair
\q
```

### Via código

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  database: 'vetric_db',
  user: 'postgres',
  password: 'postgres'
});

// Ver tabelas
const result = await pool.query(`
  SELECT tablename 
  FROM pg_tables 
  WHERE schemaname = 'public'
  ORDER BY tablename;
`);

console.log(result.rows);
```

---

## 📚 Documentação

### Guias Criados:

1. **README Completo**: `apps/backend/src/database/README.md`
   - Explicação detalhada do sistema
   - Boas práticas
   - Troubleshooting

2. **Quickstart**: `apps/backend/MIGRATIONS_QUICKSTART.md`
   - Comandos rápidos
   - Exemplos práticos
   - Casos de uso

3. **Este Arquivo**: `SISTEMA_MIGRATIONS_CRIADO.md`
   - Resumo do que foi criado
   - Como começar a usar

---

## ⚠️ Importante Saber

### ✅ SEMPRE faça:

1. **Backup antes de produção**
   ```bash
   pg_dump -U postgres vetric_db > backup_antes_migration.sql
   ```

2. **Teste localmente primeiro**
   ```bash
   npm run migrate        # Executar
   npm run migrate:rollback  # Testar rollback
   npm run migrate        # Executar novamente
   ```

3. **Commit após testar**
   ```bash
   git add src/database/migrations/
   git commit -m "feat: adiciona migration XXX"
   ```

### ❌ NUNCA faça:

1. **Editar migration já executada em produção**
   - Crie uma nova migration para corrigir

2. **Pular numeração**
   - 001, 002, 003... (sempre sequencial)

3. **Dropar tabelas sem IF EXISTS**
   - Sempre use IF EXISTS / IF NOT EXISTS

---

## 🎯 Próximos Passos

### 1. Testar Localmente

```bash
cd apps/backend
npm run migrate
npm run migrate:status
```

### 2. Ver Tabelas Criadas

```bash
psql -U postgres -d vetric_db -c "\dt"
```

### 3. Rodar Seeds (usuários padrão)

```bash
# Criar usuários ADMIN e CLIENTE
npm run dev
# Os usuários são criados automaticamente no startup
```

### 4. Deploy na VPS

```bash
# Seguir instruções da seção "Uso em Produção"
```

---

## 🆘 Problemas Comuns

### "Cannot find module 'pg'"

```bash
cd apps/backend
npm install
```

### "Connection refused"

Verifique se o PostgreSQL está rodando:

```bash
# macOS
brew services list | grep postgresql

# Linux/VPS
sudo systemctl status postgresql
```

### "Migration já executada"

É normal! O sistema não executa duas vezes. Use:

```bash
npm run migrate:status
```

Para ver quais já foram executadas.

---

## 🎉 Conclusão

Você agora tem um **sistema profissional de migrations** que:

✅ Versiona todas as alterações no banco  
✅ Funciona em dev, test e produção  
✅ Permite rollback de alterações  
✅ É idempotente (pode rodar múltiplas vezes)  
✅ Tem documentação completa  
✅ Segue as melhores práticas  

---

## 📞 Suporte

- 📖 **Documentação Completa**: `apps/backend/src/database/README.md`
- ⚡ **Guia Rápido**: `apps/backend/MIGRATIONS_QUICKSTART.md`
- 💬 **Dúvidas**: Entre em contato com o time

---

**VETRIC Dashboard** 🔋⚡  
Sistema de Gerenciamento de Carregadores Elétricos

*Sistema de migrations criado em 14/01/2026*





