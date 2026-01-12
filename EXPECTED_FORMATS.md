# 📊 Análise de Formatos Esperados

Este documento descreve os possíveis formatos de mensagens que esperamos encontrar do CVE-PRO.

## Formato Geral das Mensagens

Baseado no protocolo STOMP sobre WebSocket, esperamos mensagens com esta estrutura:

```json
{
  "timestamp": "2026-01-03T14:30:00.000Z",
  "type": "MESSAGE",
  "destination": "/topic/status/chargeBox/{CHARGEBOX_ID}/connector/{CONNECTOR_ID}",
  "charger": "Gran Marine 1",
  "chargerId": "JDBM1900145Z6",
  "connectorId": 1,
  "headers": {
    "destination": "/topic/status/chargeBox/...",
    "content-type": "application/json",
    "subscription": "sub-0",
    "message-id": "..."
  },
  "body": {
    // Dados do carregador aqui
  }
}
```

## Possíveis Campos no Body

Com base em sistemas OCPP (Open Charge Point Protocol) que o CVE-PRO provavelmente usa:

### Status do Conector

```json
{
  "connectorId": 1,
  "status": "Available",  // ou "Occupied", "Charging", "Faulted", "Unavailable"
  "timestamp": "2026-01-03T14:30:00Z",
  "errorCode": "NoError"  // ou outros códigos de erro
}
```

### Durante Carregamento

```json
{
  "connectorId": 1,
  "status": "Charging",
  "transactionId": 12345,
  "idTag": "TAG123456",  // ID da TAG RFID
  "userId": "MORADOR_001",  // Se disponível
  "userName": "João Silva",  // Se disponível
  "meterStart": 1234567,
  "meterValue": 1234580,  // Valor atual
  "energyActiveImportRegister": 13.5,  // kWh
  "powerActiveImport": 7.4,  // kW atual
  "timestamp": "2026-01-03T14:35:00Z",
  "startTime": "2026-01-03T14:30:00Z",
  "duration": 300  // segundos
}
```

### Livre/Disponível

```json
{
  "connectorId": 1,
  "status": "Available",
  "timestamp": "2026-01-03T14:30:00Z",
  "errorCode": "NoError"
}
```

### Ocupado mas não carregando

```json
{
  "connectorId": 1,
  "status": "Occupied",  // ou "Preparing"
  "idTag": "TAG123456",
  "timestamp": "2026-01-03T14:30:00Z"
}
```

### Em Falha

```json
{
  "connectorId": 1,
  "status": "Faulted",
  "errorCode": "ConnectorLockFailure",  // ou outros códigos
  "errorInfo": "Falha ao travar conector",
  "timestamp": "2026-01-03T14:30:00Z"
}
```

## Estados Possíveis (OCPP)

- **Available**: Disponível para uso
- **Occupied**: Ocupado (cabo conectado mas não carregando)
- **Charging**: Carregando
- **Preparing**: Preparando para carregar
- **Finishing**: Finalizando carregamento
- **SuspendedEV**: Suspenso pelo veículo
- **SuspendedEVSE**: Suspenso pela estação
- **Faulted**: Com falha
- **Unavailable**: Indisponível
- **Reserved**: Reservado

## Códigos de Erro Comuns (OCPP)

- **NoError**: Sem erro
- **ConnectorLockFailure**: Falha na trava
- **EVCommunicationError**: Erro de comunicação com veículo
- **GroundFailure**: Falha de aterramento
- **HighTemperature**: Temperatura alta
- **InternalError**: Erro interno
- **LocalListConflict**: Conflito de lista local
- **OtherError**: Outro erro
- **OverCurrentFailure**: Sobrecorrente
- **PowerMeterFailure**: Falha no medidor
- **UnderVoltage**: Subtensão
- **OverVoltage**: Sobretensão
- **WeakSignal**: Sinal fraco

## O Que Procurar nos Logs

Ao analisar os logs coletados, procure:

1. **Campo de Status:**
   - `status`, `state`, `chargePointStatus`, `connectorStatus`

2. **Identificação do Usuário:**
   - `idTag`, `userId`, `userName`, `tagId`, `rfidTag`

3. **Dados de Energia:**
   - `energy`, `kWh`, `meterValue`, `energyActiveImportRegister`
   - `power`, `powerActiveImport`, `activePower`

4. **Dados de Tempo:**
   - `timestamp`, `startTime`, `duration`, `elapsedTime`

5. **Transação:**
   - `transactionId`, `sessionId`

6. **Erros:**
   - `errorCode`, `errorInfo`, `errorMessage`

## Notas Importantes

- O CVE-PRO pode usar nomes de campos diferentes dos padrões OCPP
- Alguns campos podem estar em português
- A estrutura exata só será conhecida após executar o Discovery Tool
- Nem todos os campos podem estar presentes em todas as mensagens
- Mensagens podem vir em diferentes formatos dependendo do evento

## Próximos Passos

1. Execute o Discovery Tool: `npm run dev`
2. Colete mensagens em diferentes cenários
3. Analise os logs: `npm run analyze`
4. Compare com os formatos descritos aqui
5. Documente os formatos reais encontrados


