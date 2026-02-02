# 🧪 SIMULADOR DE CARREGAMENTO - GUIA COMPLETO

**Versão:** 1.0  
**Data:** 02/02/2026  
**Status:** ✅ Funcional

---

## 📋 O QUE FAZ

Este simulador permite testar **TODO O FLUXO** de notificações sem depender de carregamentos reais:

1. ✅ **Cria carregamento** no banco (como se viesse do CVE)
2. ✅ **Simula tempo** (3 minutos em 5 segundos)
3. ✅ **Dispara notificação** (MOCK ou REAL)
4. ✅ **Verifica resultado** (logs, status)
5. ✅ **Limpa dados de teste** (opcional)

---

## 🚀 COMO USAR

### Executar:
```bash
cd "/Users/juliocesarsouza/Desktop/VETRIC - CVE"
./executar-simulacao-teste.sh
```

Ou diretamente:
```bash
npx ts-node simular-carregamento-teste.ts
```

---

## 🎯 MODOS DE TESTE

### 1️⃣ MOCK (Recomendado para testes)
- ✅ **NÃO envia WhatsApp real**
- ✅ Simula toda a lógica
- ✅ Mostra a mensagem que seria enviada
- ✅ Salva log no banco
- ✅ Seguro para testar à vontade

**Quando usar:**
- Testar lógica de disparo
- Verificar templates e placeholders
- Testar com múltiplos moradores
- Debug de problemas

### 2️⃣ REAL (Produção)
- 🚀 **Envia WhatsApp de verdade**
- 📱 Usa Evolution API real
- ⚠️ Mensagem chega no telefone
- ⚠️ Requer confirmação

**Quando usar:**
- Validar envio real
- Testar Evolution API
- Demonstração para cliente
- Validação final antes de produção

---

## 📊 FLUXO DO TESTE

```
1. Escolher Modo
   ├─ MOCK (simulado)
   └─ REAL (WhatsApp real)
        └─ Confirmação

2. Escolher Morador
   ├─ Lista moradores com telefone
   ├─ Mostra: nome, telefone, apto
   └─ Indica se notificações ativas

3. Escolher Carregador
   ├─ Gran Marine 1
   ├─ Gran Marine 2
   ├─ Gran Marine 3
   ├─ Gran Marine 5
   └─ Gran Marine 6

4. Criar Carregamento
   ├─ INSERT no banco
   ├─ Dados realistas
   └─ Timestamp atual

5. Simular Tempo
   ├─ Aguarda 5 segundos
   ├─ Simula 3 minutos
   └─ UPDATE timestamp no banco

6. Disparar Notificação
   ├─ MOCK: mostra mensagem
   └─ REAL: envia via Evolution

7. Verificar Resultado
   ├─ Status do carregamento
   ├─ Notificação enviada?
   └─ Logs no banco

8. Limpar (opcional)
   ├─ MOCK: pergunta se remove
   └─ REAL: mantém para auditoria
```

---

## 📸 EXEMPLO DE USO

### Modo MOCK:

