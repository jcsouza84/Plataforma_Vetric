# 🔧 TROUBLESHOOTING COMPLETO - VETRIC DASHBOARD

**Última Atualização:** 12 de Janeiro de 2026  
**Versão:** 1.0.0

---

## 📋 ÍNDICE

1. [Problemas de Conexão](#problemas-de-conexão)
2. [Problemas de Autenticação](#problemas-de-autenticação)
3. [Problemas com CORS](#problemas-com-cors)
4. [Problemas com Evolution API](#problemas-com-evolution-api)
5. [Problemas com Banco de Dados](#problemas-com-banco-de-dados)
6. [Problemas de Performance](#problemas-de-performance)
7. [Comandos Úteis](#comandos-úteis)

---

## 🌐 PROBLEMAS DE CONEXÃO

### ❌ **Backend não inicia (EADDRINUSE)**
```bash
Error: listen EADDRINUSE: address already in use :::3001
```

**Causa:** Outra instância do backend já está rodando na porta 3001.

**Solução:**
```bash
# Opção 1: Matar processo específico
lsof -ti:3001 | xargs kill -9

# Opção 2: Matar TODAS as instâncias do backend
pkill -f "ts-node-dev.*src/index.ts"
pkill -f "node.*backend"

# Reiniciar
cd vetric-dashboard/backend && npm run dev
```

---

### ❌ **Frontend não conecta ao backend**
```bash
net::ERR_CONNECTION_REFUSED
```

**Causa:** Backend não está rodando ou frontend está configurado com URL errada.

**Solução:**
```bash
# 1. Verificar se backend está online
curl http://localhost:3001/health

# 2. Se não responder, iniciar backend
cd vetric-dashboard/backend && npm run dev

# 3. Verificar URL no frontend (src/services/api.ts)
# Deve ser: http://localhost:3001
```

---

### ❌ **API CVE-Pro retornando 502 Bad Gateway**
```bash
❌ Erro ao buscar carregadores: 502 Bad Gateway
```

**Causa:** Servidor da Intelbras temporariamente offline ou instável.

**Solução:** O sistema agora possui **retry automático** (3 tentativas):
```typescript
// Implementado em CVEService.ts
// Retry automático: 5s, 10s, 15s
// Não requer ação manual!
```

**Monitoramento:**
```bash
# Ver logs do backend
tail -f vetric-dashboard/backend/logs/*.log

# Verificar status da API
curl -H "Api-Key: SEU_API_KEY" \
     https://cs.intelbras-cve-pro.com.br/api/v1/health
```

---

## 🔐 PROBLEMAS DE AUTENTICAÇÃO

### ❌ **Erro: "E000 - Tenant Not Found"**
```bash
❌ Erro no login: { error: 'E000 - Tenant Not Found' }
```

**Causa:** URL da API CVE-Pro incorreta ou API Key inválida.

**Solução:**
```bash
# 1. Verificar .env do backend
cat vetric-dashboard/backend/.env | grep CVE

# Deve ter:
CVE_API_BASE_URL=https://cs.intelbras-cve-pro.com.br
CVE_API_KEY=808c0fb3-dc7f-40f5-b294-807f21fc8947
CVE_USERNAME=julio@mundologic.com.br
CVE_PASSWORD=1a2b3c4d

# 2. Reiniciar backend
pkill -f "ts-node-dev.*src/index.ts"
cd vetric-dashboard/backend && npm run dev
```

---

### ❌ **Token expirado**
```bash
❌ Invalid AUTHORIZATION set in Header!
```

**Causa:** Token JWT expirou (validade: 24h).

**Solução:** O sistema agora possui **renovação automática** (1h antes de expirar):
```typescript
// Implementado em CVEService.ts
// Renovação automática: 1h antes da expiração
// Não requer ação manual!
```

**Forçar renovação manual (se necessário):**
```bash
# Reiniciar backend
pkill -f "ts-node-dev.*src/index.ts"
cd vetric-dashboard/backend && npm run dev
```

---

### ❌ **Login no frontend não funciona**
```bash
401 Unauthorized
```

**Causa:** Credenciais incorretas ou backend offline.

**Solução:**
```bash
# 1. Verificar backend está online
curl http://localhost:3001/health

# 2. Testar login direto
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vetric.com.br","senha":"Vetric@2026"}'

# 3. Credenciais padrão:
# ADMIN:   admin@vetric.com.br / Vetric@2026
# CLIENTE: granmarine@vetric.com.br / GranMarine@2026
```

---

## 🌍 PROBLEMAS COM CORS

### ❌ **"No 'Access-Control-Allow-Origin' header"**
```bash
Access to XMLHttpRequest blocked by CORS policy
```

**Causa:** `NODE_ENV=production` no `.env` do backend.

**Solução:**
```bash
# 1. Editar .env
cd vetric-dashboard/backend
nano .env

# Alterar para:
NODE_ENV=development

# 2. Reiniciar backend
pkill -f "ts-node-dev.*src/index.ts"
npm run dev

# 3. Recarregar frontend
# Ctrl+Shift+R (hard refresh)
```

**Importante:**
- **development:** CORS permissivo (`origin: *`)
- **production:** CORS restritivo (apenas URLs específicas)

---

## 📱 PROBLEMAS COM EVOLUTION API

### ❌ **404 Not Found ao enviar mensagem**
```bash
404: Cannot POST /message/sendText
```

**Causa:** Configurações da Evolution API não estão no banco de dados.

**Solução:**
```bash
# 1. Verificar configurações no banco
psql -d vetric_db -c "SELECT * FROM configuracoes_sistema WHERE chave LIKE 'evolution_%';"

# 2. Se não houver registros, adicionar manualmente:
psql -d vetric_db <<EOF
INSERT INTO configuracoes_sistema (chave, valor, descricao, atualizado_por)
VALUES 
  ('evolution_api_url', 'http://habbora-evolutionapi-cf4643-46-202-146-195.traefik.me', 'URL base da Evolution API', 'system'),
  ('evolution_api_key', 'SEU_API_KEY', 'API Key da Evolution API', 'system'),
  ('evolution_instance', 'Vetric Bot', 'Nome da instância', 'system');
EOF

# 3. Reiniciar backend
cd vetric-dashboard/backend
npm run dev
```

---

### ❌ **401 Unauthorized na Evolution API**
```bash
401: Unauthorized
```

**Causa:** API Key incorreta ou expirada.

**Solução:**
```bash
# 1. Testar API Key diretamente
curl -H "apikey: SEU_API_KEY" \
     http://habbora-evolutionapi-cf4643-46-202-146-195.traefik.me/instance/fetchInstances

# 2. Se falhar, pegar nova API Key do dashboard Evolution API
# http://habbora-evolutionapi-cf4643-46-202-146-195.traefik.me/manager/

# 3. Atualizar no banco
psql -d vetric_db -c "UPDATE configuracoes_sistema SET valor='NOVA_API_KEY' WHERE chave='evolution_api_key';"

# 4. Reiniciar backend
cd vetric-dashboard/backend && npm run dev
```

---

### ❌ **Notificações não são enviadas**

**Causa:** Template desativado, morador sem telefone, ou notificações desativadas.

**Solução:**
```bash
# 1. Verificar templates ativos
psql -d vetric_db -c "SELECT tipo, ativo FROM templates_notificacao;"

# 2. Verificar morador tem telefone e notificações ativas
psql -d vetric_db -c "SELECT nome, telefone, notificacoes_ativas FROM moradores WHERE id=1;"

# 3. Ativar template
psql -d vetric_db -c "UPDATE templates_notificacao SET ativo=true WHERE tipo='inicio_carregamento';"

# 4. Ativar notificações do morador
psql -d vetric_db -c "UPDATE moradores SET notificacoes_ativas=true WHERE id=1;"

# 5. Adicionar telefone do morador
psql -d vetric_db -c "UPDATE moradores SET telefone='5582996176797' WHERE id=1;"
```

**Validação em 3 níveis:**
1. ✅ Template ativo (`templates_notificacao.ativo = true`)
2. ✅ Morador com notificações ativas (`moradores.notificacoes_ativas = true`)
3. ✅ Morador tem telefone (`moradores.telefone IS NOT NULL`)

---

## 🗄️ PROBLEMAS COM BANCO DE DADOS

### ❌ **Database does not exist**
```bash
database "vetric_dashboard" does not exist
```

**Causa:** Banco de dados não foi criado ou nome incorreto no `.env`.

**Solução:**
```bash
# 1. Criar banco
psql -U juliocesarsouza postgres -c "CREATE DATABASE vetric_db;"

# 2. Verificar .env
cat vetric-dashboard/backend/.env | grep DB_NAME

# Deve ser:
DB_NAME=vetric_db

# 3. Inicializar schema
cd vetric-dashboard/backend
npm run db:init

# 4. Criar usuários padrão
npm run dev  # Seed automático ao iniciar
```

---

### ❌ **Connection refused ao PostgreSQL**
```bash
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Causa:** PostgreSQL não está rodando.

**Solução:**
```bash
# MacOS com Homebrew
brew services start postgresql@14

# Verificar status
brew services list | grep postgresql

# Testar conexão
psql -U juliocesarsouza -d vetric_db -c "SELECT 1;"
```

---

### ❌ **Migrations não aplicadas**
```bash
relation "usuarios" does not exist
```

**Causa:** Tabelas não foram criadas.

**Solução:**
```bash
# Opção 1: Executar seed automático
cd vetric-dashboard/backend
npm run dev  # Cria tabelas automaticamente

# Opção 2: Forçar recriação
psql -U juliocesarsouza -d vetric_db <<EOF
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO juliocesarsouza;
GRANT ALL ON SCHEMA public TO public;
EOF

npm run dev  # Recria tudo
```

---

## ⚡ PROBLEMAS DE PERFORMANCE

### ❌ **Dashboard lento para carregar**

**Causa:** Muitas requisições simultâneas ou API CVE-Pro lenta.

**Solução:**
```bash
# 1. Verificar tempo de resposta da API
time curl -H "Api-Key: SEU_API_KEY" \
          -H "Authorization: Bearer SEU_TOKEN" \
          https://cs.intelbras-cve-pro.com.br/api/v1/chargepoints

# 2. Verificar logs do backend
tail -f vetric-dashboard/backend/logs/*.log | grep "tempo"

# 3. Habilitar cache (se necessário)
# Ver SISTEMA_ALTA_DISPONIBILIDADE_PRODUCAO.md
```

---

### ❌ **WebSocket desconectando**
```bash
WebSocket connection failed
```

**Causa:** CVE-Pro API instável ou token expirado.

**Solução:** O sistema possui **reconexão automática**:
```typescript
// Implementado em WebSocketService.ts
// Reconexão automática: 5s, 10s, 20s
// Não requer ação manual!
```

**Monitorar status:**
```bash
# Health check
curl http://localhost:3001/health

# Verificar logs
tail -f vetric-dashboard/backend/logs/*.log | grep "WebSocket"
```

---

## 🛠️ COMANDOS ÚTEIS

### **Verificar Status Completo do Sistema**
```bash
#!/bin/bash

echo "🔍 VETRIC - Status Completo"
echo ""

# Backend
echo "📡 Backend:"
curl -s http://localhost:3001/health | python3 -m json.tool
echo ""

# Banco de dados
echo "🗄️  Banco de Dados:"
psql -d vetric_db -c "\dt" | head -20
echo ""

# Portas em uso
echo "🔌 Portas:"
lsof -i :3001 | grep LISTEN
lsof -i :8080 | grep LISTEN
echo ""

# API CVE-Pro
echo "⚡ API CVE-Pro:"
curl -s -H "Api-Key: 808c0fb3-dc7f-40f5-b294-807f21fc8947" \
     https://cs.intelbras-cve-pro.com.br/api/v1/health
echo ""
```

---

### **Reset Completo do Sistema**
```bash
#!/bin/bash

echo "🔄 RESET COMPLETO - VETRIC"
echo "⚠️  Atenção: Isso vai apagar TODOS os dados!"
read -p "Continuar? (s/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    exit 1
fi

# Matar processos
pkill -f "ts-node-dev"
pkill -f "node.*backend"
lsof -ti:3001 | xargs kill -9 2>/dev/null

# Recriar banco
psql -U juliocesarsouza postgres <<EOF
DROP DATABASE IF EXISTS vetric_db;
CREATE DATABASE vetric_db;
EOF

# Reiniciar backend (cria schema automaticamente)
cd vetric-dashboard/backend
npm run dev &

sleep 5

# Seed de moradores
npm run seed:moradores

echo "✅ Reset completo finalizado!"
```

---

### **Backup e Restore**
```bash
# BACKUP
pg_dump -U juliocesarsouza vetric_db > backup_$(date +%Y%m%d_%H%M).sql

# RESTORE
psql -U juliocesarsouza vetric_db < backup_20260112_0730.sql

# Backup de uploads (relatórios)
tar -czf uploads_$(date +%Y%m%d).tar.gz vetric-dashboard/backend/uploads/
```

---

### **Logs e Debugging**
```bash
# Logs em tempo real do backend
tail -f vetric-dashboard/backend/logs/*.log

# Filtrar erros
tail -f vetric-dashboard/backend/logs/*.log | grep "ERROR"

# Ver últimas 100 linhas
tail -100 vetric-dashboard/backend/logs/*.log

# Logs do PostgreSQL (MacOS)
tail -f /usr/local/var/log/postgresql@14.log
```

---

## 📞 SUPORTE

Se o problema persistir:

1. **Verificar documentação:**
   - `BUGS_PRODUCAO_12JAN2026.md` - Bugs mais recentes
   - `SISTEMA_ALTA_DISPONIBILIDADE_PRODUCAO.md` - Detalhes técnicos
   - `INTEGRACAO_EVOLUTION_API.md` - Problemas com WhatsApp

2. **Coletar informações:**
   ```bash
   # Salvar logs
   curl http://localhost:3001/health > status.json
   tail -500 vetric-dashboard/backend/logs/*.log > backend.log
   psql -d vetric_db -c "\dt" > database.txt
   ```

3. **Contatar suporte:**
   - Email: admin@vetric.com.br
   - Incluir: logs, erro específico, passos para reproduzir

---

**🔧 TROUBLESHOOTING COMPLETO - VETRIC DASHBOARD**

_Última atualização: 12 de Janeiro de 2026_  
_Versão: 1.0.0_



