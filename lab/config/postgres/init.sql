-- AegisAI Local Lab — PostgreSQL Initialization
-- Creates platform databases and user roles for local development.

CREATE SCHEMA IF NOT EXISTS aegisai_platform;
CREATE SCHEMA IF NOT EXISTS aegisai_audit;

-- Platform core tables (minimal bootstrap)
CREATE TABLE IF NOT EXISTS aegisai_platform.services (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL UNIQUE,
    owner_team  VARCHAR(255) NOT NULL,
    status      VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS aegisai_platform.deployments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id      UUID REFERENCES aegisai_platform.services(id),
    version         VARCHAR(100) NOT NULL,
    environment     VARCHAR(50) NOT NULL,
    status          VARCHAR(50) NOT NULL DEFAULT 'pending',
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS aegisai_audit.events (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type  VARCHAR(100) NOT NULL,
    source      VARCHAR(255) NOT NULL,
    actor       VARCHAR(255),
    payload     JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_events_type ON aegisai_audit.events(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_events_created ON aegisai_audit.events(created_at);
CREATE INDEX IF NOT EXISTS idx_deployments_service ON aegisai_platform.deployments(service_id);

-- Seed data for platform services
INSERT INTO aegisai_platform.services (name, owner_team, status) VALUES
    ('aegisai-orchestrator', 'ai-platform', 'active'),
    ('aegisai-portal-api', 'platform-eng', 'active'),
    ('aegisai-cli', 'platform-eng', 'active'),
    ('aegisai-gatekeeper', 'security', 'active'),
    ('aegisai-finops', 'observability', 'inactive')
ON CONFLICT (name) DO NOTHING;
