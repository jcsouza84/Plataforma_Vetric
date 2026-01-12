# 🔑 COMO PEGAR O TOKEN CVE-PRO

## ✅ O QUE JÁ FUNCIONA:
- Login VETRIC: OK ✅
- Backend: OK ✅
- Frontend: OK ✅

## ❌ O QUE FALTA:
- Dados dos carregadores (API CVE-Pro desconectada)

---

## 📋 PASSO A PASSO PARA CONECTAR A API CVE-PRO:

### OPÇÃO 1: Extrair Token do Browser (RECOMENDADO)

1. **Abra o Chrome em ABA ANÔNIMA** (Cmd+Shift+N)

2. **Acesse:** https://cs.intelbras-cve-pro.com.br

3. **Faça login:**
   - Email: `julio@mundologic.com.br`
   - Senha: `1a2b3c4d`

4. **Pressione F12** (ou Cmd+Opt+I no Mac)

5. **Clique na aba "Application"** (ou "Aplicativo")

6. **No menu lateral esquerdo:**
   - Expanda: **Local Storage**
   - Clique em: **cs.intelbras-cve-pro.com.br**

7. **Procure a chave:** `auth-token` ou `token`

8. **Copie o VALOR** (um texto longo começando com eyJ...)

9. **Abra o arquivo:**
   ```
   /Users/juliocesarsouza/Desktop/VETRIC - CVE/vetric-dashboard/backend/.env
   ```

10. **Adicione ou edite a linha:**
    ```
    CVE_TOKEN=cole_o_token_aqui_sem_aspas
    ```

11. **Salve o arquivo**

12. **Reinicie o backend:** No terminal, execute:
    ```bash
    pkill -f "ts-node src/index.ts"
    cd "/Users/juliocesarsouza/Desktop/VETRIC - CVE/vetric-dashboard/backend"
    npm run dev
    ```

13. **Aguarde 10 segundos** e recarregue o dashboard!

---

### OPÇÃO 2: Dados Mockados (Para Testar Interface)

Se quiser apenas ver o sistema funcionando com dados fictícios:

Execute no terminal:
```bash
cd "/Users/juliocesarsouza/Desktop/VETRIC - CVE"
./enable-mock-data.sh
```

---

## 🆘 PRECISA DE AJUDA?

Me chame que eu te ajudo a pegar o token! 😊

