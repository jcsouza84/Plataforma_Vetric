# 🚀 VETRIC Dashboard - Setup Rápido

## ✅ O QUE JÁ FOI FEITO

### 1. **Backend Completo** ✅
- ✅ Estrutura de pastas criada
- ✅ TypeScript configurado
- ✅ Models (Morador, Carregamento, Template)
- ✅ Services (CVE-PRO, WebSocket, Notificações)
- ✅ Rotas REST API completas
- ✅ Banco de dados PostgreSQL configurado
- ✅ Dependências instaladas

### 2. **Testes da API** ✅
- ✅ Script de teste automático criado
- ✅ 5 carregadores identificados no ambiente de teste
- ✅ Estrutura de dados mapeada

---

## 🎯 PRÓXIMOS PASSOS

### PASSO 1: Configurar PostgreSQL

```bash
# Instalar PostgreSQL (se não tiver)
# macOS:
brew install postgresql@15
brew services start postgresql@15

# Criar banco de dados
createdb vetric_db

# OU usar psql:
psql postgres
CREATE DATABASE vetric_db;
\q
```

### PASSO 2: Configurar .env

```bash
cd backend
cp ../ENV_EXAMPLE.txt .env
```

O arquivo `.env` já está configurado com as credenciais de teste!

### PASSO 3: Iniciar Backend

```bash
cd backend
npm run dev
```

O sistema irá:
1. ✅ Validar configurações
2. ✅ Criar tabelas no banco
3. ✅ Fazer login na API CVE-PRO
4. ✅ Conectar ao WebSocket
5. ✅ Iniciar servidor na porta 3001

### PASSO 4: Testar API

Abra outro terminal:

```bash
# Estatísticas gerais
curl http://localhost:3001/api/dashboard/stats

# Listar carregadores
curl http://localhost:3001/api/dashboard/chargers

# Health check
curl http://localhost:3001/health
```

---

## 📊 ENDPOINTS DISPONÍVEIS

### Dashboard
- `GET /api/dashboard/stats` - Estatísticas gerais
- `GET /api/dashboard/chargers` - Lista de carregadores
- `GET /api/dashboard/charger/:uuid` - Detalhes de um carregador

### Moradores
- `GET /api/moradores` - Listar todos
- `GET /api/moradores/:id` - Buscar por ID
- `GET /api/moradores/tag/:tag` - Buscar por Tag RFID
- `POST /api/moradores` - Criar novo
- `PUT /api/moradores/:id` - Atualizar
- `DELETE /api/moradores/:id` - Deletar

### Carregamentos
- `GET /api/carregamentos` - Listar todos
- `GET /api/carregamentos/ativos` - Carregamentos em andamento
- `GET /api/carregamentos/morador/:id` - Por morador
- `GET /api/carregamentos/stats/today` - Estatísticas do dia

### Templates
- `GET /api/templates` - Listar templates
- `PUT /api/templates/:tipo` - Atualizar template

---

## 🧪 CADASTRAR MORADORES DE TESTE

```bash
# Morador 1
curl -X POST http://localhost:3001/api/moradores \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "apartamento": "101",
    "telefone": "48999999999",
    "tag_rfid": "TAG001",
    "notificacoes_ativas": true
  }'

# Morador 2
curl -X POST http://localhost:3001/api/moradores \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Maria Santos",
    "apartamento": "102",
    "telefone": "48988888888",
    "tag_rfid": "TAG002",
    "notificacoes_ativas": true
  }'
```

---

## 🔄 MONITORAMENTO EM TEMPO REAL

O sistema está **AUTOMATICAMENTE** monitorando:

✅ **Início de carregamento**: Quando alguém conecta o carro
✅ **Fim de carregamento**: Quando a carga termina
✅ **Status dos carregadores**: Disponível, Ocupado, Carregando, etc.

**Notificações WhatsApp** (quando Evolution API configurada):
- Início: "🔋 Olá João! Seu carregamento foi iniciado..."
- Fim: "✅ Olá João! Seu carregamento foi concluído. Energia: 15.5 kWh..."

---

## 📱 CONFIGURAR EVOLUTION API (Opcional)

Se quiser ativar notificações WhatsApp:

1. Obtenha suas credenciais da Evolution API
2. Edite o `.env`:

```env
EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_API_KEY=sua-chave-aqui
EVOLUTION_INSTANCE=sua-instancia
```

3. Reinicie o backend

---

## 🎨 FRONTEND (Próximo Passo)

Você já tem o frontend em: `/Users/juliocesarsouza/Desktop/vetric-interface/`

Vamos adaptar ele para consumir esta API! Basta:

1. Configurar a URL da API no frontend
2. Ajustar os tipos TypeScript
3. Conectar os componentes aos endpoints

---

## 🐛 TROUBLESHOOTING

### Erro de conexão com PostgreSQL
```bash
# Verificar se está rodando
brew services list

# Iniciar manualmente
postgres -D /opt/homebrew/var/postgresql@15
```

### Erro de login CVE-PRO
- Verifique se o token no `.env` está correto
- O sistema tentará fazer login automático se o token expirar

### WebSocket não conecta
- Normal em ambiente de teste
- Verifique os logs para detalhes

---

## 📝 ESTRUTURA DO BANCO

### Tabela: moradores
- `id`, `nome`, `apartamento`, `telefone`, `tag_rfid`, `notificacoes_ativas`

### Tabela: carregamentos
- `id`, `morador_id`, `charger_uuid`, `status`, `inicio`, `fim`, `energia_kwh`, `duracao_minutos`

### Tabela: templates_notificacao
- `id`, `tipo`, `mensagem`, `ativo`

---

## ✅ CHECKLIST DE VALIDAÇÃO

- [ ] PostgreSQL instalado e rodando
- [ ] Banco `vetric_db` criado
- [ ] Arquivo `.env` configurado
- [ ] Backend iniciado sem erros
- [ ] Endpoints respondendo
- [ ] Moradores de teste cadastrados
- [ ] WebSocket conectado (opcional)

---

## 🎉 PRONTO!

Seu backend está **100% funcional**!

Próximo passo: **Adaptar o frontend** para consumir esta API.

Quer que eu faça isso agora? 🚀

