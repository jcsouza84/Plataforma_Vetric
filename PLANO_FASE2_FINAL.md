# 🚀 VETRIC - Plano FINAL da Fase 2

## 📅 Estimativa: 2-3 dias (20 horas)
## 🎯 Objetivo: Sistema operacional completo para Gran Marine

---

## 📊 ESCOPO DEFINIDO DA FASE 2

### ✅ O que faremos:
1. **Seed de Moradores** - População do banco com lista fornecida
2. **Dashboard com Identificação** - Mostrar quem está carregando em tempo real
3. **Visualização de Moradores** - Cliente vê lista (read-only), Admin edita
4. **Sistema de Relatórios PDF** - Upload/Download de PDFs prontos (1 por mês)
5. **Templates WhatsApp** - 5 templates editáveis com sugestões padrão
6. **Notificações Automáticas** - Todos os 5 tipos de notificação

### ❌ O que NÃO faremos (escopo reduzido):
- ❌ Geração automática de relatórios
- ❌ Gráficos e filtros complexos
- ❌ Importação CSV/Excel com interface
- ❌ Upload de fotos de moradores
- ❌ Detalhes individuais de morador com histórico

---

## 🎯 FEATURE #1: SEED DE MORADORES

### Objetivo
Popular banco de dados com lista completa de moradores do Gran Marine fornecida pelo cliente.

### Implementação

#### 1.1. Você me envia a lista

**Formato aceito (qualquer um):**
```
Opção 1 - Tabela:
Nome                | Apartamento | Tag RFID          | Telefone
--------------------|-------------|-------------------|----------------
João Silva          | 101         | 04E2A3B1C5D6F8   | +5582999999999
Maria Santos        | 102         | 05F3B4C2D7E9A1   | +5582988888888
Pedro Oliveira      | 103         | 06A4C5D3E8F1B2   | +5582977777777

Opção 2 - Excel/CSV:
(você envia o arquivo, eu converto)

Opção 3 - Texto simples:
João Silva, 101, 04E2A3B1C5D6F8, +5582999999999
Maria Santos, 102, 05F3B4C2D7E9A1, +5582988888888
```

**Campos necessários:**
- Nome completo (mínimo)
- Apartamento/Unidade
- Tag RFID (identificação única)
- Telefone (WhatsApp) - formato: +5582999999999

**Campos opcionais:**
- E-mail
- Notificações ativas (padrão: SIM)

#### 1.2. Eu crio o script de seed

```typescript
// backend/src/seeds/seedMoradoresGranMarine.ts

export async function seedMoradoresGranMarine() {
  console.log('🌱 Populando moradores Gran Marine...');
  
  const moradores = [
    { nome: 'João Silva', apartamento: '101', tag_rfid: '04E2A3B1C5D6F8', telefone: '+5582999999999' },
    { nome: 'Maria Santos', apartamento: '102', tag_rfid: '05F3B4C2D7E9A1', telefone: '+5582988888888' },
    // ... resto da lista
  ];
  
  for (const m of moradores) {
    await Morador.create({
      ...m,
      notificacoes_ativas: true
    });
  }
  
  console.log(`✅ ${moradores.length} moradores cadastrados!`);
}
```

#### 1.3. Executar seed

```bash
# Comando para popular banco
npm run seed:moradores
```

### Tempo Estimado: 1 hora
- Receber e formatar lista: 15min
- Criar script de seed: 30min
- Executar e validar: 15min

---

## 👥 FEATURE #2: VISUALIZAÇÃO DE MORADORES

### Objetivo
Permitir que Cliente veja lista de moradores (read-only) e Admin possa editar.

### Funcionalidades

#### 2.1. Página de Moradores - Visão CLIENTE
```
URL: /usuarios
Acesso: CLIENTE (somente leitura)
```

**Interface:**
```
╔═══════════════════════════════════════════════════════════╗
║  MORADORES DO CONDOMÍNIO                                  ║
╠═══════════════════════════════════════════════════════════╣
║  📊 Estatísticas                                          ║
║     150 moradores | 145 tags vinculadas | 130 com WhatsApp║
╠═══════════════════════════════════════════════════════════╣
║  🔍 Buscar: [_____________________] 🔎                    ║
╠═══════════════════════════════════════════════════════════╣
║  Nome              | Apt  | Tag RFID      | WhatsApp      ║
║  ─────────────────────────────────────────────────────────║
║  João Silva        | 101  | 04E2...6F8    | ✅ Ativo     ║
║  Maria Santos      | 102  | 05F3...9A1    | ✅ Ativo     ║
║  Pedro Oliveira    | 103  | 06A4...1B2    | ❌ Inativo   ║
║  ...                                                      ║
╠═══════════════════════════════════════════════════════════╣
║  [❌ SEM BOTÕES DE AÇÃO - SOMENTE VISUALIZAÇÃO]           ║
╚═══════════════════════════════════════════════════════════╝
```

**Recursos:**
- ✅ Busca por nome/apartamento
- ✅ Paginação (20 por página)
- ✅ Ordenação por nome/apartamento
- ✅ Ver quantos moradores cadastrados
- ❌ SEM botão "Adicionar"
- ❌ SEM botão "Editar"
- ❌ SEM botão "Deletar"

