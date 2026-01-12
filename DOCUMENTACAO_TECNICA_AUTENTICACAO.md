# 🔐 VETRIC - Documentação Técnica de Autenticação

## 📋 Visão Geral

O sistema VETRIC possui **DUAS camadas de autenticação** independentes:

1. **Autenticação VETRIC** (Login de usuários no dashboard)
2. **Autenticação CVE-Pro API** (Integração com Intelbras)

---

## 🎯 1. AUTENTICAÇÃO VETRIC (Sistema Interno)

### Tecnologias
- **JWT (JSON Web Tokens)** - Expiração 24h
- **bcrypt** - Hash de senhas (salt 10)
- **PostgreSQL** - Armazenamento de usuários

### Fluxo de Autenticação

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  Frontend   │         │   Backend   │         │  PostgreSQL │
│   (React)   │         │  (Node.js)  │         │             │
└──────┬──────┘         └──────┬──────┘         └──────┬──────┘
       │                       │                        │
       │ POST /api/auth/login  │                        │
       │ {email, senha}        │                        │
       ├──────────────────────>│                        │
       │                       │                        │
       │                       │ SELECT * FROM usuarios │
       │                       │ WHERE email = ?        │
       │                       ├───────────────────────>│
       │                       │                        │
       │                       │<───────────────────────┤
       │                       │   Usuario encontrado   │
       │                       │                        │
       │                       │ bcrypt.compare()       │
       │                       │ (verificar senha)      │
       │                       │                        │
       │                       │ jwt.sign(payload)      │
       │                       │ (gerar token)          │
       │                       │                        │
       │<──────────────────────┤                        │
       │ {success: true,       │                        │
       │  token: "eyJhbG...",  │                        │
       │  usuario: {...}}      │                        │
       │                       │                        │
       │ Salvar no localStorage│                        │
       │ @vetric:token         │                        │
       │ @vetric:user          │                        │
       │                       │                        │
```

### Usuários Padrão

| Email | Senha | Role | Descrição |
|-------|-------|------|-----------|
| `admin@vetric.com.br` | `Vetric@2026` | ADMIN | Acesso total |
| `granmarine@vetric.com.br` | `GranMarine@2026` | CLIENTE | Acesso limitado |

### Endpoints

```typescript
// Login
POST /api/auth/login
Body: { email: string, senha: string }
Response: { success: boolean, token: string, usuario: User }

// Obter usuário atual
GET /api/auth/me
Headers: { Authorization: "Bearer <token>" }
Response: { success: boolean, data: User }

// Logout (apenas remove token no frontend)
POST /api/auth/logout
Headers: { Authorization: "Bearer <token>" }
Response: { success: boolean, message: string }
```

### Implementação Frontend

**1. AuthContext (`src/contexts/AuthContext.tsx`)**
```typescript
// Gerencia estado global de autenticação
const { user, token, isAuthenticated, login, logout } = useAuth();
```

**2. PrivateRoute (`src/components/PrivateRoute.tsx`)**
```typescript
// Protege rotas que exigem autenticação
<PrivateRoute allowedRoles={['ADMIN']}>
  <Usuarios />
</PrivateRoute>
```

**3. API Service (`src/services/api.ts`)**
```typescript
// ⚠️ CRÍTICO: Interceptor que adiciona token em TODAS as requisições
this.api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@vetric:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### ⚠️ BUGS COMUNS E SOLUÇÕES

#### ❌ Bug 1: Requisições sem token
**Sintoma:** Backend retorna 401 Unauthorized, rotas não carregam dados

**Causa:** `api.ts` cria instância separada do axios sem incluir o token

