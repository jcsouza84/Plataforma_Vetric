# ⚡ VETRIC - INÍCIO RÁPIDO (3 MINUTOS)

## 🎯 OBJETIVO

Colocar o backend **RODANDO** em 3 passos simples!

---

## 📋 PRÉ-REQUISITOS

Você precisa ter instalado:
- ✅ Node.js (v18+)
- ✅ PostgreSQL (v13+)

---

## 🚀 3 PASSOS PARA RODAR

### PASSO 1: PostgreSQL (1 minuto)

```bash
# Criar banco de dados
createdb vetric_db

# OU se preferir via psql:
psql postgres
CREATE DATABASE vetric_db;
\q
```

**✅ Pronto!** O backend criará as tabelas automaticamente.

---

### PASSO 2: Configurar .env (30 segundos)

```bash
cd backend
cp ../ENV_EXAMPLE.txt .env
```

**✅ Pronto!** O arquivo já vem com as credenciais de teste configuradas!

---

### PASSO 3: Iniciar Backend (30 segundos)

```bash
# Ainda na pasta backend/
npm run dev
```

**Aguarde ver:**
```
╔═══════════════════════════════════════════════════════════╗
║           ✅ VETRIC DASHBOARD ONLINE!                     ║
╚═══════════════════════════════════════════════════════════╝

🌐 Servidor rodando em: http://localhost:3001
```

**✅ PRONTO! Sistema rodando!** 🎉

---

## 🧪 TESTAR (1 minuto)

Abra outro terminal:

```bash
# Health check
curl http://localhost:3001/health

# Estatísticas
curl http://localhost:3001/api/dashboard/stats

# Listar carregadores
curl http://localhost:3001/api/dashboard/chargers
```

**Você deve ver JSON com os dados! ✅**

---

## 👥 CADASTRAR MORADOR DE TESTE (Opcional)

```bash
curl -X POST http://localhost:3001/api/moradores \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "apartamento": "101",
    "telefone": "48999999999",
    "tag_rfid": "TAG001",
    "notificacoes_ativas": true
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nome": "João Silva",
    ...
  },
  "message": "Morador cadastrado com sucesso"
}
```

---

## 🎨 ACESSAR PELO NAVEGADOR

Abra: **http://localhost:3001**

Você verá:
```json
{
  "name": "VETRIC Dashboard API",
  "version": "1.0.0",
  "status": "running",
  "endpoints": [...]
}
```

---

## 🔥 ENDPOINTS PRINCIPAIS

### Dashboard
```bash
# Estatísticas gerais
curl http://localhost:3001/api/dashboard/stats

# Listar carregadores
curl http://localhost:3001/api/dashboard/chargers
```

### Moradores
```bash
# Listar todos
curl http://localhost:3001/api/moradores

# Buscar por tag RFID
curl http://localhost:3001/api/moradores/tag/TAG001
```

### Carregamentos
```bash
# Listar ativos
curl http://localhost:3001/api/carregamentos/ativos

# Estatísticas do dia
curl http://localhost:3001/api/carregamentos/stats/today
```

---

## 🐛 PROBLEMAS?

### Erro: "database does not exist"
```bash
createdb vetric_db
```

### Erro: "PostgreSQL is not running"
```bash
# macOS:
brew services start postgresql@15

# Linux:
sudo systemctl start postgresql
```

### Erro: "Cannot find module"
```bash
cd backend
npm install
```

### Porta 3001 em uso?
Edite o `.env`:
```env
PORT=3002
```

---

## 📊 O QUE O SISTEMA FAZ

### ✅ Monitoramento Automático
- Detecta quando alguém conecta o carro
- Identifica o morador pela tag RFID
- Registra no banco de dados
- Envia notificação WhatsApp (se configurado)

### ✅ API REST
- 19 endpoints disponíveis
- Dados em tempo real
- Estatísticas e relatórios

### ✅ WebSocket
- Conexão em tempo real com CVE-PRO
- Atualizações instantâneas
- Reconexão automática

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ Backend rodando
2. ⏭️ Testar endpoints
3. ⏭️ Cadastrar moradores
4. ⏭️ Configurar Evolution API (opcional)
5. ⏭️ Adaptar frontend

---

## 📱 CONFIGURAR WHATSAPP (Opcional)

Se quiser ativar notificações:

1. Obtenha credenciais da Evolution API
2. Edite `backend/.env`:
```env
EVOLUTION_API_URL=https://sua-api.com
EVOLUTION_API_KEY=sua-chave
EVOLUTION_INSTANCE=sua-instancia
```
3. Reinicie o backend

---

## ✅ CHECKLIST

- [ ] PostgreSQL instalado
- [ ] Banco `vetric_db` criado
- [ ] Arquivo `.env` configurado
- [ ] `npm run dev` executado
- [ ] Backend iniciou sem erros
- [ ] Testei `/health` → Status 200
- [ ] Testei `/api/dashboard/stats` → Dados OK

---

## 🎉 SUCESSO!

Se você chegou até aqui, seu backend está **100% FUNCIONAL**!

**O que você tem agora:**
- ✅ API REST completa
- ✅ Integração com CVE-PRO
- ✅ Monitoramento em tempo real
- ✅ Banco de dados estruturado
- ✅ Sistema de notificações

**Pronto para:**
- ✅ Conectar o frontend
- ✅ Cadastrar moradores
- ✅ Monitorar carregamentos
- ✅ Enviar notificações

---

## 📚 DOCUMENTAÇÃO COMPLETA

- `README.md` - Visão geral do projeto
- `SETUP_RAPIDO.md` - Guia detalhado
- `RESUMO_DESENVOLVIMENTO.md` - O que foi desenvolvido
- `SETUP_COMPLETO.md` - Setup completo com SQL

---

**Dúvidas?** Consulte os arquivos de documentação! 📖

**Tudo funcionando?** Próximo passo: adaptar o frontend! 🎨

---

**VETRIC Dashboard - Desenvolvido com ❤️** 🚀

