# 🧪 VETRIC Dashboard - Plano de Teste

## 📋 Objetivo

Criar uma versão de teste funcional que demonstre:
1. Conexão com API CVE-Pro (ambiente teste)
2. Dashboard visual com status dos carregadores
3. Identificação de moradores por TAG
4. Simulação de notificações WhatsApp

---

## 🏗️ Estrutura do Projeto de Teste

```
vetric-test/
├── backend/
│   ├── src/
│   │   ├── server.ts                 # Servidor Express principal
│   │   ├── services/
│   │   │   ├── cvepro-client.ts      # Cliente API CVE-Pro
│   │   │   ├── websocket-client.ts   # Cliente WebSocket STOMP
│   │   │   └── notificacao-mock.ts   # Mock notificações WhatsApp
│   │   ├── data/
│   │   │   └── moradores-mock.ts     # Dados fake de moradores
│   │   └── routes/
│   │       ├── status.ts             # GET /api/status
│   │       └── moradores.ts          # GET /api/moradores
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                          # Credenciais CVE-Pro teste
│
└── frontend/
    ├── src/
    │   ├── App.tsx                   # Componente principal
    │   ├── components/
    │   │   ├── Dashboard.tsx         # Dashboard principal
    │   │   ├── ChargerCard.tsx       # Card de carregador
    │   │   └── StatusIndicator.tsx   # Indicador visual status
    │   ├── services/
    │   │   └── api.ts                # Cliente API backend
    │   └── styles/
    │       └── dashboard.css         # Estilos
    ├── package.json
    └── index.html
```

---

## 🔧 Componentes do Teste

### 1. Backend (Node.js + Express + TypeScript)

**Servidor Principal (`server.ts`):**
- Express API rodando na porta 4000
- Endpoints REST para frontend
- WebSocket server para tempo real
- Conecta à API CVE-Pro teste

**CVE-Pro Client (`cvepro-client.ts`):**
```typescript
// Conecta à API de teste
baseUrl: 'https://cs-test.intelbras-cve-pro.com.br'
token: '4B367B21C8CFA428AC65201603DA9433F2411B51727F3D54FC...'

// Busca carregadores reais
getChargers() → Array<Charger>

// Busca status em tempo real
getChargerStatus(id, connector) → Status
```

**WebSocket Client (`websocket-client.ts`):**
```typescript
// Conecta ao WebSocket STOMP da CVE-Pro
// Subscreve aos tópicos dos carregadores
// Emite eventos quando status muda

on('status-change', (event) => {
  // Status mudou!
  // Identifica morador pela TAG
  // Notifica frontend via WebSocket
})
```

**Mock Moradores (`moradores-mock.ts`):**
```typescript
const moradores = [
  {
    id: 1,
    nome: 'João Silva',
    apartamento: '101',
    telefone: '11-99999-1111',
    tag_rfid: 'TAG_001_123456'
  },
  {
    id: 2,
    nome: 'Maria Santos',
    apartamento: '202',
    telefone: '11-99999-2222',
    tag_rfid: 'TAG_002_789012'
  },
  // ... outros 3 moradores
];

// Função para identificar morador pela TAG
function getMoradorByTag(tag: string) {
  return moradores.find(m => m.tag_rfid === tag);
}
```

**Mock Notificações (`notificacao-mock.ts`):**
```typescript
// Por enquanto só loga no console
// Depois trocar por Evolution API real

function enviarNotificacao(morador, mensagem) {
  console.log('━'.repeat(80));
  console.log('📱 NOTIFICAÇÃO WHATSAPP (MOCK)');
  console.log('━'.repeat(80));
  console.log('Para:', morador.nome);
  console.log('Telefone:', morador.telefone);
  console.log('Mensagem:', mensagem);
  console.log('━'.repeat(80));
}
```

### 2. Frontend (React + Vite)

**Dashboard Principal (`Dashboard.tsx`):**
```tsx
export function Dashboard() {
  const [carregadores, setCarregadores] = useState([]);
  
  // Busca status inicial
  useEffect(() => {
    api.getStatus().then(setCarregadores);
  }, []);
  
  // WebSocket para tempo real
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:4000');
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      atualizarCarregador(update);
    };
  }, []);
  
  return (
    <div className="dashboard-grid">
      {carregadores.map(c => (
        <ChargerCard key={c.id} carregador={c} />
      ))}
    </div>
  );
}
```

