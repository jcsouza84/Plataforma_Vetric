# 🚀 Guia Rápido de Início

## Passos para Executar o Discovery Tool

### 1️⃣ Instalar Dependências

```bash
npm install
```

### 2️⃣ Configurar Credenciais

Crie um arquivo `.env` na raiz do projeto:

```env
CVEPRO_BASE_URL=https://cs.intelbras-cve-pro.com.br
CVEPRO_USERNAME=seu_usuario
CVEPRO_PASSWORD=sua_senha
DEBUG_MODE=true
AUTO_RECONNECT=true
SAVE_RAW_MESSAGES=true
LOG_LEVEL=info
```

### 3️⃣ Executar

```bash
npm run dev
```

### 4️⃣ Testar

Enquanto o sistema estiver rodando:
- Inicie um carregamento com sua TAG RFID
- Observe as mensagens no console
- Deixe rodando por alguns minutos

### 5️⃣ Analisar Logs

Quando finalizar (CTRL+C), veja os arquivos em:
- `logs/raw-messages/messages-XXXX.json` - Todas as mensagens
- `logs/session-info.json` - Info da sessão
- `logs/combined.log` - Log completo

### 6️⃣ Compartilhar Resultados

Me envie trechos do arquivo `messages-XXXX.json` para análise!

---

## ❓ Problemas Comuns

**Erro de autenticação?**
- Confirme usuário e senha no `.env`

**Nenhuma mensagem?**
- Inicie um carregamento para forçar mensagens
- Verifique IDs em `chargers.json`

**WebSocket desconecta?**
- Verifique conexão de internet
- Tente `AUTO_RECONNECT=true`


