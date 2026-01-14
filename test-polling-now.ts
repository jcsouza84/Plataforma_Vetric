import axios from 'axios';

async function test() {
  try {
    // 1. Login
    const login = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@vetric.com.br',
      senha: 'Vetric@2026'
    });
    
    const token = login.data.data.token;
    console.log('✅ Login OK\n');
    
    // 2. Buscar carregadores
    const chargers = await axios.get('http://localhost:3001/api/dashboard/chargers', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`📊 ${chargers.data.data.length} carregadores encontrados:\n`);
    
    chargers.data.data.forEach((c: any, i: number) => {
      console.log(`${i + 1}. ${c.nome}`);
      console.log(`   UUID: ${c.uuid}`);
      console.log(`   Status: ${c.statusConector}`);
      console.log(`   Morador: ${c.morador ? `${c.morador.nome} (Apto ${c.morador.apartamento})` : '—'}`);
      console.log('');
    });
    
  } catch (error: any) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

test();

