# ⚡ QUICK REFERENCE - EVOLUTION API

**Referência rápida para consulta diária**

---

## 🔑 CONFIGURAÇÕES VALIDADAS

```
URL:       http://habbora-evolutionapi-cf4643-46-202-146-195.traefik.me
API Key:   t1ld6RKtyZTn9xqlz5WVubfMRt8jNkPc1NAlOx1SZcmTq5lNZl+YVk308sJ+RxoDdBNCGpnAo0uhGM77K9vJHg==
Instância: Vetric Bot
Número:    5582991096461
```

---

## 🧪 TESTE RÁPIDO VIA INTERFACE

1. Login: `admin@vetric.com.br` / `Vetric@2026`
2. **Configurações** → **Evolution API** → **"Testar Envio"**
3. Telefone: `5582996176797`
4. Enviar teste

✅ **Deve funcionar imediatamente!**

---

## 🧪 TESTE VIA cURL

```bash
curl -X POST \
  "http://habbora-evolutionapi-cf4643-46-202-146-195.traefik.me/message/sendText/Vetric%20Bot" \
  -H "Content-Type: application/json" \
  -H "apikey: t1ld6RKtyZTn9xqlz5WVubfMRt8jNkPc1NAlOx1SZcmTq5lNZl+YVk308sJ+RxoDdBNCGpnAo0uhGM77K9vJHg==" \
  -d '{"number": "5582996176797", "text": "Teste"}'
```

---

## 📊 VERIFICAR CONFIGURAÇÕES NO BANCO

```sql
SELECT chave, valor FROM configuracoes_sistema WHERE chave LIKE 'evolution_%';
```

---

## 🔄 EDITAR CONFIGURAÇÕES

### **Via Interface (Recomendado):**
1. Login como Admin
2. **Configurações** → **Evolution API**
3. Editar campos
4. **Salvar Configurações**
5. ✅ **Não precisa reiniciar!**

### **Via SQL:**
```sql
-- Atualizar URL
UPDATE configuracoes_sistema SET valor = 'nova-url' WHERE chave = 'evolution_api_url';

-- Atualizar API Key
UPDATE configuracoes_sistema SET valor = 'nova-key' WHERE chave = 'evolution_api_key';

-- Atualizar Instância
UPDATE configuracoes_sistema SET valor = 'Nova Instancia' WHERE chave = 'evolution_instance';
```

---

## 📱 5 TIPOS DE NOTIFICAÇÕES

| Tipo | Quando | Status |
|------|--------|--------|
| **inicio** | Carregamento iniciado | ✅ Ativo |
| **fim** | Carregamento concluído | ✅ Ativo |
| **erro** | Erro no carregamento | ✅ Ativo |
| **ocioso** | Carregador parado há tempo | ✅ Ativo |
| **disponivel** | Carregador ficou livre | ✅ Ativo |

---

## 🔍 TROUBLESHOOTING RÁPIDO

### **Erro 404**
→ URL ou instância incorreta. Verifique no banco.

### **Erro 401**
→ API Key inválida. Verifique no banco.

### **Erro 500**
→ Backend não conectou ao banco. Verifique logs.

### **Notificação não enviada**
→ Verifique:
1. Template ativo?
2. Morador tem notificações ativas?
3. Morador tem telefone?

---

## 📋 LOGS DE ENVIO

```sql
-- Últimas 20 notificações
SELECT 
  l.id, l.tipo, l.status, l.telefone, l.enviado_em, m.nome
FROM logs_notificacoes l
LEFT JOIN moradores m ON l.morador_id = m.id
ORDER BY l.enviado_em DESC
LIMIT 20;

-- Estatísticas do dia
SELECT 
  tipo, COUNT(*) as total,
  SUM(CASE WHEN status = 'enviado' THEN 1 ELSE 0 END) as sucesso,
  SUM(CASE WHEN status = 'falha' THEN 1 ELSE 0 END) as falhas
FROM logs_notificacoes
WHERE enviado_em >= CURRENT_DATE
GROUP BY tipo;
```

---

## 🚀 REINICIAR BACKEND

```bash
cd /Users/juliocesarsouza/Desktop/VETRIC\ -\ CVE/vetric-dashboard/backend
npm run dev
```

---

## 📚 DOCUMENTAÇÃO COMPLETA

Para mais detalhes, veja:
- **[INTEGRACAO_EVOLUTION_API.md](./INTEGRACAO_EVOLUTION_API.md)** - Guia completo
- **[README_DOCUMENTACAO.md](./README_DOCUMENTACAO.md)** - Índice geral

---

**✅ Sistema 100% Operacional**  
**Última atualização:** 12/01/2026





