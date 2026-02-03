/**
 * 🎮 VETRIC - Simulador de Carregamento CVE-PRO
 * 
 * Simula carregamentos completos para testes em ambiente LOCAL
 * ⚠️ NÃO USAR EM PRODUÇÃO!
 */

import { CVEChargePoint, CVETransaction } from '../types';
import { config } from '../config/env';

interface SimulationState {
  isRunning: boolean;
  currentChargerIndex: number;
  currentPhase: 'idle' | 'starting' | 'charging' | 'idling' | 'full' | 'interrupted';
  startTime: number;
  chargers: SimulatedCharger[];
  transactions: Map<string, CVETransaction>;
}

interface SimulatedCharger {
  uuid: string;
  name: string;
  status: 'Available' | 'Charging';
  power: number;
  idTag: string | null;
  transactionId: number | null;
  startTime: number | null;
}

export class SimulatorService {
  private state: SimulationState;
  private intervalId: NodeJS.Timeout | null = null;
  
  // Tag RFID da VETRIC (do banco de dados)
  private readonly VETRIC_TAG = '87BA5C4E';
  
  // UUIDs dos 5 carregadores Gran Marine
  private readonly CHARGER_UUIDS = [
    '1122905020', // Gran Marine 2
    '1122905030', // Gran Marine 3
    '1122905050', // Gran Marine 4
    '1122905060', // Gran Marine 5
    '1122905070', // Gran Marine 6
  ];

  constructor() {
    this.state = {
      isRunning: false,
      currentChargerIndex: 0,
      currentPhase: 'idle',
      startTime: 0,
      chargers: [],
      transactions: new Map(),
    };
    
    this.initializeChargers();
  }

  /**
   * Verificar se simulador pode rodar
   */
  private checkEnvironment(): void {
    // Bloquear em produção
    if (process.env.NODE_ENV === 'production') {
      throw new Error('❌ SIMULADOR NÃO PERMITIDO EM PRODUÇÃO!');
    }

    // Verificar se está habilitado
    if (process.env.ENABLE_SIMULATOR !== 'true') {
      throw new Error('❌ Simulador desabilitado! Configure ENABLE_SIMULATOR=true no .env');
    }
  }

  /**
   * Inicializar carregadores simulados
   */
  private initializeChargers(): void {
    this.state.chargers = this.CHARGER_UUIDS.map((uuid, index) => ({
      uuid,
      name: `Gran Marine ${index + 2}`,
      status: 'Available',
      power: 0,
      idTag: null,
      transactionId: null,
      startTime: null,
    }));
  }

  /**
   * Obter chargers simulados (formato CVE)
   */
  getSimulatedChargers(): CVEChargePoint[] {
    return this.state.chargers.map((charger, index) => ({
      chargeBoxPk: 1000 + index,
      chargeBoxId: `CHARGER_${index + 2}`,
      uuid: charger.uuid,
      description: charger.name,
      lastHeartbeatTimestamp: new Date().toISOString(),
      locationLatitude: -9.6658,
      locationLongitude: -35.7353,
      connectors: [
        {
          connectorPk: 2000 + index,
          connectorId: 1,
          powerMax: 22000,
          connectorUuid: `${charger.uuid}-1`,
          lastStatus: {
            timeStamp: new Date().toISOString(),
            errorCode: 'NoError',
            status: charger.status,
            usage: charger.power > 0 ? Math.floor(Math.random() * 1000) : 0,
            totalDuration: charger.startTime ? Math.floor((Date.now() - charger.startTime) / 1000) : 0,
            socPercentage: charger.power > 0 ? Math.min(100, Math.floor(Math.random() * 100)) : null,
            currentChargingUserName: charger.status === 'Charging' ? 'Vetric' : null,
            idTag: charger.idTag || undefined,
            power: charger.power,
          },
          connectorType: 'Type2',
          currentType: 'AC',
          speed: 'FAST',
          chargeBoxUuid: charger.uuid,
        },
      ],
      address: {
        street: 'Rua Exemplo',
        houseNumber: '123',
        zipCode: '57000-000',
        city: 'Maceió',
        state: 'AL',
        country: 'Brasil',
      },
      usage: 0,
      monthConsumption: 0,
      active: true,
      chargePointVendor: 'ABB',
      chargePointModel: 'Terra AC',
      fwVersion: '1.0.0',
      speedCount: {
        nrSlowTotal: 0,
        nrSlowAvailable: 0,
        nrFastTotal: 1,
        nrFastAvailable: charger.status === 'Available' ? 1 : 0,
      },
    }));
  }