```
╔═══════════════════════════════════════════════════════════════╗
║        🧪 SIMULADOR DE CARREGAMENTO - TESTE COMPLETO         ║
╚═══════════════════════════════════════════════════════════════╝

🎯 ESCOLHA O MODO DE TESTE:

1️⃣  MOCK    - Simula envio (não envia WhatsApp real)
2️⃣  REAL    - Envia WhatsApp de verdade via Evolution API

Digite 1 (MOCK) ou 2 (REAL): 1

✅ Modo MOCK selecionado - NÃO enviará WhatsApp real

📋 MORADORES DISPONÍVEIS PARA TESTE:

1. Saulo Levi Xaviei da Silva
   📞 +5582996176797
   🏢 Apto 1303-B
   🔔 Notificações: ✅

2. Luciano Midlej Joaquim Patury
   📞 +5582996176797
   🏢 Apto 604-A
   🔔 Notificações: ✅

Digite o número do morador: 1

✅ Morador selecionado: Saulo Levi Xaviei da Silva

🔌 CARREGADORES DISPONÍVEIS:

1. Gran Marine 1
2. Gran Marine 2
3. Gran Marine 3
4. Gran Marine 5
5. Gran Marine 6

Digite o número do carregador: 2

✅ Carregador selecionado: Gran Marine 2

🔄 Criando carregamento de teste...
✅ Carregamento criado com ID: 180
   📍 Charger: Gran Marine 2
   👤 Morador ID: 13
   🕐 Início: 2026-02-02T11:30:00

⏰ SIMULANDO PASSAGEM DE TEMPO...
   (Na prática, o sistema aguarda 3 minutos)
   (Neste teste, aguardaremos apenas 5 segundos)

⏳ Aguardando 5 segundos (tempo mínimo para notificação)...
   5s restante(s)...
   4s restante(s)...
   3s restante(s)...
   2s restante(s)...
   1s restante(s)...
   ✅ Tempo decorrido!

📱 Disparando notificação...
   👤 Para: Saulo Levi Xaviei da Silva
   📞 Telefone: +5582996176797
   🏢 Apartamento: 1303-B
   🧪 Modo: MOCK (não envia WhatsApp real)

📄 MENSAGEM QUE SERIA ENVIADA:
────────────────────────────────────────────────────────────
🔋 Olá Saulo Levi Xaviei da Silva!

Seu carregamento foi iniciado no Gran Marine 2.

📍 Local: General Luiz de França Albuquerque, Maceió
🕐 Início: 02/02/2026, 11:30:00
🏢 Apartamento: 1303-B

Acompanhe pelo dashboard VETRIC Gran Marine!
────────────────────────────────────────────────────────────

✅ [MOCK] Notificação simulada com sucesso!
   💾 Log salvo no banco de dados

🔍 Verificando status da notificação...

📊 STATUS DO CARREGAMENTO:
   ID: 180
   Morador: Saulo Levi Xaviei da Silva
   Charger: Gran Marine 2
   Notificação enviada: ✅ SIM
   Status: carregando
   Início: 02/02/2026, 11:26:00

📝 ÚLTIMO LOG DE NOTIFICAÇÃO:
   Tipo: inicio
   Status: enviado
   Enviado em: 02/02/2026, 11:30:05

╔═══════════════════════════════════════════════════════════════╗
║                  📊 RESUMO DO TESTE                           ║
╚═══════════════════════════════════════════════════════════════╝

✅ Morador: Saulo Levi Xaviei da Silva
✅ Telefone: +5582996176797
✅ Carregador: Gran Marine 2
✅ Carregamento criado: ID 180
✅ Notificação: ENVIADA
✅ Modo: MOCK (simulado)

🗑️  Deseja remover o carregamento de teste? (s/N): s
✅ Carregamento de teste removido

✅ Teste concluído com sucesso!
```

---

## 🔍 O QUE É TESTADO

### ✅ Lógica Completa:
- [x] Criação de carregamento no banco
- [x] Associação morador ↔ carregamento
- [x] Verificação de tempo mínimo (3 min)
- [x] Busca de template no banco
- [x] Renderização de placeholders
- [x] Verificação de notificações ativas
- [x] Verificação de telefone válido
- [x] Envio de notificação
- [x] Marcação de notificação enviada
- [x] Criação de log no banco

### ⚠️ NÃO Testa:
- [ ] Polling do CVE (usa dados simulados)
- [ ] WebSocket do CVE
- [ ] Identificação automática por RFID
- [ ] Consumo de energia real
- [ ] Finalização de carregamento

---

## 📊 VERIFICAÇÕES PÓS-TESTE

### No Banco de Dados:

```sql
-- Verificar carregamento criado
SELECT * FROM carregamentos 
WHERE id = 180;  -- ID mostrado no teste

-- Verificar log de notificação
SELECT * FROM logs_notificacoes 
WHERE morador_id = 13  -- ID do morador
ORDER BY criado_em DESC LIMIT 1;

-- Verificar se marcou como enviada
SELECT 
  id,
  charger_name,
  morador_id,
  notificacao_inicio_enviada,
  inicio
FROM carregamentos 
WHERE id = 180;
```

### No WhatsApp (modo REAL):
- Abrir WhatsApp no telefone do morador
- Verificar se mensagem chegou
- Confirmar conteúdo correto
- Verificar formatação

