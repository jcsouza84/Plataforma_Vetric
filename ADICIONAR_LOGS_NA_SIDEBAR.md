# 📋 Como Adicionar "Logs" na Sidebar

## ✅ Migration Aplicada com Sucesso!

A tabela `logs_sistema` foi criada no banco de dados Render.

```
✅ CREATE TABLE logs_sistema
✅ CREATE 8 INDEXES
✅ CREATE 2 VIEWS (stats e recentes)
✅ CREATE 2 FUNCTIONS (inserir_log, limpar_logs_antigos)
✅ 1 registro inicial inserido
```

---

## 📍 ONDE ADICIONAR O LINK

Você precisa adicionar o link "Logs" **abaixo de "Configurações"** na sua sidebar.

### Opção 1: Se você usa React Router

**Exemplo de código:**

```tsx
import { Link, useLocation } from 'react-router-dom';
import { FileText, Settings, Activity } from 'lucide-react'; // ou react-icons

function Sidebar() {
  const location = useLocation();
  
  const menuItems = [
    { path: '/', label: 'Dashboard', icon: Activity },
    { path: '/moradores', label: 'Moradores', icon: Users },
    { path: '/carregamentos', label: 'Carregamentos', icon: Zap },
    { path: '/config', label: 'Configurações', icon: Settings },
    { path: '/logs', label: 'Logs', icon: FileText }, // ← ADICIONAR AQUI
  ];
  
  return (
    <nav>
      {menuItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={location.pathname === item.path ? 'active' : ''}
        >
          <item.icon />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
```

### Opção 2: Se você usa ShadcN UI Sidebar

**Arquivo:** Onde você define os items da sidebar

```tsx
import { FileText } from 'lucide-react';

const menuItems = [
  // ... outros items ...
  {
    title: "Configurações",
    url: "/config",
    icon: Settings,
  },
  {
    title: "Logs", // ← ADICIONAR AQUI
    url: "/logs",
    icon: FileText,
    badge: "Novo", // opcional
  },
];
```

### Opção 3: HTML Puro

```html
<nav class="sidebar">
  <!-- ... outros links ... -->
  <a href="/config">
    <i class="icon-settings"></i>
    <span>Configurações</span>
  </a>
  
  <!-- ADICIONAR AQUI -->
  <a href="/logs">
    <i class="icon-terminal"></i>
    <span>Logs</span>
  </a>
</nav>
```

---

## 🛣️ ADICIONAR ROTA

**Se você usa React Router:**

```tsx
// App.tsx ou seu arquivo de rotas

import MonitorTerminal from './pages/MonitorTerminal';

<Routes>
  {/* ... outras rotas ... */}
  <Route path="/config" element={<ConfigPage />} />
  <Route path="/logs" element={<MonitorTerminal />} /> {/* ← ADICIONAR */}
</Routes>
```

---

## 🎨 ÍCONES SUGERIDOS

Escolha um ícone para "Logs":

### Lucide React
```tsx
import { FileText, Terminal, Activity, ScrollText } from 'lucide-react';
```

### React Icons
```tsx
import { MdOutlineTerminal } from 'react-icons/md';
import { FiFileText } from 'react-icons/fi';
import { BsTerminal } from 'react-icons/bs';
```

### Font Awesome
```html
<i class="fas fa-terminal"></i>
<i class="fas fa-file-alt"></i>
<i class="fas fa-stream"></i>
```

---

## 🎯 RESULTADO ESPERADO

Depois de adicionar, sua sidebar deve ficar assim:

```
┌─────────────────────┐
│  📊 Dashboard       │
│  👥 Moradores       │
│  ⚡ Carregamentos   │
│  ⚙️  Configurações   │
│  📄 Logs            │ ← NOVO!
└─────────────────────┘
```

Ao clicar em "Logs", abre a interface do Monitor Terminal.

---

## ✅ CHECKLIST

- [x] Migration aplicada no banco
- [ ] Link "Logs" adicionado na sidebar
- [ ] Rota `/logs` configurada
- [ ] Ícone escolhido e adicionado
- [ ] Testado no navegador

---

## 🧪 TESTAR

1. **Iniciar Backend:**
```bash
cd apps/backend
npm run dev
```

2. **Iniciar Frontend:**
```bash
cd apps/interface
npm run dev
```

3. **Acessar:**
- Abra: `http://localhost:3000`
- Clique em "Logs" na sidebar
- Veja a interface do monitor terminal

---

## 📺 O QUE VOCÊ VERÁ

Interface tipo terminal mostrando:
- ✅ Logs em tempo real
- ✅ Filtros por tipo e nível
- ✅ Estatísticas por carregador
- ✅ Auto-refresh a cada 2 segundos

---

## 💡 DICA: ACESSO DIRETO

Se não quiser adicionar na sidebar agora, pode acessar diretamente:

```
http://localhost:3000/logs
```

Ou em produção:
```
https://sua-interface.render.com/logs
```

---

## ❓ PRECISA DE AJUDA?

Se sua estrutura de sidebar for diferente, me envie:
1. Screenshot da sidebar atual
2. Ou o arquivo onde os links estão definidos

Aí eu te ajudo a adicionar exatamente no lugar certo! 😊

---

**Status Atual:**
- ✅ Banco de Dados: Migration aplicada
- ✅ Backend: API `/api/logs` funcionando
- ✅ Frontend: Componente MonitorTerminal criado
- ⏳ Sidebar: Aguardando adição do link

**Próximo passo:** Adicionar link na sidebar! 🚀
