# 📊 Guia: Análise Manual de Mensagens

## 🎯 COMO USAR

Agora você pode capturar mensagens manualmente do Chrome (onde você já está autenticado) e o programa vai analisar!

---

## 📋 PASSO A PASSO

### **PASSO 1: Capturar Mensagens no Chrome**

1. **Abra o CVE-PRO** no Chrome (já logado)
2. **DevTools** (CMD + Option + I)
3. **Aba Network** → **WS** (WebSocket filter)
4. **Clique no websocket** ativo
5. **Aba "Messages"** → você verá mensagens em tempo real

### **PASSO 2: Copiar Mensagens**

#### Opção A: Copiar Todas (Recomendado)

1. **Clique com botão direito** na primeira mensagem
2. **"Copy All as HAR"** ou similar
3. Cole em um editor de texto
4. Salve como `captured-messages.json`

#### Opção B: Copiar Uma por Uma

1. **Clique em cada mensagem** (setas verdes ⬇ = recebidas)
2. Copie o conteúdo JSON
3. Cole em um arquivo

**Formato do arquivo:**

```json
[
  {
    "status": "Available",
    "connector": 1,
    "timestamp": "2026-01-04T..."
  },
  {
    "status": "Charging",
    "power": 7.4,
    "energy": 15.3
  }
]
```

Ou uma mensagem por linha:
```
{"status": "Available", "connector": 1}
{"status": "Charging", "power": 7.4}
```

### **PASSO 3: Salvar no Projeto**

Salve o arquivo como:
- `captured-messages.json` (JSON)
- ou `captured-messages.txt` (texto, uma mensagem por linha)

Na raiz do projeto:
```
VETRIC - CVE/
├── captured-messages.json  ← AQUI!
├── src/
├── logs/
...
```

### **PASSO 4: Executar Análise**

```bash
npm run manual
```

---

## 📊 O QUE O PROGRAMA FAZ

1. ✅ **Carrega** suas mensagens capturadas
2. ✅ **Analisa** a estrutura e campos
3. ✅ **Identifica** padrões (status, energia, usuário)
4. ✅ **Gera logs** estruturados em `logs/`
5. ✅ **Exibe resumo** no console

### Exemplo de Output:

```
╔═══════════════════════════════════════════════════════════╗
║     📊 VETRIC CVE - Analisador de Mensagens Manual       ║
╚═══════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ANÁLISE DAS MENSAGENS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ℹ Total de mensagens: 25
ℹ Tipos de mensagens: STATUS, METER_VALUES
ℹ Campos detectados: status, connector, power, energy, timestamp

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PADRÕES IDENTIFICADOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Estados detectados:
  • status: Available
  • status: Charging
  • status: Finishing

✓ Dados de energia encontrados
✓ Dados de usuário encontrados
```

---

## 🧪 TESTES RECOMENDADOS

Capture mensagens em diferentes cenários:

### Cenário 1: Carregador Livre
- Deixe um carregador livre
- Capture mensagens por 1-2 minutos

### Cenário 2: Iniciando Carregamento
- Inicie um carregamento com sua TAG
- Capture as primeiras mensagens

### Cenário 3: Durante Carregamento
- Deixe carregando por 5-10 minutos
- Capture mensagens periodicamente

### Cenário 4: Finalizando Carregamento
- Pare o carregamento
- Capture as últimas mensagens

### Cenário 5: Múltiplos Carregadores
- Inicie carregamento em 2-3 carregadores
- Capture mensagens de todos

---

## 💡 DICAS

### Para Capturar Muitas Mensagens:

1. Deixe DevTools aberto na aba Messages
2. Realize seus testes (iniciar/parar carregamentos)
3. Depois de alguns minutos, copie tudo

### Para Organizar:

Você pode criar múltiplos arquivos:
- `captured-livre.json` - mensagens quando livre
- `captured-carregando.json` - durante carregamento
- `captured-finalizando.json` - ao finalizar

E executar o analisador em cada um.

---

## 🎯 APÓS A ANÁLISE

Com os logs gerados, vou:

1. ✅ Entender completamente o protocolo
2. ✅ Documentar todos os campos
3. ✅ Mapear os estados possíveis
4. ✅ Criar o Dashboard VETRIC com base nisso
5. ✅ Implementar a FASE 2 completa!

---

## 🚀 COMEÇE AGORA

```bash
# 1. Capture mensagens do Chrome e salve em captured-messages.json
# 2. Execute:
npm run manual
```

---

**Esse método é MUITO mais simples e eficaz! 🎉**

