BEGIN;

SET client_min_messages = 'warning';

CREATE TABLE IF NOT EXISTS indexter.user_docs (
    id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    doc_id varchar(100),
    email TEXT,
    CONSTRAINT fk_user
        FOREIGN KEY(email) 
            REFERENCES indexter.users(email) 
                ON DELETE CASCADE
);

COMMIT;