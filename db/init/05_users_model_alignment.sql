-- Columns the backend's User model (app/db/models/user.py) selects on every query.
-- Without them any users query fails with "column users.auth0_id does not exist".
-- (phone_number, gender are added by 16_ / V.0_0_6.)
-- auth0_id: from Repository/.../users_auth0_id_migration.sql (minus CONCURRENTLY, not needed on an empty DB).
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS auth0_id varchar(255);
CREATE UNIQUE INDEX IF NOT EXISTS users_auth0_id_unique_idx ON public.users(auth0_id) WHERE auth0_id IS NOT NULL;