**Solução:**
```typescript
// Adicionar interceptor no construtor de VetricAPI
this.api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@vetric:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

#### ❌ Bug 2: Rotas não protegidas
**Sintoma:** Usuário não autenticado consegue acessar páginas protegidas

**Solução:**
```typescript
// Sempre envolver rotas em PrivateRoute
<Route path="/dashboard" element={
  <PrivateRoute>
    <Dashboard />
  </PrivateRoute>
} />
```

---

## 🔌 2. AUTENTICAÇÃO CVE-PRO API (Intelbras)

### ⚠️ **SEÇÃO CRÍTICA - LEIA COM ATENÇÃO**

A autenticação com a API CVE-Pro da Intelbras é **ESSENCIAL** para o funcionamento do sistema e **DEVE SER AUTOMÁTICA**.

### Tecnologias
- **API REST** - Intelbras CVE-Pro
- **JWT** - Token retornado pela API
- **axios** - Cliente HTTP

### Fluxo de Autenticação CVE-Pro

```
┌──────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Backend    │         │  CVE-Pro API     │         │   PostgreSQL    │
│  (Node.js)   │         │  (Intelbras)     │         │  (Cache token)  │
└──────┬───────┘         └────────┬─────────┘         └────────┬────────┘
       │                          │                            │
       │ Startup do servidor      │                            │
       │                          │                            │
       │ POST /api/v1/login       │                            │
       │ Headers:                 │                            │
       │   Api-Key: xxx           │                            │
       │ Body:                    │                            │
       │   {email, password}      │                            │
       ├─────────────────────────>│                            │
       │                          │                            │
       │                          │ Validar credenciais        │
       │                          │ Gerar JWT                  │
       │                          │                            │
       │<─────────────────────────┤                            │
       │ {token: "B4F74214..."}   │                            │
       │                          │                            │
       │ Salvar token em memória  │                            │
       │ (this.token)             │                            │
       │                          │                            │
       │ GET /api/v1/chargepoints │                            │
       │ Headers:                 │                            │
       │   Authorization:         │                            │
       │     Bearer <token>       │                            │
       ├─────────────────────────>│                            │
       │                          │                            │
       │<─────────────────────────┤                            │
       │ {chargePointList: [...]} │                            │
       │                          │                            │
```

### Variáveis de Ambiente (.env)

```bash
# CVE-Pro API - PRODUÇÃO
CVE_API_BASE_URL=https://cs.intelbras-cve-pro.com.br
CVE_API_KEY=808c0fb3-dc7f-40f5-b294-807f21fc8947
CVE_USERNAME=julio@mundologic.com.br
CVE_PASSWORD=1a2b3c4d

# Opcional: Token pré-obtido (não recomendado)
CVE_TOKEN=
```

### ⚠️ CONFIGURAÇÃO CRÍTICA: config/env.ts

```typescript
// ❌ ERRADO - Só lê uma variável
cve: {
  baseUrl: process.env.CVE_BASE_URL || 'https://cs-test...',
  // ...
}

// ✅ CORRETO - Lê ambas as variáveis + default de produção
cve: {
  baseUrl: process.env.CVE_API_BASE_URL || 
           process.env.CVE_BASE_URL || 
           'https://cs.intelbras-cve-pro.com.br',
  // ...
}
```

### Implementação Backend

**1. CVEService (`src/services/CVEService.ts`)**

```typescript
export class CVEService {
  private api: AxiosInstance;
  private token: string;

  constructor() {
    this.token = config.cve.token || '';
    this.api = axios.create({
      baseURL: config.cve.baseUrl,
      timeout: 30000,
    });

    // ⚠️ CRÍTICO: Interceptor que adiciona token automaticamente
    this.api.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });
  }

  /**
   * ⚠️ MÉTODO CRÍTICO: Login automático na inicialização
   */
  async login(): Promise<string> {
    try {
      const response = await axios.post(
        `${config.cve.baseUrl}/api/v1/login`,
        {
          email: config.cve.username,
          password: config.cve.password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Api-Key': config.cve.apiKey, // ⚠️ Case-sensitive!
          },
        }
      );

      if (response.data && response.data.token) {
        this.token = response.data.token;
        console.log('✅ Login CVE-PRO realizado com sucesso!');
        return this.token;
      } else {
        throw new Error('Token não retornado pela API');
      }
    } catch (error: any) {
      const errorDetails = error.response?.data || error.message;
      console.error('❌ Erro no login CVE-PRO:', errorDetails);
      throw new Error(`Falha no login CVE-PRO: ${JSON.stringify(errorDetails)}`);
    }
  }
}
```

**2. Inicialização no servidor (`src/index.ts`)**

```typescript
async function startServer() {
  // ...
  
  // 3. Fazer login na API CVE-PRO (não crítico - com fallback)
  console.log('🔑 Autenticando na API CVE-PRO...');
  let token = config.cve.token;
  
  try {
    if (!token) {
      token = await cveService.login();
    }

    // Testar conexão com API
    const chargers = await cveService.getChargePoints();
    console.log(`✅ ${chargers.length} carregador(es) encontrado(s)`);

    // Conectar ao WebSocket
    await webSocketService.connect(token);
  } catch (error: any) {
    console.warn('⚠️  Falha na conexão com CVE-PRO:', error.message);
    console.warn('⚠️  Servidor continuará sem integração CVE-PRO');
    // ⚠️ NÃO fazer throw - permitir servidor subir sem CVE-Pro
  }

  // 6. Iniciar servidor HTTP
  app.listen(config.port, () => {
    console.log('✅ VETRIC DASHBOARD ONLINE!');
  });
}
```

### ⚠️ BUGS CRÍTICOS E SOLUÇÕES

#### ❌ Bug 1: Header API-Key incorreto
**Sintoma:** `E000 - Tenant Not Found` ou `405 Not Allowed`

**Causa:** Header com case errado: `API-Key` vs `Api-Key`

**Solução:**
```typescript
// ❌ ERRADO
headers: { 'API-Key': config.cve.apiKey }