  /**
   * Obter transações ativas simuladas (formato CVE)
   */
  getSimulatedTransactions(): CVETransaction[] {
    const activeTransactions: CVETransaction[] = [];

    this.state.chargers.forEach((charger, index) => {
      if (charger.status === 'Charging' && charger.transactionId) {
        const duration = charger.startTime ? Math.floor((Date.now() - charger.startTime) / 1000) : 0;
        const energy = Math.floor(charger.power * duration / 3600); // Wh

        activeTransactions.push({
          id: charger.transactionId,
          transactionPk: charger.transactionId,
          transactionId: charger.transactionId,
          connectorId: 1,
          connectorPk: 2000 + index,
          chargeBoxPk: 1000 + index,
          chargeBoxUuid: charger.uuid,
          chargeBoxId: `CHARGER_${index + 2}`,
          chargeBoxDescription: charger.name,
          ocppIdTag: this.VETRIC_TAG,
          ocppTagPk: 1,
          startTimestamp: new Date(charger.startTime!).toLocaleString('pt-BR'),
          stopTimestamp: null,
          duration,
          durationHumanReadable: this.formatDuration(duration),
          durationTime: this.formatDuration(duration),
          energy,
          energyHumanReadable: `${(energy / 1000).toFixed(4)} kWh`,
          startValue: '0',
          stopValue: null,
          userName: 'Vetric',
          userPhone: '+5582996176797',
          userEmail: null,
          userDocNumber: null,
          userDocType: null,
          userAddressComplement: '001-A',
          userAddressStreet: 'Rua Exemplo',
          userAddressHouseNumber: '123',
          userAddressCity: 'Maceió',
          userAddressState: 'AL',
          userUuid: 'vetric-uuid',
          userPk: 1,
          addressStreet: 'Rua Exemplo',
          addressHouseNumber: '123',
          addressCity: 'Maceió',
          addressState: 'AL',
          addressComplement: null,
          cost: null,
          costHumanReadable: null,
          income: null,
          incomeHumanReadable: null,
          idleDuration: null,
          idleDurationHumanReadable: null,
          autonomy: null,
          autonomyHumanReadable: null,
          environIndicator: null,
          environIndicatorHumanReadable: null,
          km: null,
          kmKWh: 0,
          kmKWhHumanReadable: '0',
          stopReason: null,
          stopEventActor: null,
          origin: 'SIMULATOR',
          hasPayment: false,
          isPaid: null,
          connectorTypeName: 'Type2',
          uuid: `transaction-${charger.transactionId}`,
        });
      }
    });

    return activeTransactions;
  }

  /**
   * Formatar duração em HH:MM:SS
   */
  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Iniciar simulação sequencial
   */
  async startSequentialSimulation(): Promise<void> {
    this.checkEnvironment();

    if (this.state.isRunning) {
      throw new Error('Simulação já está em execução!');
    }

    console.log('🎮 ========================================');
    console.log('🎮 INICIANDO SIMULAÇÃO SEQUENCIAL');
    console.log('🎮 ========================================');
    console.log('📋 Tag RFID: ' + this.VETRIC_TAG);
    console.log('🔌 Carregadores: 5 (Gran Marine 2, 3, 4, 5, 6)');
    console.log('⏱️  Duração total: ~25 minutos');
    console.log('🎮 ========================================\n');

    this.state.isRunning = true;
    this.state.currentChargerIndex = 0;
    this.state.startTime = Date.now();

    // Executar simulação
    await this.runSequentialSimulation();
  }

