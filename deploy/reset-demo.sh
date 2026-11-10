#!/usr/bin/env bash
# Nightly demo reset for airbnb.kaitr.dev: the database goes back to exactly the committed
# seed (db/init/*.sql, mounted in the postgres container), Redis is flushed. Everything
# visitors created, edited or deleted during the day is gone. Auth0 accounts survive
# (auth0-sync recreates the DB user on next login). Run by airbnb-demo-reset.timer.
set -euo pipefail
P=airbnb
log() { echo "[$(date -Is)] $*"; }

for c in postgres redis be ws; do
  docker inspect "$P-$c-1" >/dev/null 2>&1 || { log "container $P-$c-1 missing - is the stack deployed?"; exit 1; }
done

restart_apps() { docker start "$P-ws-1" "$P-be-1" >/dev/null || true; }
trap restart_apps EXIT   # never leave the site down, even if a step fails

log "stopping be + ws"
docker stop "$P-be-1" "$P-ws-1" >/dev/null

log "re-creating database from db/init"
docker exec "$P-postgres-1" sh -ec '
  psql -q -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d postgres \
    -c "DROP DATABASE IF EXISTS \"$POSTGRES_DB\" WITH (FORCE)" \
    -c "CREATE DATABASE \"$POSTGRES_DB\""
  for f in /docker-entrypoint-initdb.d/*.sql; do
    psql -q -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f "$f" >/dev/null
  done
  echo "users,bids,bookings,payments,size:"
  psql -At -F, -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "select (select count(*) from users), (select count(*) from bids), (select count(*) from bookings), (select count(*) from payment_sessions), pg_size_pretty(pg_database_size(current_database()))"
'

log "flushing redis"
docker exec "$P-redis-1" redis-cli FLUSHALL >/dev/null

log "starting be + ws"
restart_apps
trap - EXIT
for i in $(seq 1 30); do
  [ "$(docker inspect -f '{{.State.Health.Status}}' "$P-be-1")" = healthy ] && { log "done: be healthy"; exit 0; }
  sleep 2
done
log "be not healthy after reset"; docker logs --tail 50 "$P-be-1"; exit 1
