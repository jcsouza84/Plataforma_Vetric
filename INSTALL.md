# 📦 Guia de Instalação Detalhado

## 🎯 Pré-requisitos

Antes de começar, certifique-se de ter:

- ✅ **MacOS** (ou Linux/Windows com ajustes)
- ✅ **Node.js 18+** instalado ([download aqui](https://nodejs.org/))
- ✅ **npm** (vem com Node.js)
- ✅ **Terminal/Console** aberto
- ✅ **Credenciais de admin** do CVE-PRO

---

## 📥 Método 1: Instalação Automática (Recomendado)

### Passo 1: Abrir Terminal

```bash
# Navegue até a pasta do projeto
cd "/Users/juliocesarsouza/Desktop/VETRIC - CVE"
```

### Passo 2: Executar Script de Setup

```bash
./setup.sh
```

O script irá:
- ✅ Verificar Node.js e npm
- ✅ Instalar todas as dependências
- ✅ Criar arquivo `.env` a partir do template
- ✅ Criar estrutura de diretórios

### Passo 3: Configurar Credenciais

Edite o arquivo `.env`:

```bash
nano .env
```

Altere estas linhas:

```env
CVEPRO_USERNAME=seu_usuario_aqui    # ← Coloque seu usuário
CVEPRO_PASSWORD=sua_senha_aqui      # ← Coloque sua senha
```

Salve com **CTRL+O** e saia com **CTRL+X**

### Passo 4: Executar

```bash
./start.sh
```

Ou:

```bash
npm run dev
```

✅ **Pronto!** O Discovery Tool está rodando!

---

## 📥 Método 2: Instalação Manual

### Passo 1: Verificar Node.js

```bash
node --version
npm --version
```

Deve mostrar versão 18 ou superior.

Se não tiver instalado: [nodejs.org](https://nodejs.org/)

### Passo 2: Navegar até o Projeto

```bash
cd "/Users/juliocesarsouza/Desktop/VETRIC - CVE"
```

### Passo 3: Instalar Dependências

```bash
npm install
```

Aguarde enquanto o npm baixa e instala todos os pacotes necessários (~30 segundos).

### Passo 4: Criar Arquivo .env

```bash
cp .env.example .env
```

### Passo 5: Editar .env

Abra o arquivo `.env` em qualquer editor de texto:

```bash
# Usando nano (terminal)
nano .env

# Ou usando editor visual
open -e .env
```

Configure suas credenciais:

```env
CVEPRO_BASE_URL=https://cs.intelbras-cve-pro.com.br
CVEPRO_USERNAME=admin                    # ← SEU USUÁRIO AQUI
CVEPRO_PASSWORD=minhasenha123            # ← SUA SENHA AQUI
DEBUG_MODE=true
AUTO_RECONNECT=true
SAVE_RAW_MESSAGES=true
LOG_LEVEL=info
```

Salve o arquivo.

### Passo 6: Verificar Configuração de Carregadores

Abra `chargers.json` e verifique se os IDs estão corretos:

```json
{
  "chargers": [
    {
      "id": "JDBM1900145Z6",           // ← Confira este ID
      "name": "Gran Marine 1",
      "connectors": [1]
    },
    ...
  ]
}
```

### Passo 7: Executar Discovery Tool

```bash
npm run dev
```

---

## ✅ Verificação de Instalação

Após executar `npm run dev`, você deve ver:

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║        🔍 VETRIC CVE DISCOVERY TOOL v1.0                  ║
║                                                           ║
║        Monitoramento WebSocket CVE-PRO Intelbras          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  VALIDAÇÃO DE CONFIGURAÇÕES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Configurações válidas ✓
ℹ URL Base: https://cs.intelbras-cve-pro.com.br
ℹ Usuário: admin
ℹ Carregadores: 5
...
```

Se aparecer **erros**, veja a seção Troubleshooting abaixo.

---

## 🔧 Troubleshooting

### Erro: "node: command not found"

**Causa:** Node.js não instalado

**Solução:**
1. Baixe Node.js: https://nodejs.org/
2. Instale a versão LTS (Long Term Support)
3. Reinicie o terminal
4. Tente novamente

---

### Erro: "npm install" falha

**Causa:** Problema de rede ou permissões

**Solução:**
```bash
# Limpar cache do npm
npm cache clean --force

# Tentar novamente
npm install
```

Se persistir:
```bash
# Deletar node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install
```

---

### Erro: "Falha na autenticação"

**Causa:** Credenciais incorretas no `.env`

**Solução:**
1. Verifique se o usuário e senha estão corretos
2. Teste login manual no navegador: https://cs.intelbras-cve-pro.com.br
3. Certifique-se de não ter espaços extras no `.env`
4. Usuário deve ter permissões de administrador

---

### Erro: "Cannot find module..."

**Causa:** Dependências não instaladas

**Solução:**
```bash
npm install
```

---

### Erro: "Permission denied" ao executar ./setup.sh

**Causa:** Script não tem permissão de execução

**Solução:**
```bash
chmod +x setup.sh
chmod +x start.sh
./setup.sh
```

---

### Erro: "Falha ao conectar no WebSocket"

**Causa:** Problema de rede ou URL incorreta

**Solução:**
1. Verifique sua conexão com internet
2. Confirme que consegue acessar o CVE-PRO pelo navegador
3. Verifique se `CVEPRO_BASE_URL` está correto no `.env`
4. Desative VPN se estiver usando

---

### Nenhuma mensagem sendo recebida

**Causa:** IDs dos carregadores incorretos ou carregadores inativos

**Solução:**
1. Verifique os IDs em `chargers.json`
2. Compare com os IDs na tela do CVE-PRO
3. Inicie um carregamento para forçar mensagens
4. Ative `DEBUG_MODE=true` no `.env` para ver mais detalhes

---

## 📋 Checklist de Instalação

Use este checklist para verificar que tudo está configurado:

- [ ] Node.js 18+ instalado (`node --version`)
- [ ] npm instalado (`npm --version`)
- [ ] Projeto extraído/clonado
- [ ] `npm install` executado com sucesso
- [ ] Arquivo `.env` criado
- [ ] Credenciais configuradas no `.env`
- [ ] IDs dos carregadores verificados em `chargers.json`
- [ ] `npm run dev` executa sem erros
- [ ] Sistema conecta e subscreve aos carregadores
- [ ] Mensagens aparecem no console

---

## 🎯 Próximos Passos Após Instalação

1. **Execute o Discovery Tool:**
   ```bash
   npm run dev
   ```

2. **Realize os testes** seguindo: `TEST_CHECKLIST.md`

3. **Analise os logs coletados:**
   ```bash
   npm run analyze
   ```

4. **Revise os arquivos em:**
   - `logs/raw-messages/messages-XXXX.json`
   - `logs/combined.log`

5. **Compartilhe os resultados** para análise e desenvolvimento da Fase 2

---

## 📞 Suporte

Se encontrar problemas não listados aqui:

1. Verifique `logs/error.log`
2. Execute com `DEBUG_MODE=true`
3. Compartilhe os logs de erro (mascarando dados sensíveis)

---

## 🔄 Atualizações Futuras

Para atualizar o Discovery Tool no futuro:

```bash
# Fazer backup dos logs importantes
cp -r logs logs_backup

# Atualizar código (quando houver nova versão)
git pull  # ou extrair nova versão

# Reinstalar dependências
npm install

# Executar novamente
npm run dev
```

---

## 📚 Documentação Adicional

- **README.md** - Documentação completa
- **QUICKSTART.md** - Guia rápido de início
- **TEST_CHECKLIST.md** - Checklist de testes
- **EXPECTED_FORMATS.md** - Formatos esperados
- **SUMMARY.md** - Resumo executivo

---

**Instalação concluída com sucesso? Ótimo! 🎉**

**Execute:** `npm run dev` e comece a coletar dados!


