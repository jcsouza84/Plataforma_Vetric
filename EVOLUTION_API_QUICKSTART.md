# 🚀 Evolution API - Guia Rápido

## ⚡ Início Rápido

### 1. Analisar Instâncias
```bash
npm run evolution:analyze
```

### 2. Ver Detalhes Completos
```bash
npm run evolution:details
```

### 3. Testar Envio de Mensagem
```bash
npm run evolution:test
```

---

## 🔑 Credenciais

### API Key
```
t1ld6RKtyZTn9xqlz5WVubfMRt8jNkPc1NAlOx1SZcmTq5lNZl+YVk308sJ+RxoDdBNCGpnAo0uhGM77K9vJHg==
```

### Base URL
```
http://habbora-evolutionapi-cf4643-46-202-146-195.traefik.me
```

---

## 📱 Instâncias Disponíveis

| Nome | Número | Status | Uso Recomendado |
|------|---------|--------|-----------------|
| **Vetric Bot** | 5582991096461 | 🟢 Online | ⭐ **Principal** (Use para o projeto) |
| Spresso Bot | 5582987021546 | 🟢 Online | Backup |
| Alisson (Pessoal) | 5582996590087 | 🟢 Online | ❌ Não usar (pessoal) |

---

## 💻 Código Exemplo

### Enviar Mensagem Simples

```typescript
import axios from 'axios';

const config = {
  baseUrl: 'http://habbora-evolutionapi-cf4643-46-202-146-195.traefik.me',
  apiKey: 't1ld6RKtyZTn9xqlz5WVubfMRt8jNkPc1NAlOx1SZcmTq5lNZl+YVk308sJ+RxoDdBNCGpnAo0uhGM77K9vJHg=='
};

async function sendMessage(number: string, text: string) {
  const response = await axios.post(
    `${config.baseUrl}/message/sendText/Vetric Bot`,
    { number, text },
    { headers: { apikey: config.apiKey } }
  );
  return response.data;
}

// Usar
await sendMessage('5511999999999', 'Olá do VETRIC!');
```

### Verificar Status

```typescript
async function checkStatus() {
  const response = await axios.get(
    `${config.baseUrl}/instance/connectionState/Vetric Bot`,
    { headers: { apikey: config.apiKey } }
  );
  return response.data;
}

// Usar
const status = await checkStatus();
console.log(status.instance.state); // 'open' = conectado
```

---

## 🎯 Casos de Uso VETRIC

### 1. Notificar Carregamento Iniciado
```typescript
await sendMessage('5511999999999', `
🔌 Carregamento Iniciado

Carregador: #01
Usuário: João Silva
Horário: ${new Date().toLocaleString('pt-BR')}
`);
```

### 2. Alerta de Falha
```typescript
await sendMessage('558291096461', `
⚠️ ALERTA!

Carregador: #02
Erro: Falha na comunicação
Requer atenção imediata!
`);
```

### 3. Relatório Diário
```typescript
await sendMessage('558291096461', `
📊 Relatório do Dia

✅ Carregamentos: 45
⚡ Energia: 320 kWh
👥 Usuários: 12
`);
```

---

## 📚 Documentação Completa

Para documentação detalhada, veja:
- **EVOLUTION_API_ANALYSIS.md** - Análise completa com todos os endpoints

---

## 🆘 Problemas Comuns

### Mensagem não enviada
- ✅ Verifique se a instância está online
- ✅ Confirme o formato do número (5511999999999)
- ✅ Valide a API Key

### Instância desconectada
```bash
# Verificar estado
npm run evolution:details

# Reconectar via manager
# Acesse: http://habbora-evolutionapi-cf4643-46-202-146-195.traefik.me/manager/login
```

---

## ✅ Status Atual

- ✅ API Key válida
- ✅ 3 instâncias online
- ✅ Teste de envio funcionando
- ✅ Pronto para integração

**Última verificação:** 12/01/2026 às 02:35

---

**VETRIC - CVE** 🚀