#### 2.2. Página de Moradores - Visão ADMIN VETRIC
```
URL: /usuarios
Acesso: ADMIN (role = 'ADMIN')
```

**Interface:**
```
╔═══════════════════════════════════════════════════════════╗
║  MORADORES DO CONDOMÍNIO                    [+ Adicionar] ║
╠═══════════════════════════════════════════════════════════╣
║  🔍 Buscar: [_____________________] 🔎                    ║
╠═══════════════════════════════════════════════════════════╣
║  Nome           | Apt | Tag        | WhatsApp | Ações     ║
║  ────────────────────────────────────────────────────────║
║  João Silva     | 101 | 04E2...6F8 | ✅ Ativo | [✏️] [🗑️]║
║  Maria Santos   | 102 | 05F3...9A1 | ✅ Ativo | [✏️] [🗑️]║
║  Pedro Oliveira | 103 | 06A4...1B2 | ❌ Inati | [✏️] [🗑️]║
╚═══════════════════════════════════════════════════════════╝
```

**Recursos:**
- ✅ Todos os recursos do Cliente +
- ✅ Botão "Adicionar Morador"
- ✅ Botão "Editar" (modal)
- ✅ Botão "Deletar" (com confirmação)

#### 2.3. Modal de Criação/Edição (ADMIN only)

```
╔═════════════════════════════════════════╗
║  ✏️  EDITAR MORADOR                     ║
╠═════════════════════════════════════════╣
║  Nome: [João Silva____________]         ║
║  Apartamento: [101]                     ║
║  Tag RFID: [04E2A3B1C5D6F8]             ║
║  Telefone: [+5582999999999]             ║
║  E-mail: [joao@email.com_____]          ║
║  Notificações WhatsApp: [x] Ativadas    ║
╠═════════════════════════════════════════╣
║           [Cancelar]  [Salvar]          ║
╚═════════════════════════════════════════╝
```

#### 2.4. Backend Endpoints

```typescript
// Todos autenticados
GET /api/moradores
  ?search=joao
  &limit=20
  &offset=0
  &orderBy=nome

GET /api/moradores/:id

// ADMIN only
POST /api/moradores (ADMIN)
  Body: { nome, apartamento, tag_rfid, telefone, email?, notificacoes_ativas }

PUT /api/moradores/:id (ADMIN)
  Body: { nome, apartamento, telefone, email, notificacoes_ativas }

DELETE /api/moradores/:id (ADMIN)
```

#### 2.5. Controle de Acesso (Middleware)

```typescript
// frontend/src/components/Moradores.tsx

const Moradores = () => {
  const { user, isAdmin } = useAuth();
  
  return (
    <div>
      <h1>Moradores do Condomínio</h1>
      
      {/* Botão "Adicionar" só para ADMIN */}
      {isAdmin && (
        <Button onClick={handleAdd}>+ Adicionar Morador</Button>
      )}
      
      {/* Tabela para todos */}
      <MoradoresTable 
        moradores={moradores}
        showActions={isAdmin} // ✏️ 🗑️ só para ADMIN
      />
    </div>
  );
};
```

### Tempo Estimado: 3 horas
- Backend: endpoints de CRUD (1h)
- Frontend: tabela + modal (2h)

---

## 📊 FEATURE #3: DASHBOARD COM IDENTIFICAÇÃO EM TEMPO REAL

### Objetivo
Mostrar no card do carregador quem está carregando naquele momento.

### Implementação

#### 3.1. Card de Carregador Atualizado

**Antes (só mostrava status):**
```
╔═══════════════════════════════╗
║  CARREGADOR - VAGA 1          ║
╠═══════════════════════════════╣
║  🔋 CARREGANDO                ║
║  ⚡ 42.5 kWh                  ║
║  ⏱️  2h 15min                 ║
╚═══════════════════════════════╝
```

**Agora (mostra quem está carregando):**
```
╔═══════════════════════════════╗
║  CARREGADOR - VAGA 1          ║
╠═══════════════════════════════╣
║  🔋 CARREGANDO                ║
║  👤 João Silva - Apt 101      ║ ← NOVO!
║  📱 +55 82 99999-9999         ║ ← NOVO!
║  ⚡ 42.5 kWh                  ║
║  ⏱️  2h 15min                 ║
╚═══════════════════════════════╝
```

#### 3.2. Lógica de Identificação

```typescript
// backend/src/services/CVEService.ts

async getChargePointsWithUsers(): Promise<ChargerWithUser[]> {
  const chargePoints = await this.getChargePoints();
  
  const result = [];
  
  for (const cp of chargePoints) {
    // Se tiver tag RFID ativa, buscar morador
    let morador = null;
    
    if (cp.connectors[0].idTag) {
      morador = await Morador.findOne({
        where: { tag_rfid: cp.connectors[0].idTag }
      });
    }
    
    result.push({
      ...cp,
      morador: morador ? {
        id: morador.id,
        nome: morador.nome,
        apartamento: morador.apartamento,
        telefone: morador.telefone
      } : null
    });
  }
  
  return result;
}
```

