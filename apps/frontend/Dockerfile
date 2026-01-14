# ===================================
# VETRIC Frontend - Dockerfile
# Multi-stage: Build + Preview Server
# ===================================

# ========== STAGE 1: BUILD ==========
FROM node:18-alpine AS builder

# Informações da imagem
LABEL maintainer="VETRIC"
LABEL description="VETRIC Frontend Dashboard - Build Stage"

# Diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar TODAS as dependências (incluindo devDependencies para build)
RUN npm ci

# Copiar código-fonte
COPY . .

# Build arguments para configuração
ARG VITE_API_URL=http://localhost:3001
ENV VITE_API_URL=$VITE_API_URL

# Build da aplicação
RUN npm run build

# ========== STAGE 2: PRODUCTION ==========
FROM node:18-alpine AS production

# Informações da imagem
LABEL maintainer="VETRIC"
LABEL description="VETRIC Frontend Dashboard - Production"
LABEL version="1.0.0"

# Diretório de trabalho
WORKDIR /app

# Copiar apenas package.json
COPY package*.json ./

# Instalar APENAS dependências de produção + vite (necessário para preview)
RUN npm ci --only=production && \
    npm install vite && \
    npm cache clean --force

# Copiar apenas o build do stage anterior
COPY --from=builder /app/dist ./dist

# Copiar vite.config.ts (necessário para preview server)
COPY --from=builder /app/vite.config.ts ./vite.config.ts

# Expor porta
EXPOSE 4173

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD node -e "require('http').get('http://localhost:4173', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando para iniciar servidor preview do Vite
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "4173"]