**Card de Carregador (`ChargerCard.tsx`):**
```tsx
export function ChargerCard({ carregador }) {
  return (
    <div className={`charger-card status-${carregador.status.toLowerCase()}`}>
      <div className="charger-header">
        <h3>{carregador.name}</h3>
        <StatusIndicator status={carregador.status} />
      </div>
      
      <div className="charger-body">
        {carregador.status === 'Charging' && carregador.morador ? (
          <>
            <div className="morador-info">
              <p className="label">👤 Morador</p>
              <p className="value">{carregador.morador.nome}</p>
              <p className="apto">Apto {carregador.morador.apartamento}</p>
            </div>
            
            <div className="charging-info">
              <div className="metric">
                <span className="label">⚡ Potência</span>
                <span className="value">{carregador.power} kW</span>
              </div>
              <div className="metric">
                <span className="label">🔋 Energia</span>
                <span className="value">{carregador.energy} kWh</span>
              </div>
            </div>
          </>
        ) : (
          <div className="status-message">
            {getStatusMessage(carregador.status)}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 🎨 Interface Visual

### Layout do Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│                  🔋 VETRIC - Dashboard                      │
│                                                             │
│  [🏠 Dashboard]  [👥 Moradores]  [📊 Histórico]            │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Gran Marine 1│  │ Gran Marine 2│  │ Gran Marine 3│
│              │  │              │  │              │
│   🔋 Livre   │  │ ⚡ Carregando│  │   🔋 Livre   │
│              │  │              │  │              │
│              │  │ 👤 João Silva│  │              │
│              │  │   Apto 101   │  │              │
│              │  │              │  │              │
│              │  │  ⚡ 7.4 kW   │  │              │
│              │  │  🔋 23.5 kWh │  │              │
└──────────────┘  └──────────────┘  └──────────────┘

┌──────────────┐  ┌──────────────┐
│ Gran Marine 6│  │ Gran Marine 5│
│              │  │              │
│   🔋 Livre   │  │ ⚠️  Falha    │
│              │  │              │
└──────────────┘  └──────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 🔔 Notificações Recentes                                    │
│                                                             │
│ • 14:32 - João Silva iniciou carregamento (Gran Marine 2)  │
│ • 13:45 - Maria Santos finalizou carregamento (23.5 kWh)   │
│ • 12:30 - Pedro Costa iniciou carregamento (Gran Marine 1) │
└─────────────────────────────────────────────────────────────┘
```

### Cores de Status

```css
/* Available - Verde */
.status-available {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

/* Charging - Azul animado */
.status-charging {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  animation: pulse 2s infinite;
}

/* Faulted - Vermelho */
.status-faulted {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

/* Occupied - Amarelo */
.status-occupied {
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
}
```

---

## 📝 Arquivos de Configuração

### `.env` (Backend)

```env
# CVE-Pro API (Ambiente de TESTE)
CVEPRO_BASE_URL=https://cs-test.intelbras-cve-pro.com.br
CVEPRO_API_KEY=fc961d23-0ebe-41df-b044-72fa60b3d89a
CVEPRO_USER=cve-api@intelbras.com.br
CVEPRO_PASSWORD=cve-api
CVEPRO_TOKEN=4B367B21C8CFA428AC65201603DA9433F2411B51727F3D54FC7782B8F0D41B7338F58D409BAB47488C611D815D1F1946FEED079848209E602B8BD0914F5F04924A0DB553376C4B2DD292B6522F1870CD

# Servidor
PORT=4000
NODE_ENV=test

# WebSocket
WS_PORT=4001

# Notificações (Mock por enquanto)
NOTIFICATIONS_ENABLED=true
NOTIFICATIONS_MODE=console  # console | whatsapp

# Carregadores da instalação (IDs reais do Gran Marine)
CHARGERS=JDBM1900145Z6,JDBM1900101FE,QUXM1200012V,JDBM1200040BB,0000124080002216
```

### `package.json` (Backend)

```json
{
  "name": "vetric-test-backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "ts-node-dev --respawn src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "axios": "^1.6.5",
    "@stomp/stompjs": "^7.0.0",
    "ws": "^8.16.0",
    "socket.io": "^4.6.1"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "ts-node-dev": "^2.0.0",
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/ws": "^8.5.10"
  }
}
```

### `package.json` (Frontend)

```json
{
  "name": "vetric-test-frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.5",
    "socket.io-client": "^4.6.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8",
    "typescript": "^5.3.3"
  }
}
```

---

## 🚀 Como Rodar o Teste

### 1. Backend

```bash
cd vetric-test/backend
npm install
npm run dev

# Deve ver:
# ✓ Servidor rodando na porta 4000
# ✓ Conectado à API CVE-Pro
# ✓ WebSocket conectado
# ✓ Subscrito aos 5 carregadores
```

### 2. Frontend

```bash
cd vetric-test/frontend
npm install
npm run dev

# Abre automaticamente: http://localhost:5173
```

### 3. Ver Funcionando

1. Abra o navegador em `http://localhost:5173`
2. Veja os 5 carregadores com status real
3. Console do backend mostra eventos em tempo real
4. Quando alguém usa TAG → identifica morador automaticamente
5. Notificação mock aparece no console

---

## 📊 Fluxo de Teste Completo

