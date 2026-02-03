# ⚡ QUICK START - Ativar Monitor de Logs

## ✅ JÁ FEITO

- ✅ **Migration aplicada** no banco Render
- ✅ **Tabela logs_sistema** criada
- ✅ **API `/api/logs`** funcionando
- ✅ **Interface MonitorTerminal** criada

---

## 🚀 FALTA FAZER (5 minutos)

### 1️⃣ Adicionar Link na Sidebar

**Encontre o arquivo onde sua sidebar está definida**, geralmente:
- `src/components/Sidebar.tsx`
- `src/layouts/Layout.tsx`
- `src/App.tsx`

**Adicione abaixo de "Configurações":**

```tsx
// Exemplo com React Router
<Link to="/logs">
  <FileText className="icon" />
  <span>Logs</span>
</Link>
```

### 2️⃣ Adicionar Rota

**No arquivo de rotas (geralmente `App.tsx`):**

```tsx
import MonitorTerminal from './pages/MonitorTerminal';

// Adicionar:
<Route path="/logs" element={<MonitorTerminal />} />
```

### 3️⃣ Testar

```bash
# Terminal 1 - Backend
cd apps/backend
npm run dev

# Terminal 2 - Frontend
cd apps/interface
npm run dev

# Acessar
http://localhost:3000/logs
```

---

## 🎯 RESULTADO

Você verá uma **interface tipo terminal** com:

```
┌────────────────────────────────────────────────────┐
│ ⚡ AO VIVO             [Filtros] [Pausar] [Limpar] │
├────────────────────────────────────────────────────┤
│                                                    │
│ ESTATÍSTICAS:                                      │
│ ┌─────────────────┐  ┌─────────────────┐         │
│ │ Gran Marine 3   │  │ Gran Marine 4   │         │
│ │ Total: 45       │  │ Total: 32       │         │
│ │ Erros: 2        │  │ Erros: 0        │         │
│ │ ID: 12/1        │  │ ID: 8/0         │         │
│ └─────────────────┘  └─────────────────┘         │
│                                                    │
│ LOGS:                                              │
│ 01:45:23 [CVE_API] INFO GET_STATUS Gran Marine 3  │
│ 01:45:24 [IDENTIFICACAO] SUCCESS 👤 Claudevania   │
│ 01:45:24 [NOTIFICACAO] SUCCESS INICIO_CARGA       │
│ 01:45:25 [POLLING] INFO POLLING_CYCLE (120ms)     │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## 💡 ACESSO DIRETO (Alternativa)

Se não quiser mexer na sidebar agora, acesse diretamente:

```
http://localhost:3000/logs
```

---

## 📝 INTEGRAR LOGS NO CÓDIGO

Para começar a ver logs, adicione no **PollingService** e **NotificationService**:

### PollingService.ts

```typescript
import { logService } from '../services/LogService';

// Quando identificar um morador:
if (morador) {
  await logService.logIdentificacao(
    true,
    charger.uuid,
    charger.name,
    idTag,
    morador.id,
    morador.nome
  );
}
```

### NotificationService.ts

```typescript
import { logService } from '../services/LogService';

// Quando enviar notificação:
await logService.logNotificacao(
  true,
  'INICIO_CARGA',
  morador.id,
  morador.nome
);
```

**Exemplos completos:** Ver `SISTEMA_MONITOR_TERMINAL.md`

---

## ✨ PRONTO!

Agora você tem **visibilidade total** do sistema em tempo real! 🎉

**Quer ajuda para adicionar o link na sidebar?**
Me envie o arquivo onde está sua sidebar que eu te ajudo! 😊