// ✅ CORRETO
headers: { 'Api-Key': config.cve.apiKey }
```

#### ❌ Bug 2: Variável de ambiente não carregada
**Sintoma:** Sempre usa URL de teste mesmo com .env configurado

**Causa:** `config/env.ts` lê `CVE_BASE_URL` mas `.env` tem `CVE_API_BASE_URL`

**Solução:**
```typescript
// ✅ Ler ambas as variáveis
baseUrl: process.env.CVE_API_BASE_URL || 
         process.env.CVE_BASE_URL || 
         'https://cs.intelbras-cve-pro.com.br',
```

#### ❌ Bug 3: Servidor não inicia se login falhar
**Sintoma:** Backend crasha ao iniciar em ambiente sem internet

**Solução:**
```typescript
// ✅ Envolver login CVE em try-catch
try {
  await cveService.login();
} catch (error) {
  console.warn('⚠️  CVE-Pro indisponível, continuando sem integração');
  // Não fazer throw - permitir servidor subir
}
```

#### ❌ Bug 4: Token expira e não renova
**Sintoma:** Após algumas horas, requisições falham com 401

**Solução (TODO - Fase 2):**
```typescript
// Implementar renovação automática de token
this.api.interceptors.response.use(
  response => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Tentar renovar token
      await this.login();
      // Retentar requisição original
      return this.api(error.config);
    }
    return Promise.reject(error);
  }
);
```

---

## 📝 CHECKLIST DE DEPLOY

### Backend

- [ ] **Variáveis de ambiente configuradas**
  - [ ] `CVE_API_BASE_URL` (produção)
  - [ ] `CVE_API_KEY`
  - [ ] `CVE_USERNAME`
  - [ ] `CVE_PASSWORD`
  - [ ] `JWT_SECRET` (único e seguro)
  - [ ] `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

- [ ] **Configuração de autenticação**
  - [ ] `config/env.ts` lê `CVE_API_BASE_URL` E `CVE_BASE_URL`
  - [ ] Default é URL de produção
  - [ ] Header `Api-Key` (case-sensitive)

- [ ] **Inicialização robusta**
  - [ ] Login CVE-Pro em try-catch
  - [ ] Servidor sobe mesmo se CVE-Pro falhar
  - [ ] Logs detalhados de erro

- [ ] **Rotas protegidas**
  - [ ] Middleware `authenticate` em todas as rotas
  - [ ] Middleware `adminOnly` em rotas administrativas

### Frontend

- [ ] **API Service configurado**
  - [ ] Interceptor adiciona token em TODAS as requisições
  - [ ] Token vem do `localStorage.getItem('@vetric:token')`

- [ ] **Rotas protegidas**
  - [ ] Todas as rotas internas em `<PrivateRoute>`
  - [ ] Redirecionamento para `/login` se não autenticado

- [ ] **Variáveis de ambiente**
  - [ ] `VITE_API_URL` configurada corretamente

---

## 🧪 TESTES DE AUTENTICAÇÃO

### 1. Testar Login VETRIC

