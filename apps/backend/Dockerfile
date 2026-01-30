# ===================================
# VETRIC Backend - Dockerfile
# Multi-stage build para imagem otimizada
# ===================================

# ========== STAGE 1: BUILD ==========
FROM node:18-alpine AS builder

# Informações da imagem
LABEL maintainer="VETRIC"
LABEL description="VETRIC Backend API - Build Stage"

# Instalar dependências do sistema
RUN apk add --no-cache python3 make g++

# Diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências (incluindo dev dependencies para build)
RUN npm ci --only=production=false

# Copiar código-fonte
COPY . .

# Build do TypeScript
RUN npm run build

# ========== STAGE 2: PRODUCTION ==========
FROM node:18-alpine AS production

# Informações da imagem
LABEL maintainer="VETRIC"
LABEL description="VETRIC Backend API - Production"
LABEL version="1.0.0"

# Instalar dependências do sistema necessárias
RUN apk add --no-cache \
    postgresql-client \
    curl \
    tzdata

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Diretório de trabalho
WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar apenas dependências de produção
RUN npm ci --only=production && \
    npm cache clean --force

# Copiar código compilado do stage anterior
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/src/migrations ./src/migrations

# Criar diretórios necessários
RUN mkdir -p uploads/relatorios && \
    chown -R nodejs:nodejs uploads

# Mudar para usuário não-root
USER nodejs

# Expor porta
EXPOSE 3001

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Variáveis de ambiente padrão (podem ser sobrescritas)
ENV NODE_ENV=production \
    PORT=3001 \
    TZ=America/Sao_Paulo

# Comando para iniciar
CMD ["node", "dist/index.js"]



