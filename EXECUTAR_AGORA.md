# ⚡ EXECUÇÃO RÁPIDA DO TESTE - 3 Opções Simples

## 🎯 IMPOSSÍVEL EXECUTAR 100% AUTOMÁTICO

Motivo: O arquivo `.env` com DATABASE_URL está protegido (e deve permanecer assim por segurança!)

**MAS** criei 3 opções MUITO simples para você executar:

---

## ✅ OPÇÃO 1: Script Interativo (MAIS FÁCIL) ⭐

Execute este comando no terminal:

```bash
cd "/Users/juliocesarsouza/Desktop/VETRIC - CVE"
node executar-teste-interativo.js
```

O script vai:
1. Pedir a DATABASE_URL
2. Você cola a URL do Render
3. Pressiona ENTER
4. **Pronto!** Teste executado automaticamente! 🎉

---

## ✅ OPÇÃO 2: Uma Linha Só (RÁPIDO)

```bash
cd "/Users/juliocesarsouza/Desktop/VETRIC - CVE" && DATABASE_URL="COLE_URL_AQUI" npx ts-node buscar-transacao-auto.ts
```

Substitua `COLE_URL_AQUI` pela URL do Render e execute!

---

## ✅ OPÇÃO 3: Duas Linhas (TRADICIONAL)

```bash
cd "/Users/juliocesarsouza/Desktop/VETRIC - CVE"
export DATABASE_URL="postgresql://usuario:senha@host/database"
npx ts-node buscar-transacao-auto.ts
```

---

## 📋 Onde Obter a DATABASE_URL

1. https://dashboard.render.com
2. Backend → Environment
3. Copiar `DATABASE_URL`

Formato:
```
postgresql://vetric_xxx:senha@dpg-xxx.oregon-postgres.render.com/vetric_xxx
```

---

## 🎯 RECOMENDAÇÃO

**Use a OPÇÃO 1** (script interativo):

```bash
cd "/Users/juliocesarsouza/Desktop/VETRIC - CVE"
node executar-teste-interativo.js
```

É o mais fácil! Ele vai pedir a URL e executar tudo automaticamente! ✨

---

## 📊 O Que Vai Mostrar

```
✅ TRANSAÇÃO ENCONTRADA!

Transaction PK:   439071
Carregador:       Gran Marine 6
Morador:          Saskya Lorena
INÍCIO:           2026-01-30 20:45:00
FIM:              ✅ 2026-01-30 22:35:00  ← OU ❌ NULL

✅ Notificações encontradas:
  - Notificação 1: Início ✅
  - Notificação 2: Fim ✅ ← OU Ausente ❌
```

---

## 🚀 EXECUTE AGORA!

Escolha uma opção e execute! Me mostre o resultado! 🎯

---

**Desenvolvido para VETRIC** 🚀

