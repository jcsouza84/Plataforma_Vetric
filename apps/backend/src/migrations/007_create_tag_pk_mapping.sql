-- Migration: Criar tabela de mapeamento entre ocppTagPk e moradores
-- Usado quando a API CVE retorna ocppTagPk mas não retorna ocppIdTag

CREATE TABLE IF NOT EXISTS tag_pk_mapping (
  id SERIAL PRIMARY KEY,
  ocpp_tag_pk INTEGER NOT NULL UNIQUE,
  morador_id INTEGER NOT NULL REFERENCES moradores(id) ON DELETE CASCADE,
  observacao TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tag_pk_mapping_ocpp_tag_pk ON tag_pk_mapping(ocpp_tag_pk);
CREATE INDEX idx_tag_pk_mapping_morador_id ON tag_pk_mapping(morador_id);

COMMENT ON TABLE tag_pk_mapping IS 'Mapeamento manual entre ocppTagPk (API CVE) e moradores (quando ocppIdTag não é retornado)';
COMMENT ON COLUMN tag_pk_mapping.ocpp_tag_pk IS 'Primary Key da tag no sistema CVE-PRO';
COMMENT ON COLUMN tag_pk_mapping.morador_id IS 'ID do morador associado';
COMMENT ON COLUMN tag_pk_mapping.observacao IS 'Observações sobre o mapeamento (ex: motivo, data de cadastro manual)';

-- Inserir mapeamento para Beatriz Nunes (ocppTagPk: 4266890)
INSERT INTO tag_pk_mapping (ocpp_tag_pk, morador_id, observacao)
VALUES (
  4266890, 
  24,
  'Mapeamento manual criado pois API CVE não retorna ocppIdTag para essa tag. Identificado via painel CVE.'
)
ON CONFLICT (ocpp_tag_pk) DO NOTHING;

