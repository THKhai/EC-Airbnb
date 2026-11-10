# Deploy: https://airbnb.kaitr.dev

Runs on the home server behind the shared Traefik + Cloudflare Tunnel (`~/infra`).
`*.kaitr.dev` already routes to Traefik, so no Cloudflare change is needed.

## One-time setup (on the server)

```bash
# 1. Secrets file (the Deploy workflow copies it next to docker-compose.prod.yml)
mkdir -p ~/apps/airbnb
curl -fsSL https://raw.githubusercontent.com/THKhai/EC-Airbnb/main/deploy/.env.example -o ~/apps/airbnb/.env
chmod 600 ~/apps/airbnb/.env
nano ~/apps/airbnb/.env      # fill POSTGRES_PASSWORD, RABBITMQ_PASSWORD, DEMO_JWT_SECRET (+ Auth0 if used)
#    secret generator:  openssl rand -base64 36 | tr -d '/+=' | cut -c1-40

# 2. Self-hosted runner for this repo (token is valid 1h, never commit it)
cd ~/infra
bash scripts/add-runner.sh THKhai/EC-Airbnb "$(gh api -X POST repos/THKhai/EC-Airbnb/actions/runners/registration-token --jq .token)" airbnb

# 3. First deploy: push to main, or GitHub → Actions → Deploy → Run workflow

# 4. Nightly demo reset (04:00 Vietnam time), after the first deploy succeeded
cd ~/actions-runner/airbnb/_work/EC-Airbnb/EC-Airbnb
sudo cp deploy/systemd/airbnb-demo-reset@.service deploy/systemd/airbnb-demo-reset@.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now "airbnb-demo-reset@$(id -un).timer"
```

## Operations

```bash
docker compose -p airbnb ps                         # all 6 services running/healthy
docker compose -p airbnb logs --tail 100 be         # backend log (token rejections are logged with the reason)
bash ~/apps/airbnb/reset-demo.sh                    # reset demo data now
systemctl list-timers 'airbnb-demo-reset*'          # next/last nightly reset
journalctl -u "airbnb-demo-reset@$(id -un)" -n 30   # last reset output (row counts + DB size)
```

- Editing `~/apps/airbnb/.env` requires re-running the Deploy workflow (containers read env at start).
- `NEXT_PUBLIC_*` values are baked into the frontend at build time: changing them also needs a Deploy.
- Full functional test (mutates data: creates a payment + booking; run `reset-demo.sh` afterwards):
  `docker compose -p airbnb exec -T be python scripts/smoke_demo.py`

## What the reset does

`reset-demo.sh` stops `be`/`ws`, drops and re-creates the database from `db/init/*.sql` (the same files
the postgres image used on first start), flushes Redis, starts `be`/`ws` and waits for health.
Auth0 accounts are kept by Auth0; the DB user is recreated on the next login (`auth0-sync`).
The RabbitMQ bid stream is capped at ~5 MB (`max-length-bytes`), so it does not grow either.
