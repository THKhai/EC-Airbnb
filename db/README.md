# Database init (PostgreSQL 16)

`db/init/*.sql` is the single source of truth for a fresh database. The official
postgres image runs these files in name order on the **first start with an empty
data directory**, and aborts on the first error.

| File | Content | Origin |
|---|---|---|
| 01_schema.sql | All tables, FKs, indexes (incl. payment tables) | `combined_schema_dump.sql`, fixed |
| 02_bid_events_trigger.sql | Trigger: bid insert → bid_events | V.0_0_0 |
| 03_bids_calendar_changes.sql | bids/calendar columns + constraints | V.0_0_5 |
| 04_calendar_functions.sql | `get_calendar_*` functions | V.0_0_3 |
| 05_users_model_alignment.sql | `users.auth0_id` (+ unique index), selected by the User model | users_auth0_id_migration.sql |
| 10_seed_users.sql | Hosts 1001-1020, demo host 2884 | new |
| 11_seed_properties.sql | 20 properties | V.0_0_1 |
| 12_seed_guests_auctions.sql | Guests 500001-500005, auctions | V.0_0_2 |
| 14_property_types_notification.sql | property_types/categories, notification/subscription changes | V.0_0_4, fixed |
| 15_seed_host_dashboard.sql | 5 properties + auctions + 90 bookings for host 2884 | HostDashboard.sql, fixed |
| 16_seed_property_images.sql | Property images | V.0_0_6 |
| 17_seed_bids_payments.sql | 3 bids/auction, PAID payments for ended auctions | new |
| 99_reset_sequences.sql | Move every sequence past max(id) (seeds use explicit ids) | new |

Fixes applied to the originals (kept untouched in `Repository/Migration_scripts/postgres/`):
- `ADD CONSTRAINT IF NOT EXISTS` is not valid PostgreSQL → every FK was silently skipped. Now plain `ADD CONSTRAINT`.
- `uuid_generate_v4()` → built-in `gen_random_uuid()`; the `uuid-ossp` extension is no longer needed.
- V.0_0_4: trailing comma before `ALTER TABLE subscription` (syntax error).
- V.0_0_4 dropped `notification.type`, but the backend model requires it → that DROP is removed.
- Order: V.0_0_5 must run before V.0_0_3 (functions use `calendar_availability.auction_id`);
  hosts must exist before properties; images after HostDashboard (it creates properties 1-5).
- Duplicate `payment_tables*.sql` dropped: the tables are already in 01_schema.

Expected after init: 0 errors; users 26, properties 25, auctions 99, bids 297,
bid_events 297, bookings 90, payment_sessions 10.

Reset (destroys all data):
```bash
docker compose down && rm -rf Repository/postgres_data && docker compose up -d postgres
docker compose logs postgres | grep -c ERROR   # must be 0
```
