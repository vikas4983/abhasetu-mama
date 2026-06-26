-- @file 001_abdm_schema.sql
-- @description ABDM schema: accounts, sessions, transactions, callbacks, care contexts, consents

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE SCHEMA IF NOT EXISTS abdm;

CREATE TABLE IF NOT EXISTS abdm.abha_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  abha_number_masked VARCHAR(20) NOT NULL,
  abha_address VARCHAR(100),
  preferred_name VARCHAR(200),
  status VARCHAR(30) DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS abdm.abha_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES abdm.abha_accounts(id),
  x_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS abdm.abdm_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL,
  txn_id VARCHAR(100),
  flow_type VARCHAR(50) NOT NULL,
  status VARCHAR(30) DEFAULT 'PENDING',
  correlation_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_abdm_transactions_request_id ON abdm.abdm_transactions(request_id);
CREATE INDEX IF NOT EXISTS idx_abdm_transactions_txn_id ON abdm.abdm_transactions(txn_id);

CREATE TABLE IF NOT EXISTS abdm.callback_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL,
  endpoint VARCHAR(200) NOT NULL,
  payload_hash VARCHAR(64),
  status VARCHAR(30) DEFAULT 'RECEIVED',
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_callback_events_request_id ON abdm.callback_events(request_id);

CREATE TABLE IF NOT EXISTS abdm.care_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES abdm.abha_accounts(id),
  reference_number VARCHAR(100) NOT NULL,
  display_name VARCHAR(300),
  hi_type VARCHAR(50),
  hip_id VARCHAR(100),
  linked_at TIMESTAMPTZ,
  status VARCHAR(30) DEFAULT 'UNLINKED',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS abdm.link_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL,
  txn_id VARCHAR(100),
  abha_address VARCHAR(100),
  link_ref_number VARCHAR(100),
  status VARCHAR(30) DEFAULT 'INITIATED',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS abdm.health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  care_context_id UUID REFERENCES abdm.care_contexts(id),
  hi_type VARCHAR(50) NOT NULL,
  fhir_bundle JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS abdm.consent_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL,
  consent_request_id VARCHAR(100),
  abha_address VARCHAR(100),
  purpose VARCHAR(50),
  hi_types TEXT[],
  status VARCHAR(30) DEFAULT 'REQUESTED',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS abdm.consent_artefacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consent_id VARCHAR(100) NOT NULL UNIQUE,
  artefact JSONB NOT NULL,
  expires_at TIMESTAMPTZ,
  status VARCHAR(30) DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS abdm.health_info_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consent_id VARCHAR(100),
  hip_id VARCHAR(100),
  hiu_id VARCHAR(100),
  record_count INT DEFAULT 0,
  status VARCHAR(30) DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS abdm.schema_migrations (
  version VARCHAR(50) PRIMARY KEY,
  applied_at TIMESTAMPTZ DEFAULT NOW()
);
