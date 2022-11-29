BEGIN;

SET client_min_messages = 'warning';

CREATE TABLE IF NOT EXISTS indexter.creds (
    id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY,
    alt_user_id TEXT,
    source TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expiry_date BIGINT,
    email TEXT NOT NULL,
    CONSTRAINT fk_user
        FOREIGN KEY(email) 
            REFERENCES indexter.users(email) 
                ON DELETE CASCADE
);

COMMIT;