BEGIN;

SET client_min_messages = 'warning';

CREATE TABLE IF NOT EXISTS indexter.users (
    email TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMIT;