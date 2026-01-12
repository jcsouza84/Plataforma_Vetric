# 🚀 VETRIC - Migração para Produção

## 📋 CHECKLIST COMPLETO

### ANTES DE COMEÇAR

- [ ] Credenciais de produção obtidas
- [ ] Servidor de produção configurado
- [ ] PostgreSQL instalado no servidor
- [ ] Node.js v18+ instalado
- [ ] PM2 instalado globalmente (`npm install -g pm2`)
- [ ] Backup do ambiente de teste criado

---

## 🔧 PASSO 1: Preparar Credenciais

### Informações Necessárias

```bash
# API CVE-PRO (PRODUÇÃO)
CVE_BASE_URL=https://cs.intelbras-cve-pro.com.br
CVE_API_KEY=<sua-chave-de-producao>
CVE_USERNAME=<seu-usuario>
CVE_PASSWORD=<sua-senha>

# Banco de Dados
DB_HOST=localhost (ou IP do servidor PostgreSQL)
DB_PORT=5432
DB_NAME=vetric_db_prod
DB_USER=postgres
DB_PASSWORD=<senha-segura>

# Evolution API (WhatsApp)
EVOLUTION_API_URL=<sua-url>
EVOLUTION_API_KEY=<sua-chave>
EVOLUTION_INSTANCE=<sua-instancia>
```

---

## 🚀 PASSO 2: Executar Migração Automática

### Opção A: Script Automático (Recomendado)

```bash
cd vetric-dashboard
./migrate-to-prod.sh
```

O script irá:
1. ✅ Solicitar credenciais de produção
2. ✅ Criar arquivo `.env.production`
3. ✅ Criar banco de dados `vetric_db_prod`
4. ✅ Fazer backup do ambiente de teste (opcional)

### Opção B: Manual

```bash
# 1. Criar banco de produção
createdb vetric_db_prod

# 2. Copiar e editar .env
cd backend
cp ../ENV_EXAMPLE.txt .env.production

# 3. Editar com credenciais de produção
nano .env.production

# Trocar:
# - CVE_BASE_URL para produção
# - CVE_API_KEY para chave real
# - CVE_USERNAME e CVE_PASSWORD reais
# - Dados do banco de produção
```

---

## 🧪 PASSO 3: Testar Localmente com Credenciais de Produção

```bash
cd backend

# Usar .env.production
cp .env.production .env

# Testar inicialização
npm run dev
```

### Validações Importantes

1. **Login CVE-PRO:**
   - ✅ Token obtido com sucesso
   - ✅ Sem erro de reCAPTCHA
   - ❌ Se houver reCAPTCHA, você precisará fazer login manual

2. **WebSocket:**
   - ✅ Conectado com sucesso
   - ✅ Sem erros de autenticação

3. **Banco de Dados:**
   - ✅ Tabelas criadas
   - ✅ Templates inseridos

4. **Carregadores:**
   ```bash
   curl http://localhost:3001/api/dashboard/chargers
   ```
   - ✅ Lista de carregadores REAIS retornada

---

## 🏗️ PASSO 4: Deploy em Servidor de Produção

### 4.1. Transferir Código

```bash
# No seu computador
cd /Users/juliocesarsouza/Desktop/VETRIC\ -\ CVE
tar -czf vetric-dashboard.tar.gz vetric-dashboard/

# Transferir para servidor
scp vetric-dashboard.tar.gz usuario@seu-servidor:/home/usuario/
```

### 4.2. No Servidor

```bash
# Descompactar
tar -xzf vetric-dashboard.tar.gz
cd vetric-dashboard

# Configurar PostgreSQL
sudo -u postgres createdb vetric_db_prod

# Configurar .env
cd backend
nano .env
# Cole as credenciais de produção

# Instalar dependências
npm install

# Build de produção
npm run build

# Testar
npm run start
```

---

## 🔄 PASSO 5: Configurar PM2 (Process Manager)

```bash
cd backend

# Iniciar com PM2
pm2 start dist/index.js --name vetric-dashboard

# Salvar configuração
pm2 save

# Configurar para iniciar no boot
pm2 startup

# Monitorar
pm2 status
pm2 logs vetric-dashboard
```

### Comandos Úteis PM2

```bash
# Ver logs em tempo real
pm2 logs vetric-dashboard --lines 100

# Reiniciar
pm2 restart vetric-dashboard

# Parar
pm2 stop vetric-dashboard

# Ver métricas
pm2 monit

# Ver informações
pm2 show vetric-dashboard
```

---

## 🔒 PASSO 6: Segurança

### 6.1. Firewall

```bash
# Permitir apenas porta 3001 (ou sua porta)
sudo ufw allow 3001/tcp

# Se usar Nginx como proxy reverso
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### 6.2. Nginx (Opcional - Proxy Reverso)

Criar arquivo `/etc/nginx/sites-available/vetric`:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Ativar
sudo ln -s /etc/nginx/sites-available/vetric /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL com Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com
```

---

## 📊 PASSO 7: Monitoramento

### 7.1. Health Check