  /**
   * Executar simulação sequencial
   */
  private async runSequentialSimulation(): Promise<void> {
    for (let i = 0; i < this.CHARGER_UUIDS.length; i++) {
      this.state.currentChargerIndex = i;
      const charger = this.state.chargers[i];

      console.log(`\n🔌 ========== ${charger.name} (${i + 1}/5) ==========\n`);

      // 1. INÍCIO DE CARGA (Available → Charging)
      await this.simulatePhase(charger, 'starting', 0);

      // 2. CARREGANDO NORMALMENTE (5 minutos)
      await this.simulatePhase(charger, 'charging', 300); // 5 min

      // 3. INÍCIO DE OCIOSIDADE (Power cai para 5W)
      await this.simulatePhase(charger, 'idling', 60); // 1 min

      // 4. BATERIA CHEIA (3 minutos em ociosidade)
      await this.simulatePhase(charger, 'full', 180); // 3 min

      // 5. INTERRUPÇÃO (Charging → Available)
      await this.simulatePhase(charger, 'interrupted', 0);

      console.log(`✅ ${charger.name} - Simulação completa!\n`);

      // Aguardar 10 segundos antes do próximo carregador
      if (i < this.CHARGER_UUIDS.length - 1) {
        console.log('⏳ Aguardando 10 segundos antes do próximo carregador...\n');
        await this.sleep(10000);
      }
    }

    console.log('\n🎉 ========================================');
    console.log('🎉 SIMULAÇÃO COMPLETA!');
    console.log('🎉 ========================================');
    console.log(`✅ 5 carregadores simulados`);
    console.log(`✅ Duração total: ${Math.floor((Date.now() - this.state.startTime) / 60000)} minutos`);
    console.log('🎉 ========================================\n');

    this.state.isRunning = false;
  }

  /**
   * Simular uma fase
   */
  private async simulatePhase(
    charger: SimulatedCharger,
    phase: SimulationState['currentPhase'],
    durationSeconds: number
  ): Promise<void> {
    this.state.currentPhase = phase;

    switch (phase) {
      case 'starting':
        console.log(`⚡ INÍCIO DE CARGA`);
        console.log(`   Status: Available → Charging`);
        console.log(`   idTag: ${this.VETRIC_TAG}`);
        console.log(`   Power: 7200W`);
        
        charger.status = 'Charging';
        charger.power = 7200;
        charger.idTag = this.VETRIC_TAG;
        charger.transactionId = Date.now();
        charger.startTime = Date.now();
        
        console.log(`   ✅ Carregamento iniciado!\n`);
        break;

      case 'charging':
        console.log(`🔋 CARREGANDO NORMALMENTE (${durationSeconds / 60} min)`);
        console.log(`   Power: 7200W → 7150W`);
        
        const chargingSteps = 10;
        const chargingInterval = (durationSeconds * 1000) / chargingSteps;
        
        for (let i = 0; i < chargingSteps; i++) {
          charger.power = 7200 - (i * 5); // Reduz 5W a cada step
          await this.sleep(chargingInterval);
          
          if (i % 3 === 0) {
            console.log(`   ⏱️  ${Math.floor((i + 1) * durationSeconds / chargingSteps)}s - Power: ${charger.power}W`);
          }
        }
        
        console.log(`   ✅ Fase de carregamento completa!\n`);
        break;

      case 'idling':
        console.log(`⚠️  INÍCIO DE OCIOSIDADE`);
        console.log(`   Power: 7150W → 5W`);
        
        charger.power = 5;
        await this.sleep(durationSeconds * 1000);
        
        console.log(`   ✅ Ociosidade detectada!\n`);
        break;

      case 'full':
        console.log(`🔋 BATERIA CHEIA (${durationSeconds / 60} min em ociosidade)`);
        console.log(`   Power: 5W (mantido)`);
        
        await this.sleep(durationSeconds * 1000);
        
        console.log(`   ✅ Bateria cheia confirmada!\n`);
        break;

      case 'interrupted':
        console.log(`⛔ INTERRUPÇÃO`);
        console.log(`   Status: Charging → Available`);
        
        charger.status = 'Available';
        charger.power = 0;
        charger.idTag = null;
        charger.transactionId = null;
        charger.startTime = null;
        
        console.log(`   ✅ Carregamento interrompido!\n`);
        break;
    }
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Parar simulação
   */
  stopSimulation(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.state.isRunning = false;
    this.initializeChargers();
    
    console.log('🛑 Simulação parada!\n');
  }

  /**
   * Obter status da simulação
   */
  getStatus() {
    return {
      isRunning: this.state.isRunning,
      currentChargerIndex: this.state.currentChargerIndex,
      currentPhase: this.state.currentPhase,
      currentCharger: this.state.chargers[this.state.currentChargerIndex],
      chargers: this.state.chargers,
      elapsedTime: this.state.startTime > 0 ? Date.now() - this.state.startTime : 0,
    };
  }

  /**
   * Verificar se está rodando
   */
  isRunning(): boolean {
    return this.state.isRunning;
  }
}

// Singleton
export const simulatorService = new SimulatorService();