### Cenário 1: Carregador Livre → Carregando

```
1. Dashboard mostra: Gran Marine 1 - 🔋 Livre
2. Alguém passa TAG no carregador
3. WebSocket recebe: { status: "Charging", idTag: "TAG_001_123456" }
4. Backend busca: TAG_001_123456 → João Silva
5. Backend loga notificação no console:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   📱 NOTIFICAÇÃO WHATSAPP (MOCK)
   Para: João Silva
   Telefone: 11-99999-1111
   Mensagem: Olá João! Carregamento iniciado no Gran Marine 1
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
6. Frontend atualiza automaticamente:
   Gran Marine 1 - ⚡ Carregando
   👤 João Silva
   Apto 101
   ⚡ 7.4 kW
   🔋 0.5 kWh
```

### Cenário 2: Carregamento Concluído

```
1. Dashboard mostra: Gran Marine 1 - ⚡ Carregando (João Silva)
2. Carregamento termina
3. WebSocket recebe: { status: "Finishing", energy: 23.5, cost: 15.28 }
4. Backend loga notificação:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   📱 NOTIFICAÇÃO WHATSAPP (MOCK)
   Para: João Silva
   Mensagem: Carregamento concluído!
   ⚡ 23.5 kWh | R$ 15,28
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5. Frontend atualiza: Gran Marine 1 - 🔋 Livre
6. Notificação aparece na lista: "João Silva finalizou carregamento"
```

---

## 🎯 O Que Este Teste Demonstra

### ✅ Funcionalidades Testadas

1. **Conexão API CVE-Pro** ✓
   - Login bem-sucedido
   - Token válido
   - Busca dados reais

2. **WebSocket Tempo Real** ✓
   - Conecta ao STOMP
   - Subscreve carregadores
   - Recebe eventos ao vivo

3. **Identificação de Moradores** ✓
   - TAG RFID → Nome
   - Dados do morador aparecem no card
   - Funciona em tempo real

4. **Notificações WhatsApp (Mock)** ✓
   - Detecta eventos
   - Identifica destinatário
   - Formata mensagem
   - Loga no console (por enquanto)

5. **Dashboard Visual** ✓
   - Cards responsivos
   - Cores por status
   - Animações
   - Atualização tempo real

---

## 📈 Próximos Passos Após o Teste

### Se o teste funcionar bem:

1. **Substituir Mock de Moradores** → Banco de dados real
2. **Ativar Evolution API** → Notificações reais no WhatsApp
3. **Adicionar sua UX do GitHub** → Interface completa
4. **Adicionar Cadastro de Moradores** → CRUD completo
5. **Adicionar Histórico** → Salvar transações
6. **Migrar para Produção** → API real CVE-Pro

---

## 🔧 Personalização Fácil

### Trocar Moradores Mock

Edite `backend/src/data/moradores-mock.ts`:
```typescript
const moradores = [
  {
    id: 1,
    nome: 'SEU NOME AQUI',
    apartamento: 'SEU APTO',
    telefone: 'SEU TELEFONE',
    tag_rfid: 'TAG_REAL_DO_SEU_SISTEMA'  // ← TAG real da CVE-Pro
  },
  // ... adicione quantos quiser
];
```

### Ativar WhatsApp Real

No `.env`:
```env
NOTIFICATIONS_MODE=whatsapp  # console → whatsapp
EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_API_KEY=sua_key_aqui
```

---

## ⏱️ Tempo Estimado

- **Criar estrutura:** 2-3 horas
- **Você rodar e testar:** 15 minutos
- **Ajustes e personalizações:** 1-2 horas

**Total:** ~4-6 horas de desenvolvimento + 15 min seu tempo

---

## 📝 Checklist de Teste

Quando rodar, verifique:

- [ ] Backend inicia sem erros
- [ ] Conecta à API CVE-Pro (vê token no console)
- [ ] WebSocket conectado (vê "Connected to STOMP")
- [ ] Frontend carrega (http://localhost:5173)
- [ ] Mostra os 5 carregadores
- [ ] Status é real (vindo da API)
- [ ] Cores corretas por status
- [ ] Console do backend mostra eventos
- [ ] Quando status muda, dashboard atualiza
- [ ] Identificação de morador funciona (se usar TAG mockada)
- [ ] Notificação mock aparece no console

---

## 🎉 Resultado Esperado

Um dashboard **funcional e bonito** mostrando:
- Status real dos 5 carregadores Gran Marine
- Atualização em tempo real via WebSocket
- Identificação de moradores quando usam TAG
- Notificações mockadas no console
- Interface responsiva e moderna

**Pronto para evoluir para versão completa!**

---

**Quer que eu crie todo esse código agora?** 🚀

Posso gerar:
1. Estrutura completa de pastas
2. Código do backend
3. Código do frontend
4. Arquivos de configuração
5. README com instruções

É só confirmar!