#### 3.3. Frontend - Componente Atualizado

```typescript
// frontend/src/components/ChargerCard.tsx

interface ChargerCardProps {
  charger: ChargerInfo;
  morador?: {
    nome: string;
    apartamento: string;
    telefone: string;
  };
}

export const ChargerCard = ({ charger, morador }: ChargerCardProps) => {
  return (
    <Card>
      <CardHeader>
        <h3>{charger.name}</h3>
      </CardHeader>
      
      <CardContent>
        <StatusBadge status={charger.status} />
        
        {/* NOVO: Mostrar morador se estiver carregando */}
        {morador && (
          <div className="morador-info">
            <User size={16} />
            <span>{morador.nome} - Apt {morador.apartamento}</span>
            <Phone size={14} />
            <span>{morador.telefone}</span>
          </div>
        )}
        
        <p>⚡ {charger.energy} kWh</p>
        <p>⏱️ {charger.duration}</p>
      </CardContent>
    </Card>
  );
};
```

#### 3.4. Dashboard Endpoint Atualizado

```typescript
// backend/src/routes/dashboard.ts

router.get('/chargers', authenticate, async (req, res) => {
  try {
    const chargersWithUsers = await cveService.getChargePointsWithUsers();
    
    res.json({
      success: true,
      data: chargersWithUsers
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

### Tempo Estimado: 2 horas
- Backend: lógica de busca de morador (1h)
- Frontend: atualizar componente (1h)

---

## 📄 FEATURE #4: SISTEMA DE RELATÓRIOS PDF

### Objetivo
Permitir que Admin faça upload de PDF pronto (1 por mês) e Cliente faça download.

### Funcionalidades

#### 4.1. Página de Relatórios - Visão ADMIN
```
URL: /relatorios
Acesso: ADMIN
```

**Interface:**
```
╔════════════════════════════════════════════════════════════╗
║  📊 RELATÓRIOS MENSAIS                                     ║
╠════════════════════════════════════════════════════════════╣
║  📤 ENVIAR NOVO RELATÓRIO                                  ║
║     ┌─────────────────────────────────────────┐            ║
║     │  Selecionar arquivo PDF...              │            ║
║     │  [Clique ou arraste o arquivo aqui]     │            ║
║     └─────────────────────────────────────────┘            ║
║     Título: [Relatório Janeiro 2026________]               ║
║     Mês/Ano: [01] / [2026]                                 ║
║     [📤 Fazer Upload]                                      ║
╠════════════════════════════════════════════════════════════╣
║  📋 RELATÓRIOS ENVIADOS                                    ║
║     ┌────────────────────────────────────────────────┐     ║
║     │ 📄 Relatório Janeiro 2026                      │     ║
║     │    Enviado em: 10/01/2026 às 14:30            │     ║
║     │    Tamanho: 2.5 MB                             │     ║
║     │    [👁️ Visualizar] [📥 Download] [🗑️ Apagar]  │     ║
║     └────────────────────────────────────────────────┘     ║
║     ┌────────────────────────────────────────────────┐     ║
║     │ 📄 Relatório Dezembro 2025                     │     ║
║     │    Enviado em: 05/01/2026 às 09:15            │     ║
║     │    Tamanho: 2.1 MB                             │     ║
║     │    [👁️ Visualizar] [📥 Download] [🗑️ Apagar]  │     ║
║     └────────────────────────────────────────────────┘     ║
╚════════════════════════════════════════════════════════════╝
```

#### 4.2. Página de Relatórios - Visão CLIENTE
```
URL: /relatorios
Acesso: CLIENTE
```

**Interface:**
```
╔════════════════════════════════════════════════════════════╗
║  📊 RELATÓRIOS MENSAIS                                     ║
╠════════════════════════════════════════════════════════════╣
║  📥 RELATÓRIOS DISPONÍVEIS PARA DOWNLOAD                   ║
║     ┌────────────────────────────────────────────────┐     ║
║     │ 📄 Relatório Janeiro 2026                      │     ║
║     │    Disponibilizado em: 10/01/2026              │     ║
║     │    [📥 Download PDF]                           │     ║
║     └────────────────────────────────────────────────┘     ║
║     ┌────────────────────────────────────────────────┐     ║
║     │ 📄 Relatório Dezembro 2025                     │     ║
║     │    Disponibilizado em: 05/01/2026              │     ║
║     │    [📥 Download PDF]                           │     ║
║     └────────────────────────────────────────────────┘     ║
╚════════════════════════════════════════════════════════════╝
```

#### 4.3. Backend - Estrutura

**Banco de Dados:**
```sql
CREATE TABLE relatorios (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  arquivo_nome VARCHAR(255) NOT NULL,
  arquivo_path VARCHAR(500) NOT NULL,
  mes INTEGER NOT NULL,
  ano INTEGER NOT NULL,
  descricao TEXT,
  tamanho_kb INTEGER,
  uploaded_por INTEGER REFERENCES usuarios(id),
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_relatorios_mes_ano ON relatorios(mes, ano);
```

**Armazenamento:**
```
vetric-dashboard/
└── backend/
    └── uploads/
        └── relatorios/
            ├── relatorio_2026_01_<uuid>.pdf
            ├── relatorio_2025_12_<uuid>.pdf
            └── relatorio_2025_11_<uuid>.pdf
```

#### 4.4. Backend Endpoints

```typescript
// backend/src/routes/relatorios.ts

import multer from 'multer';
import path from 'path';

// Configurar multer para upload
const storage = multer.diskStorage({
  destination: './uploads/relatorios/',
  filename: (req, file, cb) => {
    const uniqueName = `relatorio_${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos PDF são permitidos'));
    }
  }
});

// ADMIN only
router.post('/upload', authenticate, adminOnly, upload.single('arquivo'), async (req, res) => {
  try {
    const { titulo, mes, ano, descricao } = req.body;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ success: false, error: 'Arquivo não enviado' });
    }
    
    // Verificar se já existe relatório para este mês/ano
    const existente = await Relatorio.findOne({
      where: { mes: parseInt(mes), ano: parseInt(ano) }
    });
    
    if (existente) {
      // Deletar arquivo antigo
      fs.unlinkSync(existente.arquivo_path);
      await existente.destroy();
    }
    
    // Salvar novo relatório
    const relatorio = await Relatorio.create({
      titulo,
      arquivo_nome: file.originalname,
      arquivo_path: file.path,
      mes: parseInt(mes),
      ano: parseInt(ano),
      descricao,
      tamanho_kb: Math.round(file.size / 1024),
      uploaded_por: req.user.id
    });
    
    res.json({
      success: true,
      message: 'Relatório enviado com sucesso',
      data: relatorio
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Listar relatórios (ADMIN + CLIENTE)
router.get('/', authenticate, async (req, res) => {
  try {
    const relatorios = await Relatorio.findAll({
      order: [['ano', 'DESC'], ['mes', 'DESC']],
      attributes: ['id', 'titulo', 'mes', 'ano', 'tamanho_kb', 'criado_em']
    });
    
    res.json({ success: true, data: relatorios });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Download (ADMIN + CLIENTE)
router.get('/:id/download', authenticate, async (req, res) => {
  try {
    const relatorio = await Relatorio.findByPk(req.params.id);
    
    if (!relatorio) {
      return res.status(404).json({ success: false, error: 'Relatório não encontrado' });
    }
    
    res.download(relatorio.arquivo_path, relatorio.arquivo_nome);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Deletar (ADMIN only)
router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const relatorio = await Relatorio.findByPk(req.params.id);
    
    if (!relatorio) {
      return res.status(404).json({ success: false, error: 'Relatório não encontrado' });
    }
    
    // Deletar arquivo físico
    if (fs.existsSync(relatorio.arquivo_path)) {
      fs.unlinkSync(relatorio.arquivo_path);
    }
    
    await relatorio.destroy();
    
    res.json({ success: true, message: 'Relatório deletado com sucesso' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

#### 4.5. Frontend - Componente de Upload (ADMIN)

```typescript
// frontend/src/components/RelatorioUpload.tsx

const RelatorioUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [titulo, setTitulo] = useState('');
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());
  
  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('arquivo', file!);
    formData.append('titulo', titulo);
    formData.append('mes', mes.toString());
    formData.append('ano', ano.toString());
    
    await vetricAPI.uploadRelatorio(formData);
    
    toast.success('Relatório enviado com sucesso!');
  };
  
  return (
    <div className="upload-area">
      <input 
        type="file" 
        accept=".pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <input 
        type="text" 
        placeholder="Título"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
      />
      <select value={mes} onChange={(e) => setMes(Number(e.target.value))}>
        <option value={1}>Janeiro</option>
        <option value={2}>Fevereiro</option>
        {/* ... */}
      </select>
      <input 
        type="number" 
        value={ano}
        onChange={(e) => setAno(Number(e.target.value))}
      />
      <button onClick={handleUpload}>📤 Fazer Upload</button>
    </div>
  );
};
```

### Tempo Estimado: 3 horas
- Backend: endpoints + multer (2h)
- Frontend: interface upload/download (1h)

---

## 💬 FEATURE #5: TEMPLATES WHATSAPP EDITÁVEIS

### Objetivo
Permitir que Admin personalize as mensagens automáticas com templates sugeridos.

### Funcionalidades

#### 5.1. Página de Configurações
```
URL: /configuracoes
Acesso: ADMIN only
```

**Interface:**
```
╔════════════════════════════════════════════════════════════╗
║  ⚙️  CONFIGURAÇÕES DE NOTIFICAÇÕES                         ║
╠════════════════════════════════════════════════════════════╣
║  🔔 NOTIFICAÇÕES GLOBAIS                                   ║
║     [x] Notificações ativadas                              ║
║     [ ] Pausar notificações entre 22h e 7h                 ║
╠════════════════════════════════════════════════════════════╣
║  💬 TEMPLATES DE MENSAGENS                                 ║
║                                                            ║
║  📝 Template 1: Início de Carregamento                     ║
║     ┌──────────────────────────────────────────────────┐   ║
║     │ 🔋 Olá {{nome}}!                                 │   ║
║     │                                                  │   ║
║     │ Seu carregamento foi iniciado no {{charger}}.   │   ║
║     │                                                  │   ║
║     │ 📍 Local: {{localizacao}}                       │   ║
║     │ 🕐 Início: {{data}}                             │   ║
║     │                                                  │   ║
║     │ Acompanhe pelo app VETRIC!                      │   ║
║     └──────────────────────────────────────────────────┘   ║
║     Variáveis: {{nome}}, {{apartamento}}, {{charger}},     ║
║                {{localizacao}}, {{data}}                   ║
║     [Restaurar Padrão] [💾 Salvar]                         ║
╠════════════════════════════════════════════════════════════╣
║  ✅ Preview com dados de exemplo                           ║
║     ┌──────────────────────────────────────────────────┐   ║
║     │ 🔋 Olá João Silva!                               │   ║
║     │                                                  │   ║
║     │ Seu carregamento foi iniciado no Vaga 1.        │   ║
║     │                                                  │   ║
║     │ 📍 Local: Garagem - Bloco A                     │   ║
║     │ 🕐 Início: 12/01/2026 às 14:30                  │   ║
║     │                                                  │   ║
║     │ Acompanhe pelo app VETRIC!                      │   ║
║     └──────────────────────────────────────────────────┘   ║
║     [📱 Enviar Teste para Meu Número]                      ║
╚════════════════════════════════════════════════════════════╝
```

#### 5.2. Templates Sugeridos (Padrão)

**Template 1: Início de Carregamento**
```
🔋 Olá {{nome}}!

Seu carregamento foi iniciado no {{charger}}.

📍 Local: {{localizacao}}
🕐 Início: {{data}}
🏢 Apartamento: {{apartamento}}

Acompanhe pelo dashboard VETRIC Gran Marine!
```

**Template 2: Fim de Carregamento**
```
✅ Olá {{nome}}!

Seu carregamento foi concluído com sucesso!

⚡ Energia consumida: {{energia}} kWh
⏱️ Duração: {{duracao}}
💰 Custo estimado: R$ {{custo}}

🔌 O carregador {{charger}} está novamente disponível.

Obrigado por utilizar nosso sistema!
```

**Template 3: Erro/Problema**
```
⚠️ Olá {{nome}}!

Detectamos um problema no seu carregamento:

🔌 Carregador: {{charger}}
❌ Erro: {{erro}}
🕐 Horário: {{data}}
🏢 Apartamento: {{apartamento}}

Por favor, entre em contato com a administração.

Telefone: (82) 3333-4444
WhatsApp: (82) 99999-9999
```

**Template 4: Carregador Ocioso (30min+)**
```
💤 Olá {{nome}}!

Seu carregador está ocioso há {{tempo}}.

🔌 Carregador: {{charger}}
📍 Local: {{localizacao}}

Se o carregamento já terminou, por favor libere a vaga para outros moradores.

Obrigado pela compreensão! 🙏
```

**Template 5: Carregador Disponível**
```
✨ Olá {{nome}}!

O carregador {{charger}} está disponível!

📍 Local: {{localizacao}}
🏢 Próximo ao seu apartamento: {{apartamento}}

Aproveite para carregar seu veículo elétrico!
```

#### 5.3. Backend - Model de Template

```typescript
// backend/src/models/TemplateNotificacao.ts

export interface TemplateNotificacao {
  id: number;
  tipo: 'inicio' | 'fim' | 'erro' | 'ocioso' | 'disponivel';
  mensagem: string;
  variaveis: string[]; // Lista de variáveis disponíveis
  ativo: boolean;
  criado_em: Date;
  atualizado_em: Date;
}

// Seed de templates padrão
export async function seedTemplates() {
  const templates = [
    {
      tipo: 'inicio',
      mensagem: '🔋 Olá {{nome}}!\n\nSeu carregamento foi iniciado...',
      variaveis: ['nome', 'apartamento', 'charger', 'localizacao', 'data'],
      ativo: true
    },
    // ... outros templates
  ];
  
  for (const t of templates) {
    await TemplateNotificacao.findOrCreate({
      where: { tipo: t.tipo },
      defaults: t
    });
  }
}
```

#### 5.4. Backend Endpoints

```typescript
// backend/src/routes/templates.ts

// Listar todos (ADMIN + CLIENTE pode ver)
router.get('/', authenticate, async (req, res) => {
  const templates = await TemplateNotificacao.findAll();
  res.json({ success: true, data: templates });
});

// Atualizar template (ADMIN only)
router.put('/:tipo', authenticate, adminOnly, async (req, res) => {
  const { mensagem, ativo } = req.body;
  
  const template = await TemplateNotificacao.findOne({
    where: { tipo: req.params.tipo }
  });
  
  if (!template) {
    return res.status(404).json({ success: false, error: 'Template não encontrado' });
  }
  
  template.mensagem = mensagem;
  template.ativo = ativo;
  await template.save();
  
  res.json({ success: true, data: template });
});

// Restaurar padrão (ADMIN only)
router.post('/:tipo/restaurar', authenticate, adminOnly, async (req, res) => {
  const template = await TemplateNotificacao.findOne({
    where: { tipo: req.params.tipo }
  });
  
  // Buscar mensagem padrão do seed
  const mensagemPadrao = MENSAGENS_PADRAO[req.params.tipo];
  
  template.mensagem = mensagemPadrao;
  await template.save();
  
  res.json({ success: true, data: template });
});

// Preview (ADMIN only)
router.post('/:tipo/preview', authenticate, adminOnly, async (req, res) => {
  const { mensagem } = req.body;
  
  // Substituir variáveis por dados de exemplo
  const preview = mensagem
    .replace(/{{nome}}/g, 'João Silva')
    .replace(/{{apartamento}}/g, '101')
    .replace(/{{charger}}/g, 'Vaga 1')
    .replace(/{{localizacao}}/g, 'Garagem - Bloco A')
    .replace(/{{data}}/g, new Date().toLocaleString('pt-BR'))
    .replace(/{{energia}}/g, '42.5')
    .replace(/{{duracao}}/g, '3h 25min')
    .replace(/{{custo}}/g, '32,15');
  
  res.json({ success: true, data: { preview } });
});

// Enviar teste (ADMIN only)
router.post('/:tipo/test', authenticate, adminOnly, async (req, res) => {
  const { mensagem, telefone } = req.body;
  
  // Renderizar mensagem com dados de exemplo
  const mensagemFinal = renderizarTemplate(mensagem, DADOS_EXEMPLO);
  
  // Enviar via Evolution API
  await notificationService.sendWhatsApp(telefone, mensagemFinal);
  
  res.json({ success: true, message: 'Mensagem de teste enviada' });
});
```

### Tempo Estimado: 2 horas
- Backend: endpoints + seed (1h)
- Frontend: editor + preview (1h)

---

## 🔔 FEATURE #6: NOTIFICAÇÕES AUTOMÁTICAS

### Objetivo
Enviar as 5 notificações automáticas via WhatsApp quando eventos ocorrerem.

### Eventos e Triggers

#### 6.1. Evento 1: Início de Carregamento
```
Trigger: Status muda de "Available" para "Charging"
Para quem: Morador vinculado à tag RFID
Template: inicio
Dados: nome, apartamento, charger, localizacao, data
```

#### 6.2. Evento 2: Fim de Carregamento
```
Trigger: Status muda de "Charging" para "Available"
Para quem: Morador que estava carregando
Template: fim
Dados: nome, energia, duracao, custo, charger
```

#### 6.3. Evento 3: Erro/Problema
```
Trigger: Status muda para "Faulted"
Para quem: Morador + Administração
Template: erro
Dados: nome, charger, erro, data, apartamento
Prioridade: ALTA
```

#### 6.4. Evento 4: Carregador Ocioso
```
Trigger: Status "SuspendedEV" por mais de 30 minutos
Para quem: Morador que está ocupando
Template: ocioso
Dados: nome, charger, tempo, localizacao
Prioridade: BAIXA
```

#### 6.5. Evento 5: Carregador Disponível
```
Trigger: Status volta para "Available" (após estar ocupado)
Para quem: Lista de interesse (opcional na Fase 2)
Template: disponivel
Dados: charger, localizacao
```

### Implementação

#### 6.6. Service de Notificações

```typescript
// backend/src/services/NotificationService.ts

export class NotificationService {
  private evolutionAPI: EvolutionAPI;
  
  constructor() {
    this.evolutionAPI = new EvolutionAPI(
      config.evolution.baseUrl,
      config.evolution.apiKey,
      config.evolution.instanceName
    );
  }
  
  /**
   * Renderizar template com dados reais
   */
  private renderizarTemplate(mensagem: string, dados: any): string {
    let resultado = mensagem;
    
    for (const [key, value] of Object.entries(dados)) {
      const placeholder = `{{${key}}}`;
      resultado = resultado.replace(new RegExp(placeholder, 'g'), String(value));
    }
    
    return resultado;
  }
  
  /**
   * Enviar notificação
   */
  async enviarNotificacao(
    tipo: string,
    morador: Morador,
    dados: any
  ): Promise<boolean> {
    try {
      // Verificar se morador tem notificações ativas
      if (!morador.notificacoes_ativas) {
        console.log(`⏭️  Notificações desativadas para ${morador.nome}`);
        return false;
      }
      
      // Buscar template
      const template = await TemplateNotificacao.findOne({
        where: { tipo, ativo: true }
      });
      
      if (!template) {
        console.warn(`⚠️  Template ${tipo} não encontrado ou inativo`);
        return false;
      }
      
      // Renderizar mensagem
      const mensagem = this.renderizarTemplate(template.mensagem, {
        nome: morador.nome,
        apartamento: morador.apartamento,
        ...dados
      });
      
      // Enviar via Evolution API
      const response = await this.evolutionAPI.sendText(
        morador.telefone,
        mensagem
      );
      
      // Salvar log
      await LogNotificacao.create({
        morador_id: morador.id,
        tipo,
        template_id: template.id,
        mensagem_enviada: mensagem,
        telefone: morador.telefone,
        status: 'enviado',
        evolution_response: response,
        enviado_em: new Date()
      });
      
      console.log(`✅ Notificação ${tipo} enviada para ${morador.nome}`);
      return true;
      
    } catch (error: any) {
      console.error(`❌ Erro ao enviar notificação ${tipo}:`, error);
      
      // Salvar log de falha
      await LogNotificacao.create({
        morador_id: morador.id,
        tipo,
        mensagem_enviada: '',
        telefone: morador.telefone,
        status: 'falha',
        erro: error.message,
        tentativas: 1
      });
      
      return false;
    }
  }
  
  /**
   * Notificação: Início de carregamento
   */
  async notificarInicio(charger: CVEChargePoint, morador: Morador) {
    await this.enviarNotificacao('inicio', morador, {
      charger: charger.name,
      localizacao: charger.location || 'Garagem - Gran Marine',
      data: new Date().toLocaleString('pt-BR')
    });
  }
  
  /**
   * Notificação: Fim de carregamento
   */
  async notificarFim(charger: CVEChargePoint, morador: Morador, carregamento: any) {
    await this.enviarNotificacao('fim', morador, {
      charger: charger.name,
      energia: carregamento.energia_kwh.toFixed(1),
      duracao: carregamento.duracao_formatada,
      custo: carregamento.custo_estimado.toFixed(2)
    });
  }
  
  /**
   * Notificação: Erro detectado
   */
  async notificarErro(charger: CVEChargePoint, morador: Morador, erro: string) {
    await this.enviarNotificacao('erro', morador, {
      charger: charger.name,
      erro: erro,
      data: new Date().toLocaleString('pt-BR')
    });
    
    // Também notificar administração
    // TODO: Implementar lista de admins para notificar
  }
  
  /**
   * Notificação: Carregador ocioso
   */
  async notificarOcioso(charger: CVEChargePoint, morador: Morador, tempoMinutos: number) {
    const horas = Math.floor(tempoMinutos / 60);
    const minutos = tempoMinutos % 60;
    const tempo = `${horas}h ${minutos}min`;
    
    await this.enviarNotificacao('ocioso', morador, {
      charger: charger.name,
      localizacao: charger.location || 'Garagem - Gran Marine',
      tempo
    });
  }
}

export const notificationService = new NotificationService();
```

#### 6.7. WebSocket Listeners

```typescript
// backend/src/services/WebSocketService.ts

export class WebSocketService {
  private stompClient: any;
  private previousStates: Map<string, string> = new Map();
  
  async connect(token: string) {
    // ... código de conexão existente ...
    
    // Subscribe to charger status updates
    this.stompClient.subscribe('/topic/chargepoints', async (message: any) => {
      const chargePoint = JSON.parse(message.body);
      
      await this.handleStatusChange(chargePoint);
    });
  }
  
  private async handleStatusChange(chargePoint: CVEChargePoint) {
    const currentStatus = chargePoint.connectors[0].status;
    const previousStatus = this.previousStates.get(chargePoint.uuid);
    
    // Verificar se mudou
    if (currentStatus === previousStatus) {
      return; // Sem mudança
    }
    
    // Atualizar estado
    this.previousStates.set(chargePoint.uuid, currentStatus);
    
    // Buscar morador pela tag RFID
    const tagRFID = chargePoint.connectors[0].idTag;
    if (!tagRFID) return;
    
    const morador = await Morador.findOne({
      where: { tag_rfid: tagRFID }
    });
    
    if (!morador) return;
    
    // EVENTO 1: Início de carregamento
    if (previousStatus === 'Available' && currentStatus === 'Charging') {
      await notificationService.notificarInicio(chargePoint, morador);
      
      // Criar registro de carregamento
      await Carregamento.create({
        morador_id: morador.id,
        charger_uuid: chargePoint.uuid,
        charger_name: chargePoint.name,
        connector_id: 1,
        status: 'em_andamento',
        inicio: new Date(),
        notificacao_inicio_enviada: true
      });
    }
    
    // EVENTO 2: Fim de carregamento
    if (previousStatus === 'Charging' && currentStatus === 'Available') {
      const carregamento = await Carregamento.findOne({
        where: {
          morador_id: morador.id,
          charger_uuid: chargePoint.uuid,
          status: 'em_andamento'
        }
      });
      
      if (carregamento) {
        // Calcular duração e custo
        carregamento.fim = new Date();
        carregamento.status = 'concluido';
        carregamento.duracao_minutos = Math.round(
          (carregamento.fim.getTime() - carregamento.inicio.getTime()) / 60000
        );
        carregamento.energia_kwh = chargePoint.connectors[0].energyKwh || 0;
        await carregamento.save();
        
        await notificationService.notificarFim(chargePoint, morador, carregamento);
      }
    }
    
    // EVENTO 3: Erro detectado
    if (currentStatus === 'Faulted') {
      const erro = chargePoint.connectors[0].errorCode || 'Erro desconhecido';
      await notificationService.notificarErro(chargePoint, morador, erro);
    }
    
    // EVENTO 4: Carregador ocioso (verificar tempo)
    if (currentStatus === 'SuspendedEV') {
      // Verificar há quanto tempo está ocioso
      // TODO: Implementar lógica de contagem de tempo
      // Por enquanto, apenas após 30 minutos
    }
  }
}
```

#### 6.8. Tabela de Logs

```sql
CREATE TABLE logs_notificacoes (
  id SERIAL PRIMARY KEY,
  morador_id INTEGER REFERENCES moradores(id),
  tipo VARCHAR(50) NOT NULL, -- inicio, fim, erro, ocioso, disponivel
  template_id INTEGER REFERENCES templates_notificacao(id),
  mensagem_enviada TEXT NOT NULL,
  telefone VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL, -- enviado, falha, pendente
  tentativas INTEGER DEFAULT 0,
  erro TEXT,
  evolution_response JSON,
  enviado_em TIMESTAMP,
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_logs_morador ON logs_notificacoes(morador_id);
CREATE INDEX idx_logs_status ON logs_notificacoes(status);
CREATE INDEX idx_logs_tipo ON logs_notificacoes(tipo);
CREATE INDEX idx_logs_data ON logs_notificacoes(enviado_em);
```

### Tempo Estimado: 6 horas
- Service de notificações (2h)
- WebSocket listeners (2h)
- Logs e testes (2h)

---

## 📅 CRONOGRAMA FINAL

```
┌─────────────────────────────────────────────────────────┐
│ DIA 1 (8h)                                              │
├─────────────────────────────────────────────────────────┤
│  08:00-09:00  Seed de moradores (você envia lista)     │
│  09:00-11:00  Dashboard com identificação              │
│  11:00-14:00  Sistema upload/download PDF              │
│  14:00-17:00  Visualização de moradores (CRUD básico)  │
├─────────────────────────────────────────────────────────┤
│ DIA 2 (8h)                                              │
├─────────────────────────────────────────────────────────┤
│  08:00-10:00  Templates WhatsApp (editor + preview)    │
│  10:00-12:00  Service de notificações                  │
│  12:00-14:00  WebSocket listeners                      │
│  14:00-17:00  Integração Evolution API + testes        │
├─────────────────────────────────────────────────────────┤
│ DIA 3 (4h) - Finalização                               │
├─────────────────────────────────────────────────────────┤
│  08:00-11:00  Testes end-to-end                        │
│  11:00-12:00  Documentação atualizada                  │
└─────────────────────────────────────────────────────────┘

TOTAL: 20 horas (2.5 dias)
```

---

## ✅ CRITÉRIOS DE CONCLUSÃO DA FASE 2

- [ ] Seed de moradores executado com sucesso (lista completa)
- [ ] Dashboard mostra nome + apartamento de quem está carregando
- [ ] Cliente pode ver lista de moradores (read-only)
- [ ] Admin pode editar moradores (CRUD completo)
- [ ] Admin pode fazer upload de PDF (1 por mês)
- [ ] Cliente pode fazer download de PDFs
- [ ] Admin pode apagar e substituir PDFs
- [ ] 5 templates WhatsApp editáveis funcionando
- [ ] Preview de templates em tempo real
- [ ] Enviar mensagem de teste funcionando
- [ ] Notificação automática: Início de carregamento ✅
- [ ] Notificação automática: Fim de carregamento ✅
- [ ] Notificação automática: Erro detectado ✅
- [ ] Notificação automática: Carregador ocioso ✅
- [ ] Notificação automática: Carregador disponível ✅
- [ ] Logs de notificações salvos no banco
- [ ] Sistema testado com dados reais Gran Marine
- [ ] Documentação atualizada

---

## 🚀 PRÓXIMOS PASSOS

**Para iniciar a Fase 2, preciso que você:**

1. **Me envie a lista completa de moradores** no formato:
   ```
   Nome | Apartamento | Tag RFID | Telefone
   ```
   (Pode ser Excel, CSV, texto, etc)

2. **Confirme se está tudo OK com este plano**

3. **Me diga: "Pode começar!"** 😊

---

## 📝 RESUMO EXECUTIVO

| Item | Descrição | Tempo |
|------|-----------|-------|
| **Seed Moradores** | População do banco | 1h |
| **Dashboard** | Identificação em tempo real | 2h |
| **Moradores** | Visualização + CRUD | 3h |
| **Relatórios PDF** | Upload/Download | 3h |
| **Templates** | Editor + Preview | 2h |
| **Notificações** | Sistema completo | 6h |
| **Testes** | End-to-end + Docs | 3h |
| **TOTAL** | **2.5 dias** | **20h** |

---

**Criado por:** Sistema VETRIC  
**Data:** 12/01/2026  
**Versão:** 2.0 FINAL  
**Status:** ✅ AGUARDANDO APROVAÇÃO + LISTA DE MORADORES

