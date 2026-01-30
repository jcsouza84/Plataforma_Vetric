# ✅ Checklist de Testes do Discovery Tool

Use este checklist para garantir que coletou todas as informações necessárias.

## Antes de Executar

- [ ] Node.js 18+ instalado
- [ ] Arquivo `.env` criado e configurado com credenciais corretas
- [ ] Arquivo `chargers.json` com IDs corretos dos 6 carregadores
- [ ] Acesso ao CVE-PRO funcionando (teste no navegador)

## Durante a Execução

### Teste 1: Conexão Inicial
- [ ] Discovery Tool conectou com sucesso
- [ ] Login realizado sem erros
- [ ] WebSocket STOMP conectado
- [ ] Todos os 6 carregadores subscritos

### Teste 2: Estado Livre/Disponível
- [ ] Deixar todos os carregadores livres
- [ ] Aguardar 2-3 minutos
- [ ] Verificar se chegam mensagens (mesmo sem atividade)
- [ ] Anotar: Mensagens chegam periodicamente mesmo sem uso? _____ (Sim/Não)

### Teste 3: Estado Ocupado/Carregando
- [ ] Iniciar carregamento em um carregador com sua TAG RFID
- [ ] Observar mensagens no console
- [ ] Verificar se aparece:
  - [ ] Status de "carregando" ou similar
  - [ ] Identificação do usuário (nome ou TAG)
  - [ ] kWh sendo consumidos
  - [ ] Tempo decorrido
- [ ] Deixar carregando por 5-10 minutos
- [ ] Anotar: Frequência das mensagens durante carregamento: _____ (ex: a cada 10s)

### Teste 4: Início e Fim de Carregamento
- [ ] Observar mensagens ao iniciar carregamento
- [ ] Observar mensagens ao parar carregamento
- [ ] Anotar: Há mensagem específica de início? _____ (Sim/Não)
- [ ] Anotar: Há mensagem específica de fim? _____ (Sim/Não)

### Teste 5: Estado Ocioso (se possível)
- [ ] Conectar cabo no veículo mas não iniciar carregamento
- [ ] Verificar se há status diferente de "livre"
- [ ] Anotar: Sistema diferencia "conectado" de "livre"? _____ (Sim/Não)

### Teste 6: Múltiplos Carregadores
- [ ] Iniciar carregamento em 2-3 carregadores simultaneamente
- [ ] Verificar se mensagens de todos chegam
- [ ] Anotar: Mensagens vêm misturadas ou separadas por carregador? _____

### Teste 7: Falhas (se possível testar com segurança)
- [ ] Desconectar cabo durante carregamento
- [ ] Observar se há mensagem de erro ou mudança de status
- [ ] Anotar: Como falhas são reportadas? _____

## Após a Execução

- [ ] Finalizar com CTRL+C
- [ ] Verificar se arquivos foram criados em `logs/`
- [ ] Executar análise: `npm run analyze`
- [ ] Revisar arquivo `logs/raw-messages/messages-XXXX.json`

## Perguntas para Responder

Após os testes, tente responder:

1. **Formato das mensagens:**
   - [ ] Mensagens são JSON? XML? Texto puro?
   - [ ] Qual é a estrutura básica?

2. **Campo de status:**
   - [ ] Como se chama o campo que indica o status? (ex: `status`, `state`)
   - [ ] Quais valores possíveis? (ex: "Available", "Charging", etc)

3. **Identificação do usuário:**
   - [ ] Aparece nome do morador?
   - [ ] Aparece ID da TAG?
   - [ ] Qual nome do campo? (ex: `userName`, `idTag`)

4. **Dados de energia:**
   - [ ] Aparece kWh consumidos?
   - [ ] Aparece potência atual (kW)?
   - [ ] Qual nome dos campos?

5. **Dados de tempo:**
   - [ ] Aparece timestamp?
   - [ ] Aparece duração/tempo decorrido?
   - [ ] Formato das datas? (ex: ISO 8601)

6. **Frequência das mensagens:**
   - [ ] Com que frequência as mensagens chegam?
   - [ ] Frequência muda durante carregamento?

## Compartilhar com o Desenvolvedor

Após completar os testes, compartilhe:

- [ ] Arquivo `logs/raw-messages/messages-XXXX.json` (pode mascarar dados pessoais)
- [ ] Screenshots do console durante execução
- [ ] Respostas às perguntas acima
- [ ] Qualquer observação adicional

## Observações e Notas

```
(Use este espaço para anotar qualquer coisa relevante durante os testes)








```

---

**Data dos testes:** _______________  
**Testado por:** _______________  
**Duração total:** _______________




