-- Seed users: hosts referenced by the property seeds (ids 1001-1020, 2884).
-- Accounts originally came from Auth0 sign-ups, which no longer exist.
-- 2884 is the demo host (has Host Dashboard data); 500001 (in 12_) is the demo guest.
INSERT INTO users (id, email, username, full_name, first_name, last_name, verification_status, is_active, is_super_host)
SELECT 1000 + n, 'host' || n || '@demo.kaitr.dev', 'host_' || n, 'Demo Host ' || n, 'Demo', 'Host ' || n, 'VERIFIED', true, n % 4 = 0
FROM generate_series(1, 20) AS n;

INSERT INTO users (id, email, username, full_name, first_name, last_name, verification_status, is_active, is_super_host, host_about)
VALUES (2884, 'demo.host@demo.kaitr.dev', 'demo_host', 'Demo Host', 'Demo', 'Host', 'VERIFIED', true, true,
        'Demo host account for the portfolio showcase.');
