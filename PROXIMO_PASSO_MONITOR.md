# 🚀 Próximo Passo: Ativar Monitor Terminal

## ✅ O QUE JÁ FOI CRIADO

1. **✅ Tabela no Banco de Dados** (`logs_sistema`)
2. **✅ LogService** - Serviço de captura de logs
3. **✅ API Completa** - `/api/logs/*`
4. **✅ Interface Visual** - MonitorTerminal.tsx
5. **✅ Documentação** - SISTEMA_MONITOR_TERMINAL.md

---

## 📋 O QUE VOCÊ PRECISA FAZER

### 1️⃣ EXECUTAR A MIGRATION (5 minutos)

**Opção A: Via NPM (Recomendado)**
```bash
cd /Users/juliocesarsouza/Desktop/VETRIC\ -\ CVE
npm run migrate
```

**Opção B: Via Supabase SQL Editor**
1. Acesse: https://supabase.com/dashboard/project/[seu-projeto]/sql
2. Cole o conteúdo de: `apps/backend/src/migrations/010_criar_logs_sistema.sql`
3. Execute

**Confirmar:**
```sql
-- Verificar se tabela foi criada
SELECT COUNT(*) FROM logs_sistema;

-- Deve retornar: 1 (log inicial do sistema)
```

---

### 2️⃣ ADICIONAR ROTA NO FRONTEND (2 minutos)

**Arquivo:** `apps/interface/src/App.tsx` ou seu arquivo de rotas

```typescript
import MonitorTerminal from './pages/MonitorTerminal';

// Adicionar rota:
<Route path="/monitor" element={<MonitorTerminal />} />
```

**Ou adicionar link no menu:**
```tsx
<Link to="/monitor">
  📺 Monitor Terminal
</Link>
```

---

### 3️⃣ INTEGRAR LOGS NO CÓDIGO (15 minutos)

#### No PollingService:

```typescript
import { logService } from '../services/LogService';

// Exemplo 1: Log de polling
async poll() {
  await logService.logPolling(
    'POLLING_CYCLE',
    'Iniciando ciclo de polling',
    'INFO'
  );
  
  // ... seu código ...
}

// Exemplo 2: Log de identificação
async identificarMorador(idTag: string, charger: Charger) {
  const morador = await MoradorModel.findByTag(idTag);
  
  if (morador) {
    await logService.logIdentificacao(
      true,
      charger.uuid,
      charger.name,
      idTag,
      morador.id,
      morador.nome
    );
  } else {
    await logService.logIdentificacao(
      false,
      charger.uuid,
      charger.name,
      idTag
    );
  }
  
  return morador;
}
```

#### No NotificationService:

```typescript
import { logService } from '../services/LogService';

async enviarNotificacao(morador: Morador, mensagem: string, evento: string) {
  try {
    await evolutionApi.sendMessage(morador.telefone, mensagem);
    
    await logService.logNotificacao(
      true,
      evento,
      morador.id,
      morador.nome,
      undefined,
      `Notificação enviada com sucesso`
    );
    
  } catch (error) {
    await logService.logNotificacao(
      false,
      evento,
      morador.id,
      morador.nome,
      undefined,
      `Erro ao enviar notificação`,
      error instanceof Error ? error.message : String(error)
    );
    
    throw error;
  }
}
```

---

### 4️⃣ TESTAR (5 minutos)

1. **Iniciar Backend:**
```bash
cd apps/backend
npm run dev
```

2. **Iniciar Frontend:**
```bash
cd apps/interface
npm run dev
```

3. **Acessar Monitor:**
```
http://localhost:3000/monitor
```

4. **Fazer Testes:**
- Iniciar uma carga em qualquer carregador
- Ver logs aparecendo em tempo real
- Testar filtros (tipo, nível, carregador)
- Ver estatísticas atualizando

---

## 🎯 RESULTADO ESPERADO

Você verá uma interface tipo terminal mostrando:

```
⚡ AO VIVO                                        [Filtros]

┌─────────────────────────────────────────────────────────┐
│ Gran Marine 3  │ Total: 45 │ Erros: 2 │ ID: 12/1 │...  │
│ Gran Marine 4  │ Total: 32 │ Erros: 0 │ ID: 8/0  │...  │
└─────────────────────────────────────────────────────────┘

01:45:23.456 [CVE_API] INFO Gran Marine 3 GET_STATUS ...
01:45:24.123 [IDENTIFICACAO] SUCCESS Gran Marine 3 👤 Claudevania ...
01:45:24.567 [NOTIFICACAO] SUCCESS 👤 Claudevania INICIO_CARGA ...
01:45:25.890 [POLLING] INFO POLLING_CYCLE Ciclo executado (120ms)
```

---

## 💡 DICAS DE USO

### Ver Logs de um Carregador Específico:
```typescript
// No código
const logs = await logService.buscar({
  carregador_uuid: '1122905050',
  limit: 50
});
```

```http
# Via API
GET /api/logs/carregador/1122905050
```

### Ver Apenas Erros:
```http
GET /api/logs?nivel=ERROR
```

### Ver Logs de Identificação:
```http
GET /api/logs?tipo=IDENTIFICACAO
```

### Estatísticas em Tempo Real:
```http
GET /api/logs/stats
```

---

## 🔧 CONFIGURAÇÃO ADICIONAL

### Ajustar Intervalo de Atualização:

**Arquivo:** `apps/interface/src/pages/MonitorTerminal.tsx`

```typescript
// Linha ~58 - Mudar de 2000 (2s) para outro valor
const interval = setInterval(fetchLogs, 5000); // 5 segundos
```

### Ajustar Cores:

**Arquivo:** `apps/interface/src/pages/MonitorTerminal.css`

```css
/* Mudar cor principal (verde) */
.monitor-terminal {
  color: #00ff00; /* Mude para outra cor */
}
```

### Adicionar Job de Limpeza Automática:

No backend, adicionar cron job para limpar logs antigos:

```typescript
import cron from 'node-cron';
import { logService } from './services/LogService';

// A cada hora, limpar logs > 24h
cron.schedule('0 * * * *', async () => {
  await logService.limparAntigos();
});
```

---

## 📊 MONITORAMENTO EM PRODUÇÃO

### Via API:

```bash
# Ver últimos 10 logs
curl https://sua-api.render.com/api/logs/recentes?limit=10

# Ver erros
curl https://sua-api.render.com/api/logs?nivel=ERROR

# Ver estatísticas
curl https://sua-api.render.com/api/logs/stats
```

### Via Interface:

```
https://sua-interface.render.com/monitor
```

---

## ❓ PROBLEMAS COMUNS

### "Tabela não existe"
→ Execute a migration 010

### "Logs não aparecem"
→ Verifique se adicionou `logService` no código

### "Interface não atualiza"
→ Veja console do navegador (F12)

### "Muitos logs / Lento"
→ Execute: `SELECT limpar_logs_antigos();`

---

## 📚 DOCUMENTAÇÃO COMPLETA

Ver: `SISTEMA_MONITOR_TERMINAL.md`

---

## ✅ CHECKLIST RÁPIDO

- [ ] Migration 010 executada
- [ ] Rota `/monitor` adicionada no frontend
- [ ] LogService integrado no PollingService
- [ ] LogService integrado no NotificationService
- [ ] Testado localmente
- [ ] Deploy em produção
- [ ] Monitor acessível

---

**Tempo estimado total:** ~30 minutos  
**Resultado:** Visibilidade completa do sistema em tempo real! 📺✨