```bash
# Backend deve estar rodando
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vetric.com.br","senha":"Vetric@2026"}'

# Deve retornar:
# {"success":true,"token":"eyJhbGc...","usuario":{...}}
```

### 2. Testar Rota Protegida

```bash
# Usar token do passo anterior
TOKEN="eyJhbGc..."

curl http://localhost:3001/api/dashboard/chargers \
  -H "Authorization: Bearer $TOKEN"

# Deve retornar:
# {"success":true,"data":[...5 carregadores...]}
```

### 3. Testar Login CVE-Pro

```bash
# Verificar logs do backend ao iniciar
# Deve mostrar:
# ✅ Login CVE-PRO realizado com sucesso!
# ✅ Token obtido: B4F74214...
# ✅ 5 carregador(es) encontrado(s)
```

### 4. Testar Frontend

1. Acessar http://localhost:8080/login
2. Fazer login com `admin@vetric.com.br` / `Vetric@2026`
3. Verificar no DevTools (F12) → Network:
   - Requisições para `/api/dashboard/chargers` devem ter header `Authorization`
   - Status code deve ser `200 OK`
   - Response deve conter 5 carregadores

---

## 🚨 TROUBLESHOOTING

### Problema: "Nenhum carregador encontrado"

**Verificar:**
1. Backend está rodando? (`http://localhost:3001/health`)
2. Login CVE-Pro funcionou? (ver logs do backend)
3. Frontend está enviando token? (DevTools → Network → Headers)
4. Token é válido? (testar com curl)

**Solução comum:**
- Verificar `api.ts` tem interceptor que adiciona token
- Fazer logout e login novamente
- Limpar localStorage e fazer novo login

### Problema: "E000 - Tenant Not Found"

**Causa:** URL ou API Key incorretos

**Solução:**
1. Verificar `.env`: `CVE_API_BASE_URL=https://cs.intelbras-cve-pro.com.br`
2. Verificar header: `Api-Key` (não `API-Key`)
3. Reiniciar backend após mudar `.env`

### Problema: "401 Unauthorized"

**Frontend → Backend:**
- Verificar token no localStorage
- Verificar interceptor em `api.ts`
- Fazer logout e login novamente

**Backend → CVE-Pro:**
- Token expirou, servidor precisa reiniciar
- Credenciais CVE-Pro incorretas no `.env`

---

## 📚 ARQUIVOS IMPORTANTES

```
Backend:
├── src/
│   ├── config/
│   │   └── env.ts                 ⚠️ CRÍTICO: Leitura de variáveis
│   ├── models/
│   │   └── Usuario.ts             Usuários VETRIC
│   ├── services/
│   │   ├── AuthService.ts         Auth VETRIC
│   │   └── CVEService.ts          ⚠️ CRÍTICO: Auth CVE-Pro
│   ├── middleware/
│   │   └── auth.ts                ⚠️ CRÍTICO: Proteção de rotas
│   ├── routes/
│   │   └── auth.ts                Endpoints de auth
│   └── index.ts                   ⚠️ CRÍTICO: Inicialização
└── .env                           ⚠️ CRÍTICO: Credenciais

Frontend:
├── src/
│   ├── contexts/
│   │   └── AuthContext.tsx        ⚠️ CRÍTICO: Estado global
│   ├── services/
│   │   └── api.ts                 ⚠️ CRÍTICO: Interceptor de token
│   ├── components/
│   │   └── PrivateRoute.tsx       ⚠️ CRÍTICO: Proteção de rotas
│   └── pages/
│       └── Login.tsx              Tela de login
```

---

## ✅ SISTEMA PRONTO PARA PRODUÇÃO

Após seguir esta documentação, o sistema estará:

- ✅ **Robusto:** Tratamento de erros em todas as camadas
- ✅ **Automático:** Login CVE-Pro automático na inicialização
- ✅ **Seguro:** Senhas hasheadas, JWT com expiração, rotas protegidas
- ✅ **Escalável:** Pronto para deploy em VPS/cloud
- ✅ **Resiliente:** Continua funcionando mesmo se CVE-Pro estiver offline

---

**Última atualização:** 12/01/2026  
**Versão:** 1.0.0  
**Autor:** Sistema VETRIC