---

## 🛡️ SEGURANÇA

### Modo MOCK:
- ✅ Totalmente seguro
- ✅ Não envia mensagens reais
- ✅ Pode testar à vontade
- ✅ Remove dados após teste

### Modo REAL:
- ⚠️ Envia WhatsApp real
- ⚠️ Consome quota da Evolution API
- ⚠️ Mensagem vai para telefone real
- ⚠️ Requer confirmação explícita
- ✅ Mantém auditoria no banco

---

## 🐛 TROUBLESHOOTING

### Erro: "Nenhum morador encontrado"
**Causa:** Sem moradores com telefone cadastrado  
**Solução:** Adicionar telefone em pelo menos 1 morador

### Erro: "Template não encontrado"
**Causa:** Templates não criados no banco  
**Solução:** Executar migrations ou `npm run db:init`

### Erro: "Evolution API não configurada"
**Causa:** Faltam configurações no banco  
**Solução:** Verificar `configuracoes_sistema` table

### Erro: "Falha ao enviar" (modo REAL)
**Causa:** Evolution API offline ou erro de rede  
**Solução:** 
1. Verificar URL da Evolution API
2. Verificar API Key
3. Testar em modo MOCK primeiro

---

## 📈 CASOS DE USO

### 1. Validar Correções de Código
```bash
# Após corrigir NotificationService
./executar-simulacao-teste.sh
# Escolher MOCK
# Verificar se mensagem está correta
```

### 2. Testar Novo Template
```bash
# Após alterar template no banco
./executar-simulacao-teste.sh
# Escolher MOCK
# Verificar renderização de placeholders
```

### 3. Demonstração para Cliente
```bash
# Mostrar funcionamento ao vivo
./executar-simulacao-teste.sh
# Escolher REAL
# Cliente recebe WhatsApp imediatamente
```

### 4. Debug de Problema
```bash
# Problema: "Notificações não chegam"
./executar-simulacao-teste.sh
# Escolher MOCK
# Ver exatamente onde falha
```

---

## 🎯 INTEGRAÇÃO COM TESTES

### Rodar antes de deploy:
```bash
# 1. Testar triggers
./executar-teste-triggers.sh

# 2. Simular carregamento
./executar-simulacao-teste.sh
# (escolher MOCK)

# 3. Se ambos passarem → OK para deploy
```

### Rodar após deploy:
```bash
# 1. Simular em produção (REAL)
./executar-simulacao-teste.sh
# (escolher REAL)

# 2. Verificar WhatsApp
# 3. Confirmar logs no Render
```

---

## 📝 LOGS E AUDITORIA

### Logs Criados:
1. **Carregamento** (`carregamentos` table)
   - ID, morador, charger, timestamps
   - Flag `notificacao_inicio_enviada`

2. **Log de Notificação** (`logs_notificacoes` table)
   - Morador, tipo, mensagem, status
   - Timestamp, telefone, erro (se houver)

### Consultar Histórico:
```sql
SELECT 
  l.id,
  m.nome,
  l.tipo,
  l.status,
  l.criado_em
FROM logs_notificacoes l
JOIN moradores m ON l.morador_id = m.id
WHERE l.tipo = 'inicio'
ORDER BY l.criado_em DESC
LIMIT 10;
```

---

## 🔄 PRÓXIMAS MELHORIAS

**v1.1 (Futuro):**
- [ ] Simular eventos 2, 3, 4 (ociosidade, bateria cheia, interrupção)
- [ ] Modo batch (testar múltiplos moradores de uma vez)
- [ ] Gerar relatório HTML dos testes
- [ ] Integração com CI/CD
- [ ] Screenshot da mensagem enviada

---

## ✅ CHECKLIST PRÉ-TESTE

Antes de executar o simulador, verificar:

- [ ] Banco de dados acessível
- [ ] Moradores cadastrados com telefone
- [ ] Templates criados (`inicio_recarga`)
- [ ] Evolution API configurada (para modo REAL)
- [ ] Variáveis de ambiente (.env)

---

**Criado por:** Cursor AI  
**Data:** 02/02/2026  
**Versão:** 1.0  
**Status:** ✅ Pronto para uso
