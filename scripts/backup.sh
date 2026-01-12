#!/bin/bash

# ═══════════════════════════════════════════════════════════
# 💾 VETRIC - Script de Backup
# ═══════════════════════════════════════════════════════════
# 
# Este script cria backups do:
# 1. Banco de dados PostgreSQL
# 2. Arquivos de upload (relatórios)
# 3. Arquivos .env (configurações)
# 
# USO:
#   ./scripts/backup.sh
# 
# ═══════════════════════════════════════════════════════════

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}💾 Iniciando backup...${NC}"

# ┌─────────────────────────────────────────────────────────┐
# │ CONFIGURAÇÕES                                            │
# └─────────────────────────────────────────────────────────┘

# Data e hora para nome do backup
DATE=$(date +%Y%m%d_%H%M%S)

# Diretório de backups
BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"

# Nome do banco (ler do .env se possível)
if [ -f "./vetric-dashboard/backend/.env" ]; then
    DB_NAME=$(grep DB_NAME ./vetric-dashboard/backend/.env | cut -d '=' -f2)
    DB_USER=$(grep DB_USER ./vetric-dashboard/backend/.env | cut -d '=' -f2)
else
    DB_NAME="vetric_db"
    DB_USER="postgres"
fi

# ┌─────────────────────────────────────────────────────────┐
# │ BACKUP DO BANCO DE DADOS                                 │
# └─────────────────────────────────────────────────────────┘

echo -e "${BLUE}📊 Backup do banco de dados...${NC}"

BACKUP_FILE="$BACKUP_DIR/db_${DATE}.sql"

if command -v pg_dump &> /dev/null; then
    # Usar pg_dump (PostgreSQL)
    pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"
    
    # Comprimir
    gzip "$BACKUP_FILE"
    BACKUP_FILE="${BACKUP_FILE}.gz"
    
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}✅ Backup do banco: ${BACKUP_FILE} (${SIZE})${NC}"
else
    echo -e "${YELLOW}⚠️  pg_dump não encontrado, pulando backup do banco${NC}"
fi

# ┌─────────────────────────────────────────────────────────┐
# │ BACKUP DE UPLOADS (Relatórios)                          │
# └─────────────────────────────────────────────────────────┘

if [ -d "./vetric-dashboard/backend/uploads" ]; then
    echo -e "${BLUE}📁 Backup de uploads...${NC}"
    
    UPLOADS_BACKUP="$BACKUP_DIR/uploads_${DATE}.tar.gz"
    tar -czf "$UPLOADS_BACKUP" -C ./vetric-dashboard/backend uploads/
    
    SIZE=$(du -h "$UPLOADS_BACKUP" | cut -f1)
    echo -e "${GREEN}✅ Backup de uploads: ${UPLOADS_BACKUP} (${SIZE})${NC}"
fi

# ┌─────────────────────────────────────────────────────────┐
# │ BACKUP DO .ENV (Configurações)                          │
# └─────────────────────────────────────────────────────────┘

if [ -f "./vetric-dashboard/backend/.env" ]; then
    echo -e "${BLUE}⚙️  Backup de configurações...${NC}"
    
    ENV_BACKUP="$BACKUP_DIR/env_${DATE}.backup"
    cp ./vetric-dashboard/backend/.env "$ENV_BACKUP"
    
    echo -e "${GREEN}✅ Backup do .env: ${ENV_BACKUP}${NC}"
fi

# ┌─────────────────────────────────────────────────────────┐
# │ LIMPEZA DE BACKUPS ANTIGOS (Manter últimos 7 dias)      │
# └─────────────────────────────────────────────────────────┘

echo -e "${BLUE}🧹 Limpando backups antigos...${NC}"

# Deletar backups com mais de 7 dias
find "$BACKUP_DIR" -name "db_*.sql.gz" -mtime +7 -delete
find "$BACKUP_DIR" -name "uploads_*.tar.gz" -mtime +7 -delete
find "$BACKUP_DIR" -name "env_*.backup" -mtime +7 -delete

BACKUP_COUNT=$(ls -1 "$BACKUP_DIR" | wc -l)
echo -e "${GREEN}✅ Backup concluído! (${BACKUP_COUNT} arquivos mantidos)${NC}"
echo ""