```bash
# Criar script de monitoramento
nano /home/usuario/check-vetric.sh
```

```bash
#!/bin/bash

HEALTH_URL="http://localhost:3001/health"

if ! curl -f -s "$HEALTH_URL" > /dev/null; then
    echo "VETRIC está offline! Reiniciando..."
    pm2 restart vetric-dashboard
    
    # Enviar alerta (opcional)
    # curl -X POST "sua-api-de-alertas" -d "VETRIC Dashboard está offline!"
fi
```

```bash
chmod +x /home/usuario/check-vetric.sh

# Adicionar ao crontab (verifica a cada 5 minutos)
crontab -e
*/5 * * * * /home/usuario/check-vetric.sh
```

### 7.2. Logs

```bash
# Ver logs do PM2
pm2 logs vetric-dashboard

# Logs do sistema
tail -f backend/logs/app.log
```

---

## 🎯 PASSO 8: Cadastrar Moradores Reais

### Via API

```bash
curl -X POST http://seu-servidor:3001/api/moradores \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Nome Completo",
    "apartamento": "101",
    "telefone": "48999999999",
    "tag_rfid": "TAG_RFID_REAL",
    "notificacoes_ativas": true
  }'
```

### Via Script

Crie arquivo `importar-moradores.json`:

```json
[
  {
    "nome": "Morador 1",
    "apartamento": "101",
    "telefone": "48999999999",
    "tag_rfid": "TAG001",
    "notificacoes_ativas": true
  },
  {
    "nome": "Morador 2",
    "apartamento": "102",
    "telefone": "48988888888",
    "tag_rfid": "TAG002",
    "notificacoes_ativas": true
  }
]
```

Execute:

```bash
node scripts/importar-moradores.js importar-moradores.json
```

---

## ✅ PASSO 9: Validação Final

### Checklist de Produção

- [ ] **Servidor rodando sem erros**
  ```bash
  pm2 status
  curl http://localhost:3001/health
  ```

- [ ] **Login CVE-PRO funcionando**
  ```bash
  # Verificar logs
  pm2 logs vetric-dashboard | grep "Login realizado"
  ```

- [ ] **WebSocket conectado**
  ```bash
  # Verificar logs
  pm2 logs vetric-dashboard | grep "WebSocket conectado"
  ```

- [ ] **Carregadores listados**
  ```bash
  curl http://localhost:3001/api/dashboard/chargers | jq
  ```

- [ ] **Banco de dados funcionando**
  ```bash
  curl http://localhost:3001/api/moradores
  ```

- [ ] **Notificações configuradas**
  - Evolution API conectada
  - Templates ativos
  - Teste de envio OK

- [ ] **Monitoramento ativo**
  - PM2 salvou configuração
  - Startup configurado
  - Health check no cron

---

## 🐛 TROUBLESHOOTING

### Erro: "Cannot connect to database"

```bash
# Verificar PostgreSQL
sudo systemctl status postgresql

# Testar conexão
psql -h localhost -U postgres -d vetric_db_prod
```

### Erro: "CVE-PRO API authentication failed"

- Verificar credenciais no `.env`
- Confirmar que está usando URL de produção
- Verificar se API Key é válida

### Erro: "WebSocket connection failed"

- Normal se servidor CVE-PRO não aceitar conexões externas
- Verificar firewall do servidor
- Confirmar token válido

### Erro: "Port 3001 already in use"

```bash
# Verificar o que está usando a porta
lsof -i :3001

# Matar processo
kill -9 <PID>

# Ou usar porta diferente no .env
PORT=3002
```

---

## 📱 CONFIGURAR EVOLUTION API

### 1. Obter Credenciais

- URL da API
- API Key
- Nome da instância

### 2. Configurar no .env

```env
EVOLUTION_API_URL=https://sua-evolution.com
EVOLUTION_API_KEY=sua-chave-aqui
EVOLUTION_INSTANCE=sua-instancia
```

### 3. Testar Envio

```bash
curl -X POST http://localhost:3001/api/test-whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "telefone": "48999999999",
    "mensagem": "Teste de notificação VETRIC"
  }'
```

---

## 🔄 ROLLBACK (Se necessário)

```bash
# Parar servidor de produção
pm2 stop vetric-dashboard

# Voltar para ambiente de teste
cd backend
cp .env.test .env

# Reiniciar
pm2 restart vetric-dashboard
```

---

## 📊 MÉTRICAS DE SUCESSO

Após 24h em produção, verificar:

- ✅ **Uptime:** > 99%
- ✅ **Carregamentos detectados:** Todos
- ✅ **Notificações enviadas:** > 95%
- ✅ **Erros de API:** < 1%
- ✅ **Tempo de resposta:** < 500ms

---

## 🎉 CONCLUSÃO

Após seguir todos os passos:

✅ Sistema em produção
✅ Monitoramento ativo
✅ Backup configurado
✅ Notificações funcionando
✅ Logs sendo coletados

**Sistema PRONTO PARA USO REAL! 🚀**

---

**Dúvidas?** Consulte os logs ou documentação adicional.

