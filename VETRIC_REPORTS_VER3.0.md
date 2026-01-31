# VETRIC Reports V3.0 - Documentação de Integração

**Data:** 30 de Janeiro de 2026  
**Versão:** 3.0.0  
**Status:** ✅ Integrado ao Sistema Síndico

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Problema Identificado](#problema-identificado)
3. [Solução Implementada](#solução-implementada)
4. [Arquitetura](#arquitetura)
5. [Migração de Dados](#migração-de-dados)
6. [Problemas Encontrados e Soluções](#problemas-encontrados-e-soluções)
7. [Estado Atual](#estado-atual)
8. [Próximos Passos](#próximos-passos)
9. [Referências Técnicas](#referências-técnicas)

---

## 🎯 Visão Geral

O VETRIC Reports V3.0 representa a **integração completa** do sistema de relatórios de recarga de veículos elétricos ao sistema VETRIC Síndico. Esta atualização resolve o bug crítico de persistência de dados e unifica a experiência do usuário em uma única plataforma.

### Objetivos Alcançados

- ✅ **Persistência Permanente**: Relatórios salvos em PostgreSQL (não mais em localStorage)
- ✅ **Integração Completa**: Unificação com o sistema Síndico
- ✅ **Migração de Dados**: 2 empreendimentos (Gran Marine e Salt) migrados com sucesso
- ✅ **Autenticação Unificada**: JWT compartilhado entre módulos
- ✅ **Interface Consistente**: DashboardLayout em todas as páginas

---

## 🐛 Problema Identificado

### Bug Crítico: Perda de Dados

**Descrição:**  
Os relatórios gerados no VETRIC Reports V2 eram salvos **apenas no `localStorage` do navegador**, resultando em perda de dados quando:
- ✗ Usuário limpava o cache do navegador
- ✗ Usuário trocava de dispositivo
- ✗ Usuário acessava de outro navegador

**Código Problemático (V2):**

```typescript
// app/[empreendimentoId]/upload/page.tsx (V2)
localStorage.setItem(
  `relatorio-${savedRelatorio.id}`,
  JSON.stringify(dadosCompletos)
);
```

**Impacto:**
- 🔴 **Crítico**: Perda de dados de relatórios já processados
- 🟡 **Alto**: Retrabalho para regenerar relatórios
- 🟡 **Médio**: Experiência ruim do usuário

---

## ✅ Solução Implementada

### Estratégia: Integração ao Síndico

Decidimos **copiar e adaptar** o VETRIC Reports V2 para o ambiente do Síndico, ao invés de modificar o sistema V2 original. Isso garantiu:

1. ✅ Sistema V2 permanece funcional (sem riscos)
2. ✅ Desenvolvimento isolado na branch `feature/integracao-reports-v2`
3. ✅ Testes completos antes do deploy
4. ✅ Rollback facilitado se necessário

---

## 🏗️ Arquitetura

### Estrutura de Diretórios

```
apps/
├── backend/
│   └── src/
│       └── relatorios/
│           ├── controllers/
│           │   ├── EmpreendimentoRelatorioController.ts
│           │   ├── UsuarioRelatorioController.ts
│           │   ├── ConfiguracaoTarifariaController.ts
│           │   └── RelatorioController.ts
│           ├── models/
│           │   ├── EmpreendimentoRelatorio.ts
│           │   ├── UsuarioRelatorio.ts
│           │   ├── ConfiguracaoTarifaria.ts
│           │   └── RelatorioGerado.ts
│           ├── lib/
│           │   ├── calcular-janelas.ts
│           │   ├── ociosidade-processor.ts
│           │   └── xlsx-processor.ts
│           └── routes/
│               └── index.ts
│
└── frontend/
    └── src/
        └── pages/
            └── relatorios-vetric/
                ├── EmpreendimentosRelatorios.tsx
                ├── NovoEmpreendimento.tsx
                ├── DashboardEmpreendimento.tsx
                ├── UploadRelatorio.tsx
                ├── ListaRelatorios.tsx
                ├── VisualizarRelatorio.tsx
                ├── UsuariosRelatorio.tsx
                └── ConfiguracoesRelatorio.tsx
```

### Banco de Dados

#### Novas Tabelas PostgreSQL

**1. `empreendimentos_relatorio`**
```sql
CREATE TABLE empreendimentos_relatorio (
  id TEXT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);
```

**2. `usuarios_relatorio`**
```sql
CREATE TABLE usuarios_relatorio (
  id TEXT PRIMARY KEY,
  empreendimento_id TEXT NOT NULL REFERENCES empreendimentos_relatorio(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  unidade VARCHAR(50) NOT NULL,
  torre VARCHAR(50),
  tag_rfid VARCHAR(50),
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);
```

**3. `configuracoes_tarifarias`**
```sql
CREATE TABLE configuracoes_tarifarias (
  id TEXT PRIMARY KEY,
  empreendimento_id TEXT NOT NULL UNIQUE REFERENCES empreendimentos_relatorio(id) ON DELETE CASCADE,
  tarifa_ponta DECIMAL(10, 2) NOT NULL,
  tarifa_fora_ponta DECIMAL(10, 2) NOT NULL,
  horario_ponta_inicio TIME NOT NULL,
  horario_ponta_fim TIME NOT NULL,
  tempo_ociosidade_minutos INTEGER DEFAULT 15,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);
```

**4. `relatorios_gerados`** (⭐ Campo Crítico)
```sql
CREATE TABLE relatorios_gerados (
  id TEXT PRIMARY KEY,
  empreendimento_id TEXT NOT NULL REFERENCES empreendimentos_relatorio(id) ON DELETE CASCADE,
  mes_ano VARCHAR(7) NOT NULL,
  pdf_url TEXT,
  total_recargas INTEGER NOT NULL,
  total_consumo DECIMAL(10, 2) NOT NULL,
  total_valor DECIMAL(10, 2) NOT NULL,
  dados_completos JSONB NOT NULL, -- ⭐ FIX DO BUG!
  criado_em TIMESTAMP DEFAULT NOW()
);
```

**Campo `dados_completos` (JSONB):**  
Este campo armazena **TODOS os dados processados do relatório**, incluindo:
- Resumo geral
- Consumo por estação
- Dados dos gráficos
- Resumo de ociosidade
- Resumo detalhado por usuário
- Cargas rejeitadas
- Configurações tarifárias
- Cargas detalhadas com dupla tarifação

### API Endpoints

```
/api/vetric-reports
├── GET    /empreendimentos                              # Listar empreendimentos
├── POST   /empreendimentos                              # Criar empreendimento
├── GET    /empreendimentos/:id                          # Buscar empreendimento
├── PUT    /empreendimentos/:id                          # Atualizar empreendimento
├── GET    /empreendimentos/:id/usuarios                 # Listar usuários
├── POST   /empreendimentos/:empreendimentoId/usuarios   # Criar usuário
├── PUT    /usuarios/:id                                 # Atualizar usuário
├── DELETE /usuarios/:id                                 # Deletar usuário
├── GET    /empreendimentos/:id/configuracao             # Buscar config tarifária
├── POST   /empreendimentos/:id/configuracao             # Criar/Atualizar config
├── POST   /preview-xlsx                                 # Preview completo (com gráficos)
├── POST   /gerar-relatorio                              # Gerar e salvar relatório
├── GET    /relatorios/:id                               # Buscar relatório por ID
└── GET    /empreendimentos/:empreendimentoId/relatorios # Listar relatórios
```

### Rotas Frontend

```
/relatorios-vetric                                    # Lista de empreendimentos
├── /novo                                             # Criar empreendimento
├── /:empreendimentoId                                # Dashboard do empreendimento
├── /:empreendimentoId/usuarios                       # Gerenciar usuários
├── /:empreendimentoId/configuracoes                  # Configurar tarifas
├── /:empreendimentoId/upload                         # Upload e preview de relatório
├── /:empreendimentoId/relatorios                     # Lista de relatórios gerados
└── /:empreendimentoId/relatorios/:relatorioId        # Visualizar relatório
```

---

## 🔄 Migração de Dados

### Script de Migração

**Arquivo:** `apps/backend/src/scripts/migrar-dados-reports-v2.ts`

**Processo:**
1. ✅ Conexão com SQLite (`dev.db` do Reports V2)
2. ✅ Conexão com PostgreSQL (Síndico)
3. ✅ Migração de 2 empreendimentos: **Gran Marine** e **Salt**
4. ✅ Migração de todos os usuários associados
5. ✅ Migração de configurações tarifárias

**Execução:**
```bash
cd apps/backend
npm run migrate:reports-v2
```

**Resultado:**
- ✅ 2 empreendimentos migrados
- ✅ 25+ usuários migrados (Gran Marine)
- ✅ Configurações tarifárias preservadas
- ✅ IDs (CUIDs) mantidos para compatibilidade

---

## 🔧 Problemas Encontrados e Soluções

### 1. ❌ Erro: `Router.use() requires a middleware function`

**Causa:**  
Import incorreto do middleware `authenticate` nas rotas.

**Solução:**
```typescript
// apps/backend/src/relatorios/routes/index.ts
import { authenticate } from '../../middleware/auth'; // ✅ Correto
```

---

### 2. ❌ Erro: `EADDRINUSE: address already in use :::3001`

**Causa:**  
Processo anterior do backend ainda rodando.

**Solução:**
```bash
lsof -ti:3001 | xargs kill -9
npm run dev
```

---

### 3. ❌ Erro: `Token JWT inválido` / Sessão expirando

**Causa:**  
Frontend recuperando token com chave incorreta do localStorage.

**Problema:**
```typescript
const token = localStorage.getItem('token'); // ❌ Errado
```

**Solução:**
```typescript
const token = localStorage.getItem('@vetric:token'); // ✅ Correto
```

**Arquivos corrigidos:**
- `EmpreendimentosRelatorios.tsx`
- `DashboardEmpreendimento.tsx`
- `UploadRelatorio.tsx`
- `ListaRelatorios.tsx`
- `VisualizarRelatorio.tsx`
- `UsuariosRelatorio.tsx`
- `ConfiguracoesRelatorio.tsx`

---

### 4. ❌ Erro: Rate Limiter bloqueando requisições

**Causa:**  
Limite de 100 requisições em 15 minutos muito baixo para desenvolvimento.

**Solução:**
```typescript
// apps/backend/src/index.ts
const limiter = rateLimit({
  windowMs: 900000, // 15 min
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // ✅ 1000 em dev
});
```

---

### 5. ❌ Erro: `relation "empreendimentos_relatorio" does not exist`

**Causa:**  
Migrations não executadas no banco local (DATABASE_URL apontava para produção).

**Solução:**
1. Corrigir `.env`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/vetric_db
```

2. Executar migrations:
```bash
npm run migrate
```

---

### 6. ❌ Erro: `invalid input syntax for type uuid`

**Causa:**  
IDs do Prisma (CUIDs) não são compatíveis com colunas `UUID` do PostgreSQL.

**Solução:**  
Criada migration `013_fix_uuid_to_text.ts` para alterar tipo de `UUID` para `TEXT`:

```sql
ALTER TABLE empreendimentos_relatorio DROP CONSTRAINT empreendimentos_relatorio_pkey CASCADE;
ALTER TABLE empreendimentos_relatorio ALTER COLUMN id TYPE TEXT;
ALTER TABLE empreendimentos_relatorio ADD PRIMARY KEY (id);
-- ... similar para outras tabelas
```

---

### 7. ❌ Erro: `relatorio.total_consumo.toFixed is not a function`

**Causa:**  
PostgreSQL retorna `DECIMAL` como string, mas frontend esperava número.

**Solução Backend:**
```typescript
// apps/backend/src/relatorios/models/RelatorioGerado.ts
static async findByEmpreendimento(empreendimentoId: string) {
  const result = await query(sql, [empreendimentoId]);
  return result.rows.map(row => ({
    ...row,
    total_consumo: parseFloat(row.total_consumo), // ✅
    total_valor: parseFloat(row.total_valor),     // ✅
  }));
}
```

**Solução Frontend:**
```typescript
// apps/frontend/src/pages/relatorios-vetric/ListaRelatorios.tsx
<TableCell className="text-right">
  {Number(relatorio.total_consumo).toFixed(2)} kWh
</TableCell>
<TableCell className="text-right font-semibold text-green-600">
  R$ {Number(relatorio.total_valor).toFixed(2)}
</TableCell>
```

---

### 8. ❌ API retornando `dados_completos` na listagem (payload gigante)

**Causa:**  
`SELECT *` incluindo campo JSONB de ~500KB por relatório.

**Solução:**
```typescript
// apps/backend/src/relatorios/models/RelatorioGerado.ts
static async findByEmpreendimento(empreendimentoId: string) {
  const sql = `
    SELECT 
      id, empreendimento_id, mes_ano, pdf_url, 
      total_recargas, total_consumo, total_valor, criado_em
    FROM relatorios_gerados  -- ✅ Sem dados_completos
    WHERE empreendimento_id = $1
    ORDER BY criado_em DESC
  `;
  // ...
}
```

---

## 📊 Estado Atual

### ✅ Funcionalidades Implementadas

1. **CRUD de Empreendimentos**
   - ✅ Criar, listar, editar empreendimentos
   - ✅ Dashboard individual por empreendimento

2. **Gerenciamento de Usuários**
   - ✅ Criar, editar, deletar usuários/moradores
   - ✅ Associação com unidade, torre, TAG RFID

3. **Configurações Tarifárias**
   - ✅ Configurar tarifas (ponta e fora ponta)
   - ✅ Definir horários de ponta
   - ✅ Configurar tempo de ociosidade

4. **Processamento de Relatórios**
   - ✅ Upload de planilha XLSX
   - ✅ Preview completo com gráficos (Recharts)
   - ✅ Cálculo de consumo por horário
   - ✅ Cálculo de dupla tarifação (cargas que cruzam horário de ponta)
   - ✅ Detecção de ociosidade
   - ✅ Resumo por usuário
   - ✅ Consumo por estação de carregamento

5. **Persistência de Dados**
   - ✅ Salvamento completo em PostgreSQL (campo `dados_completos`)
   - ✅ Histórico de relatórios gerados
   - ✅ Recuperação de dados sem `localStorage`

6. **Interface Unificada**
   - ✅ DashboardLayout em todas as páginas
   - ✅ Sidebar com navegação
   - ✅ Autenticação JWT compartilhada
   - ✅ Controle de acesso (ADMIN only)

### 🔄 Funcionalidades em Desenvolvimento

1. **Visualização Completa de Relatórios**
   - ✅ Resumo Geral
   - ✅ Gráfico de Horários
   - ✅ Resumo por Usuário
   - ⏳ **Detalhamento Individual por Morador** (em progresso)
     - Seção dedicada para cada morador
     - Tabela com TODAS as cargas
     - Sub-transações de dupla tarifação
     - Alertas de ociosidade individual

2. **Geração de PDF**
   - ⏳ Conversão do preview em PDF
   - ⏳ Salvamento da URL do PDF
   - ⏳ Download de relatórios

---

## 🚀 Próximos Passos

### Fase 1: Completar Visualização (Em Andamento)

- [ ] Implementar seções individuais por morador no `VisualizarRelatorio.tsx`
- [ ] Mostrar detalhamento de cargas com dupla tarifação
- [ ] Exibir alertas de ociosidade por usuário
- [ ] Adicionar navegação entre seções do relatório

### Fase 2: Geração de PDF

- [ ] Implementar conversão HTML → PDF (biblioteca `puppeteer` ou `jsPDF`)
- [ ] Configurar storage para PDFs (AWS S3 ou local)
- [ ] Salvar URL do PDF em `relatorios_gerados.pdf_url`
- [ ] Adicionar botão de download

### Fase 3: Testes e Validação

- [ ] Testar fluxo completo (upload → preview → salvar → visualizar)
- [ ] Validar cálculos com relatórios reais (Gran Marine, Salt)
- [ ] Verificar performance com planilhas grandes (1000+ linhas)
- [ ] Testar em diferentes navegadores

### Fase 4: Deploy

- [ ] Code review completo
- [ ] Merge da branch `feature/integracao-reports-v2` → `main`
- [ ] Deploy em ambiente de staging
- [ ] Testes em produção (usuários limitados)
- [ ] Deploy final

---

## 📚 Referências Técnicas

### Tecnologias Utilizadas

- **Backend:**
  - Node.js + Express
  - TypeScript
  - PostgreSQL
  - JWT (jsonwebtoken)
  - XLSX (xlsx)
  - Rate Limiter (express-rate-limit)

- **Frontend:**
  - React 18
  - TypeScript
  - React Router DOM
  - Shadcn UI
  - Recharts (gráficos)
  - Lucide React (ícones)

### Lógica de Dupla Tarifação

Quando uma carga de veículo **cruza o horário de ponta** (ex: início 18:51, fim 00:34), o sistema:

1. ✅ Divide a carga em **duas sub-transações**:
   - **Sub-transação 1 (Ponta):** 18:51 - 19:00 → R$ 3,08/kWh
   - **Sub-transação 2 (Fora Ponta):** 19:00 - 00:34 → R$ 0,53/kWh

2. ✅ Calcula consumo proporcional:
   - Consumo Ponta = potência × tempo em ponta
   - Consumo Fora Ponta = potência × tempo fora ponta

3. ✅ Marca a carga como "DUPLA TARIFAÇÃO" no relatório

**Código:**
```typescript
// apps/backend/src/relatorios/lib/calcular-janelas.ts
export function calcularJanelas(
  inicio: Date,
  fim: Date,
  pontos: { tarifaPonta: boolean; inicio: Date; fim: Date }[]
) {
  // Algoritmo que divide cargas entre janelas de ponta e fora ponta
  // ...
}
```

### Lógica de Ociosidade

Detecta quando um veículo fica **conectado por mais tempo que o configurado** após o término da carga:

```typescript
// apps/backend/src/relatorios/lib/ociosidade-processor.ts
if (tempoOcioso >= tempoOciosidadeMinutos) {
  usuariosComOciosidade.push({
    nome,
    unidade,
    torre,
    ocorrencias: registrosOciosos.length,
    tempoTotalOcioso: formatarTempo(totalMinutosOciosos),
  });
}
```

### Formato do Campo `dados_completos`

```json
{
  "relatorioId": "cm...",
  "mesAno": "11/2025",
  "empreendimento": {
    "id": "cm...",
    "nome": "Gran Marine"
  },
  "config": {
    "tarifaPonta": 3.08,
    "tarifaForaPonta": 0.53,
    "horarioPontaInicio": "18:00:00",
    "horarioPontaFim": "19:00:00"
  },
  "resumoGeral": {
    "totalRecargas": 252,
    "totalConsumo": 3805.28,
    "totalValor": 3221.44,
    "tempoTotalRecarga": "707:49:00"
  },
  "consumoPorEstacao": [
    {
      "nomeEstacao": "Gran Marine 01",
      "consumo": 1664.14
    }
  ],
  "dadosGrafico": [
    {
      "hora": "0h",
      "recargas": 23,
      "consumo": 145.67
    }
  ],
  "resumoPorUsuario": [
    {
      "nome": "Alex Purger Richa",
      "unidade": "804",
      "torre": "A",
      "totalEnergia": 77.74,
      "totalDuracao": "12:48:00",
      "cargas": 3,
      "valorTotal": 41.20
    }
  ],
  "resumoOciosidade": {
    "usuariosComOciosidade": [
      {
        "nome": "Beatriz Nunes",
        "unidade": "1506",
        "torre": "A",
        "ocorrencias": 4,
        "tempoTotalOcioso": "32h44min"
      }
    ]
  },
  "cargasDetalhadas": [
    {
      "id": 403846,
      "usuarioNome": "Alex Purger Richa",
      "unidade": "804",
      "torre": "A",
      "tagRfid": "57F44055344C40FAA99",
      "estacao": "Gran Marine 02",
      "dataInicio": "2025-10-27T21:59:00.000Z",
      "dataFim": "2025-10-28T03:36:00.000Z",
      "duracao": "5.62h",
      "energia": 32.60,
      "valor": 17.28,
      "janela": "Fora Ponta",
      "ociosidade": "00:00:00",
      "subtransacoes": [] // ou [ {janela, duracao, energia, tarifa, valor}, ... ]
    }
  ]
}
```

---

## 👥 Equipe

- **Desenvolvedor:** Cursor AI + Júlio César
- **Data de Início:** 29/01/2026
- **Data de Conclusão (Fase 1):** 30/01/2026

---

## 📝 Notas Finais

### Reversão (Rollback)

Caso seja necessário reverter para a versão anterior:

```bash
# 1. Voltar para a branch main
git checkout main

# 2. Se já fez merge, reverter o último commit
git revert HEAD

# 3. Se ainda não fez merge, apenas deletar a branch
git branch -D feature/integracao-reports-v2
```

### Backup

- ✅ Código original do Reports V2 preservado em `/app`
- ✅ Banco SQLite original preservado em `prisma/dev.db`
- ✅ Branch `feature/integracao-reports-v2` com todo histórico Git

### Contato

Para dúvidas ou problemas:
- 📧 Email: [inserir email]
- 📱 WhatsApp: [inserir contato]

---

**Última atualização:** 30/01/2026 21:58  
**Versão do documento:** 1.0

