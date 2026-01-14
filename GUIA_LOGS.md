# 📊 VETRIC - Guia Completo de Logs

**Data:** 14 de Janeiro de 2026  
**Versão:** 1.0  
**Objetivo:** Como acessar e analisar logs do sistema VETRIC

---

## 📋 ÍNDICE

1. [Logs do Backend (Node.js)](#logs-do-backend-nodejs)
2. [Logs do Frontend (React)](#logs-do-frontend-react)
3. [Logs do Banco de Dados (PostgreSQL)](#logs-do-banco-de-dados-postgresql)
4. [Logs do Nginx](#logs-do-nginx)
5. [Logs do Sistema (Ubuntu)](#logs-do-sistema-ubuntu)
6. [Logs do PM2](#logs-do-pm2)
7. [Ferramentas Úteis](#ferramentas-úteis)
8. [Monitoramento em Tempo Real](#monitoramento-em-tempo-real)
9. [Troubleshooting Comum](#troubleshooting-comum)

---

## 🖥️ LOGS DO BACKEND (NODE.JS)

### **📍 Ambiente Local (Desenvolvimento)**

#### **1. Console do Terminal**

Quando você roda o backend com `npm run dev`, os logs aparecem diretamente no terminal:

```bash
cd /Users/juliocesarsouza/Desktop/VETRIC\ -\ CVE/vetric-dashboard/backend
npm run dev

# Você verá logs como:
[2026-01-14T10:30:00.000Z] GET /api/dashboard/stats
🔑 Fazendo login na API CVE-PRO...
✅ Login CVE-PRO realizado com sucesso!
📊 [Polling] 3 transação(ões) ativa(s) no CVE
✅ [Polling] Morador identificado: Alex Purger Richa (804-A)
```

**Como usar:**
- ✅ Ver logs em tempo real
- ✅ Ctrl+C para parar
- ✅ Scroll para cima para ver histórico
- ⚠️ Logs somem quando fecha o terminal

---

#### **2. Arquivo de Log (Desenvolvimento)**

O sistema pode gerar arquivos de log se configurado:

```bash
# Ver logs gerados
ls -la logs/

# Arquivos possíveis:
combined.log    # Todos os logs
error.log       # Apenas erros
access.log      # Requisições HTTP
```

**Ler logs:**

```bash
# Ver últimas linhas
tail -f logs/combined.log

# Ver últimas 100 linhas
tail -100 logs/combined.log

# Buscar por termo
grep "erro" logs/combined.log

# Buscar por erro em todos os arquivos
grep -r "erro" logs/
```

---

### **📍 Ambiente Produção (VPS com PM2)**

#### **1. PM2 Logs (PRINCIPAL)**

PM2 salva automaticamente todos os logs do backend.

**Localização:**
```
/home/deploy/.pm2/logs/
├── vetric-api-out.log       # Logs normais (stdout)
├── vetric-api-error.log     # Logs de erro (stderr)
└── vetric-api-*.log         # Logs antigos (rotacionados)
```

**Comandos PM2:**

```bash
# Ver logs em tempo real (todos)
pm2 logs vetric-api

# Ver apenas últimas 50 linhas
pm2 logs vetric-api --lines 50

# Ver apenas últimas 200 linhas
pm2 logs vetric-api --lines 200

# Ver apenas erros
pm2 logs vetric-api --err

# Ver apenas logs normais
pm2 logs vetric-api --out

# Ver logs com timestamp
pm2 logs vetric-api --timestamp

# Ver logs formatados em JSON
pm2 logs vetric-api --json

# Limpar logs antigos
pm2 flush vetric-api
```

**Exemplos práticos:**

```bash
# Monitorar logs enquanto testa
pm2 logs vetric-api --lines 0

# Ver últimas 100 linhas de erro
pm2 logs vetric-api --err --lines 100

# Salvar logs em arquivo
pm2 logs vetric-api --lines 1000 > logs-backup-$(date +%Y%m%d).txt
```

---

#### **2. Ler Arquivos de Log Diretamente**

```bash
# Ver log normal (stdout)
tail -f /home/deploy/.pm2/logs/vetric-api-out.log

# Ver log de erro (stderr)
tail -f /home/deploy/.pm2/logs/vetric-api-error.log

# Ver últimas 100 linhas
tail -100 /home/deploy/.pm2/logs/vetric-api-out.log

# Buscar termo específico
grep "CVE-PRO" /home/deploy/.pm2/logs/vetric-api-out.log

# Buscar e contar ocorrências
grep -c "erro" /home/deploy/.pm2/logs/vetric-api-error.log

# Ver logs entre datas específicas
awk '/2026-01-14T10:00/,/2026-01-14T11:00/' /home/deploy/.pm2/logs/vetric-api-out.log
```

---

#### **3. Rotação de Logs PM2**

Instalar módulo de rotação:

```bash
# Instalar pm2-logrotate
pm2 install pm2-logrotate

# Configurar rotação
pm2 set pm2-logrotate:max_size 10M        # Tamanho máximo 10MB
pm2 set pm2-logrotate:retain 30           # Manter 30 arquivos
pm2 set pm2-logrotate:compress true       # Comprimir logs antigos
pm2 set pm2-logrotate:dateFormat YYYY-MM-DD_HH-mm-ss
pm2 set pm2-logrotate:workerInterval 30   # Verificar a cada 30s

# Ver configuração
pm2 conf pm2-logrotate
```

---

### **📊 Tipos de Logs do Backend**

#### **Logs de Sucesso (stdout)**

```bash
🔑 Fazendo login na API CVE-PRO...
✅ Login CVE-PRO realizado com sucesso!
✅ Token obtido: eyJhbGciOiJIUzI1NiIsInR5c...
📊 [Polling] 3 transação(ões) ativa(s) no CVE
✅ [Polling] Morador identificado: Alex Purger Richa (804-A)
✅ [Polling] Novo carregamento registrado: ID 123
📱 [Polling] Notificação de início enviada para João Silva
🏁 [Polling] Carregamento 123 finalizado
🔍 [Polling] Verificando status de todos os carregadores...
✅ [CVE] 15 carregadores encontrados
```

#### **Logs de Aviso (stdout)**

```bash
⚠️  [Polling] Tag RFID 04B5E07A466985 não cadastrada
⚠️  [Polling] Carregador Gran Marine 1 ativo mas sem idTag identificável
⚠️  Busca de carregadores falhou (tentativa 1/3)
🔄 Tentando novamente em 5s...
⚠️  [CVE] Falha de comunicação - Tentando novamente
```

#### **Logs de Erro (stderr)**

```bash
❌ [CVE] Erro ao buscar carregadores: Network timeout
❌ [Polling] Erro ao buscar transações: Request failed with status code 401
❌ [Polling] Erro ao processar transação: Cannot read property 'id' of null
❌ [Database] Erro ao salvar carregamento: Duplicate entry
❌ Erro não tratado: TypeError: Cannot read property 'token' of undefined
```

---

### **🔍 Buscar Problemas Específicos**

```bash
# Erros de autenticação
grep -i "401\|unauthorized\|authentication failed" /home/deploy/.pm2/logs/vetric-api-error.log

# Erros de rede
grep -i "network\|timeout\|ECONNREFUSED" /home/deploy/.pm2/logs/vetric-api-error.log

# Erros de banco de dados
grep -i "database\|postgresql\|sequelize" /home/deploy/.pm2/logs/vetric-api-error.log

# Carregamentos criados
grep "Novo carregamento registrado" /home/deploy/.pm2/logs/vetric-api-out.log

# Notificações enviadas
grep "Notificação" /home/deploy/.pm2/logs/vetric-api-out.log

# Tokens renovados
grep "Token obtido" /home/deploy/.pm2/logs/vetric-api-out.log
```

---

## 🎨 LOGS DO FRONTEND (REACT)

### **📍 Ambiente Local (Desenvolvimento)**

#### **1. Console do Navegador (DevTools)**

**Como acessar:**

```
Chrome/Edge: F12 ou Ctrl+Shift+I
Firefox: F12 ou Ctrl+Shift+K
Safari: Cmd+Option+I
```

**Aba Console:**

```javascript
// Logs da aplicação
[API] GET /api/dashboard/stats
[API] Response received: {...}
Login successful: admin@vetric.com.br
Carregadores carregados: 15
Erro ao buscar moradores: Network Error
```

**Filtros úteis:**

- ✅ **All** - Todos os logs
- ℹ️ **Info** - Informações
- ⚠️ **Warnings** - Avisos
- ❌ **Errors** - Erros
- 🐛 **Verbose** - Detalhado

**Comandos no console:**

```javascript
// Ver localStorage (tokens)
console.log(localStorage.getItem('@vetric:token'));
console.log(localStorage.getItem('@vetric:user'));

// Limpar localStorage
localStorage.clear();

// Ver todas as variáveis
console.log(localStorage);

// Forçar reload sem cache
location.reload(true);
```

---

#### **2. Network Tab (Requisições HTTP)**

**Como usar:**

1. Abrir DevTools (F12)
2. Ir em aba **Network**
3. Recarregar página (F5)
4. Ver todas as requisições

**Filtrar requisições:**

- **XHR/Fetch** - Requisições API
- **Doc** - Documentos HTML
- **CSS** - Arquivos CSS
- **JS** - Arquivos JavaScript
- **Img** - Imagens

**Ver detalhes de uma requisição:**

```
Click na requisição → Tabs:
├── Headers   (Cabeçalhos HTTP)
│   ├── Request Headers (enviados)
│   │   ├── Authorization: Bearer eyJ...
│   │   └── Content-Type: application/json
│   └── Response Headers (recebidos)
│       ├── Content-Type: application/json
│       └── X-RateLimit-Remaining: 95
│
├── Payload   (Dados enviados)
│   └── {"email": "admin@vetric.com.br", ...}
│
├── Preview   (Resposta formatada)
│   └── { "success": true, "data": {...} }
│
└── Response  (Resposta crua)
    └── Raw JSON/HTML
```

**Copiar requisição como cURL:**

```
Right-click na requisição → Copy → Copy as cURL
```

Resultado:
```bash
curl 'http://localhost:3001/api/dashboard/stats' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json'
```

---

#### **3. Application Tab (Storage)**

Ver dados salvos no navegador:

```
DevTools → Application → Storage:
├── Local Storage
│   ├── @vetric:token    (JWT)
│   └── @vetric:user     (JSON user)
│
├── Session Storage
├── Cookies
└── IndexedDB
```

---

### **📍 Ambiente Produção**

#### **1. Logs do Vite (Build)**

```bash
# Durante build
cd /Users/juliocesarsouza/Desktop/vetric-interface
npm run build

# Logs:
vite v5.4.19 building for production...
✓ 245 modules transformed.
dist/index.html                   0.50 kB
dist/assets/index-D7hF9kLm.css   45.23 kB │ gzip: 8.12 kB
dist/assets/index-BwXc2Fmr.js   423.67 kB │ gzip: 142.45 kB
✓ built in 8.32s
```

#### **2. Logs do Navegador (Produção)**

Mesmo processo do desenvolvimento, mas:

- ⚠️ **Código minificado** (mais difícil de debugar)
- ⚠️ **Source maps** (se habilitados, facilitam debug)
- ✅ **Console continua funcionando**

**Habilitar source maps:**

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    sourcemap: true  // Gera .map files
  }
});
```

---

## 🗄️ LOGS DO BANCO DE DADOS (POSTGRESQL)

### **📍 Localização dos Logs**

```bash
# Ubuntu/Debian
/var/log/postgresql/postgresql-14-main.log

# Ver versão do PostgreSQL
psql --version

# Se versão 15:
/var/log/postgresql/postgresql-15-main.log
```

---

### **🔍 Ver Logs do PostgreSQL**

```bash
# Ver logs em tempo real
sudo tail -f /var/log/postgresql/postgresql-14-main.log

# Últimas 100 linhas
sudo tail -100 /var/log/postgresql/postgresql-14-main.log

# Buscar erros
sudo grep ERROR /var/log/postgresql/postgresql-14-main.log

# Buscar slow queries
sudo grep "duration:" /var/log/postgresql/postgresql-14-main.log | grep -v "duration: 0"

# Erros de conexão
sudo grep "connection" /var/log/postgresql/postgresql-14-main.log
```

---

### **📊 Tipos de Logs PostgreSQL**

```sql
-- Erros de conexão
FATAL:  password authentication failed for user "vetric_user"
FATAL:  database "vetric_db" does not exist

-- Erros de query
ERROR:  relation "usuarios" does not exist
ERROR:  syntax error at or near "SELCT"
ERROR:  duplicate key value violates unique constraint "usuarios_email_key"

-- Avisos
WARNING:  there is no transaction in progress

-- Queries lentas
LOG:  duration: 1523.456 ms  statement: SELECT * FROM carregamentos...
```

---

### **⚙️ Habilitar Logs Detalhados**

Editar configuração:

```bash
sudo nano /etc/postgresql/14/main/postgresql.conf
```

Configurações úteis:

```conf
# Nível de log
log_min_messages = info              # debug5, debug4, ..., info, warning, error
log_min_error_statement = error      # Log queries que causam erro

# Log de queries
log_statement = 'all'                # none, ddl, mod, all
log_duration = on                    # Log duração de queries
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '

# Slow queries
log_min_duration_statement = 1000    # Log queries > 1s (1000ms)

# Conexões
log_connections = on
log_disconnections = on
```

Reiniciar PostgreSQL:

```bash
sudo systemctl restart postgresql
```

---

## 🌐 LOGS DO NGINX

### **📍 Localização**

```bash
# Access logs (todas as requisições)
/var/log/nginx/access.log
/var/log/nginx/vetric-api-access.log

# Error logs (erros)
/var/log/nginx/error.log
/var/log/nginx/vetric-api-error.log
```

---

### **🔍 Ver Logs do Nginx**

```bash
# Access log em tempo real
sudo tail -f /var/log/nginx/vetric-api-access.log

# Error log em tempo real
sudo tail -f /var/log/nginx/vetric-api-error.log

# Últimas 100 requisições
sudo tail -100 /var/log/nginx/access.log

# Requisições com erro 404
sudo grep "404" /var/log/nginx/access.log

# Requisições com erro 500
sudo grep "500" /var/log/nginx/error.log

# Contar requisições por código de status
sudo awk '{print $9}' /var/log/nginx/access.log | sort | uniq -c | sort -rn

# Top 10 IPs mais ativos
sudo awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head -10

# Requisições por hora
sudo awk '{print $4}' /var/log/nginx/access.log | cut -d: -f1-2 | sort | uniq -c
```

---

### **📊 Formato dos Logs**

**Access Log:**

```
192.168.1.100 - - [14/Jan/2026:10:30:15 -0300] "GET /api/dashboard/stats HTTP/1.1" 200 1234 "-" "Mozilla/5.0..."
│             │   │                          │   │                              │   │    │
│             │   │                          │   │                              │   │    └─ Response size
│             │   │                          │   │                              │   └─ Status code
│             │   │                          │   │                              └─ Método + Rota
│             │   │                          │   └─ Timestamp
│             │   │                          └─ Username (se autenticado)
│             │   └─ Outro campo
│             └─ User ID (se disponível)
└─ IP do cliente
```

**Error Log:**

```
2026/01/14 10:30:15 [error] 1234#1234: *5 connect() failed (111: Connection refused) while connecting to upstream
│                    │      │           │
│                    │      │           └─ Mensagem de erro
│                    │      └─ Connection ID
│                    └─ Process ID
└─ Timestamp
```

---

## 🖥️ LOGS DO SISTEMA (UBUNTU)

### **📍 Journal (systemd)**

```bash
# Ver logs do sistema
sudo journalctl

# Últimas 100 linhas
sudo journalctl -n 100

# Em tempo real
sudo journalctl -f

# Desde último boot
sudo journalctl -b

# Boot anterior
sudo journalctl -b -1

# Apenas erros
sudo journalctl -p err

# Apenas críticos
sudo journalctl -p crit

# Por serviço
sudo journalctl -u nginx
sudo journalctl -u postgresql

# Por período
sudo journalctl --since "2026-01-14 10:00:00"
sudo journalctl --since "1 hour ago"
sudo journalctl --since "yesterday"
sudo journalctl --until "2026-01-14 11:00:00"

# Intervalo
sudo journalctl --since "10:00" --until "11:00"

# Salvar em arquivo
sudo journalctl > system-logs-$(date +%Y%m%d).txt
```

---

### **📍 Syslog**

```bash
# Ver syslog
sudo tail -f /var/log/syslog

# Últimas 100 linhas
sudo tail -100 /var/log/syslog

# Buscar termo
sudo grep "error" /var/log/syslog
```

---

### **📍 Auth Log (Tentativas de login SSH)**

```bash
# Ver tentativas de login
sudo tail -f /var/log/auth.log

# Logins bem-sucedidos
sudo grep "Accepted" /var/log/auth.log

# Logins falhados
sudo grep "Failed" /var/log/auth.log

# Tentativas de força bruta
sudo grep "Failed password" /var/log/auth.log | awk '{print $(NF-3)}' | sort | uniq -c | sort -rn
```

---

## 📦 LOGS DO PM2

### **🔍 Comandos PM2**

```bash
# Logs em tempo real
pm2 logs

# Logs de app específico
pm2 logs vetric-api

# Últimas 50 linhas
pm2 logs --lines 50

# Apenas erros
pm2 logs --err

# Limpar logs
pm2 flush

# Recarregar logs
pm2 reloadLogs
```

---

### **📊 Informações do PM2**

```bash
# Status de processos
pm2 status

# Detalhes de app
pm2 show vetric-api

# Monitoramento (CPU, memória)
pm2 monit

# Lista de processos
pm2 list

# Histórico de restarts
pm2 describe vetric-api | grep "restarts"
```

---

## 🛠️ FERRAMENTAS ÚTEIS

### **1. Multitail (Ver múltiplos logs simultaneamente)**

```bash
# Instalar
sudo apt install multitail

# Ver backend + nginx + postgresql
sudo multitail \
  /home/deploy/.pm2/logs/vetric-api-out.log \
  /var/log/nginx/vetric-api-access.log \
  /var/log/postgresql/postgresql-14-main.log
```

---

### **2. lnav (Log Navigator)**

```bash
# Instalar
sudo apt install lnav

# Usar
lnav /home/deploy/.pm2/logs/vetric-api-out.log

# Comandos dentro do lnav:
# / - Buscar
# n - Próximo resultado
# N - Resultado anterior
# q - Sair
```

---

### **3. grep Avançado**

```bash
# Buscar em múltiplos arquivos
grep -r "erro" /var/log/

# Ignorar case
grep -i "error" arquivo.log

# Mostrar N linhas depois do match
grep -A 5 "erro" arquivo.log

# Mostrar N linhas antes do match
grep -B 5 "erro" arquivo.log

# Mostrar N linhas antes e depois
grep -C 5 "erro" arquivo.log

# Inverter match (mostrar linhas que NÃO contém)
grep -v "info" arquivo.log

# Contar ocorrências
grep -c "erro" arquivo.log

# Mostrar apenas nomes de arquivos
grep -l "erro" /var/log/*.log

# Colorir output
grep --color=auto "erro" arquivo.log
```

---

### **4. awk (Processar logs)**

```bash
# Imprimir coluna específica
awk '{print $1}' access.log

# Filtrar por condição
awk '$9 == 500' access.log

# Contar requisições por status
awk '{print $9}' access.log | sort | uniq -c

# Requisições entre horários
awk '/10:00:00/,/11:00:00/' access.log
```

---

### **5. jq (Processar logs JSON)**

```bash
# Instalar
sudo apt install jq

# Se logs forem JSON
cat arquivo.json | jq '.'

# Filtrar campo
cat arquivo.json | jq '.error'

# Filtrar por condição
cat arquivo.json | jq 'select(.level == "error")'
```

---

## 📊 MONITORAMENTO EM TEMPO REAL

### **1. Dashboard PM2**

```bash
# Monitoramento interativo
pm2 monit

# Mostra:
# - CPU usage
# - Memory usage
# - Logs em tempo real
# - Processos ativos
```

---

### **2. htop (Sistema)**

```bash
# Instalar
sudo apt install htop

# Executar
htop

# Buscar processo Node.js:
# F3 → digite "node" → Enter
```

---

### **3. Watch (Atualizar comando periodicamente)**

```bash
# Executar comando a cada 2 segundos
watch -n 2 'pm2 status'

# Ver espaço em disco
watch -n 5 'df -h'

# Ver conexões ativas
watch -n 2 'netstat -an | grep :3001 | wc -l'
```

---

## 🚨 TROUBLESHOOTING COMUM

### **Problema 1: Backend não inicia**

```bash
# Ver logs de erro PM2
pm2 logs vetric-api --err

# Ver últimas 50 linhas
pm2 logs vetric-api --lines 50 --err

# Verificar se porta está em uso
sudo netstat -tlnp | grep :3001

# Verificar variáveis de ambiente
pm2 show vetric-api | grep "env"
```

---

### **Problema 2: Erros de autenticação CVE-PRO**

```bash
# Buscar erros de token
pm2 logs vetric-api | grep -i "token\|401\|unauthorized"

# Ver logs de login CVE
pm2 logs vetric-api | grep "Fazendo login\|Login CVE"

# Verificar .env
cat /home/deploy/vetric-dashboard/backend/.env | grep CVE_
```

---

### **Problema 3: Banco de dados não conecta**

```bash
# Ver logs PostgreSQL
sudo tail -50 /var/log/postgresql/postgresql-14-main.log

# Verificar se está rodando
sudo systemctl status postgresql

# Testar conexão
psql -U vetric_user -d vetric_db -h localhost

# Ver logs de erro de conexão no backend
pm2 logs vetric-api | grep -i "database\|sequelize\|connection"
```

---

### **Problema 4: Nginx retorna 502**

```bash
# Ver error log do Nginx
sudo tail -50 /var/log/nginx/vetric-api-error.log

# Verificar se backend está rodando
pm2 status vetric-api

# Verificar se porta está aberta
sudo netstat -tlnp | grep :3001

# Testar diretamente o backend
curl http://localhost:3001/health
```

---

### **Problema 5: Logs muito grandes**

```bash
# Ver tamanho dos logs
du -h /home/deploy/.pm2/logs/

# Limpar logs antigos PM2
pm2 flush

# Rotacionar logs manualmente
pm2 reloadLogs

# Configurar rotação automática (já mostrado acima)
pm2 install pm2-logrotate
```

---

## 📝 RESUMO DOS COMANDOS

### **Quick Reference:**

```bash
# ============================================
# BACKEND (PM2)
# ============================================
pm2 logs vetric-api                    # Logs em tempo real
pm2 logs vetric-api --lines 100        # Últimas 100 linhas
pm2 logs vetric-api --err              # Apenas erros
pm2 flush vetric-api                   # Limpar logs

# ============================================
# FRONTEND (Browser)
# ============================================
F12                                    # Abrir DevTools
Console → Ver logs JS
Network → Ver requisições HTTP
Application → Ver localStorage

# ============================================
# POSTGRESQL
# ============================================
sudo tail -f /var/log/postgresql/postgresql-14-main.log
sudo grep ERROR /var/log/postgresql/postgresql-14-main.log

# ============================================
# NGINX
# ============================================
sudo tail -f /var/log/nginx/vetric-api-access.log
sudo tail -f /var/log/nginx/vetric-api-error.log
sudo grep "500" /var/log/nginx/error.log

# ============================================
# SISTEMA
# ============================================
sudo journalctl -f                     # Journal em tempo real
sudo journalctl -u nginx               # Logs do Nginx
sudo journalctl -u postgresql          # Logs do PostgreSQL
sudo tail -f /var/log/syslog           # Syslog

# ============================================
# PM2 INFO
# ============================================
pm2 status                             # Status de processos
pm2 monit                              # Monitoramento interativo
pm2 show vetric-api                    # Detalhes do app
```

---

## 🎯 CHECKLIST DE LOGS

### **Para DEBUG de problema:**

- [ ] **1. Ver logs do backend (PM2)**
  ```bash
  pm2 logs vetric-api --lines 100
  ```

- [ ] **2. Ver logs de erro específico**
  ```bash
  pm2 logs vetric-api --err
  ```

- [ ] **3. Ver logs do Nginx (se em produção)**
  ```bash
  sudo tail -f /var/log/nginx/vetric-api-error.log
  ```

- [ ] **4. Ver logs do PostgreSQL (se erro de banco)**
  ```bash
  sudo tail -50 /var/log/postgresql/postgresql-14-main.log
  ```

- [ ] **5. Ver console do navegador (se erro no frontend)**
  ```
  F12 → Console → Ver erros
  ```

- [ ] **6. Ver Network tab (se erro de API)**
  ```
  F12 → Network → Ver requisições falhadas
  ```

- [ ] **7. Verificar status dos serviços**
  ```bash
  pm2 status
  sudo systemctl status nginx
  sudo systemctl status postgresql
  ```

---

## 🎉 CONCLUSÃO

Agora você sabe como acessar **TODOS os logs do sistema VETRIC**:

- ✅ **Backend** (PM2, console)
- ✅ **Frontend** (DevTools)
- ✅ **Banco de dados** (PostgreSQL)
- ✅ **Nginx** (access, error)
- ✅ **Sistema** (journalctl, syslog)

**Dica:** Sempre comece pelos logs do PM2, pois contêm a maioria das informações importantes!

---

**Data:** 14 de Janeiro de 2026  
**Versão:** 1.0  
**Documento:** Guia Completo de Logs VETRIC

