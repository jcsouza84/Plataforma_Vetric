/**
 * Script para executar seed de moradores Gran Marine
 * 
 * Uso: npm run seed:moradores
 */

import * as dotenv from 'dotenv';
import { initDatabase } from './src/config/database';
import { seedMoradoresGranMarine } from './src/seeds/seedMoradoresGranMarine';

dotenv.config();

async function main() {
  try {
    console.log('\n🚀 Iniciando seed de moradores Gran Marine...\n');
    
    // Inicializar banco
    await initDatabase();
    
    // Executar seed
    await seedMoradoresGranMarine();
    
    console.log('🎉 Seed executado com sucesso!\n');
    process.exit(0);
    
  } catch (error: any) {
    console.error('\n❌ Erro ao executar seed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();

