"""Smoke test for demo mode (AUTH_MODE=demo, PAYMENT_MODE=mock). Stdlib only.

    python scripts/smoke_demo.py                      # default http://127.0.0.1:8000
    BASE=https://airbnb.kaitr.dev python scripts/smoke_demo.py

Expects a database freshly initialised from db/init (demo guest 500001 has an unpaid
bid on auction 1111… for 2025-08-15 -> 17). Payment steps mutate data; re-init to rerun them.
Exit code 0 = all checks passed.
"""

import json
import os
import sys
import urllib.error
import urllib.request
import uuid

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
BASE = os.getenv("BASE", "http://127.0.0.1:8000").rstrip("/")
GUEST, HOST, NOT_DEMO = 500001, 2884, 1001
AUCTION = "11111111-1111-1111-1111-111111111111"
results = []


def call(method, path, body=None, token=None, headers=None):
	h = {"Content-Type": "application/json", **(headers or {})}
	if token:
		h["Authorization"] = f"Bearer {token}"
	data = json.dumps(body).encode() if body is not None else None
	req = urllib.request.Request(BASE + path, data=data, method=method, headers=h)
	try:
		with urllib.request.urlopen(req, timeout=20) as r:
			raw = r.read()
			return r.status, (json.loads(raw) if raw else None)
	except urllib.error.HTTPError as e:
		raw = e.read()
		try:
			return e.code, json.loads(raw)
		except Exception:
			return e.code, raw.decode(errors="replace")[:300]


def check(name, ok, detail=""):
	results.append(ok)
	print(f"{'PASS' if ok else 'FAIL'}  {name}" + (f"  -> {detail}" if detail and not ok else ""))
	return ok


s, b = call("GET", "/api/v1/health")
check("health 200", s == 200, f"{s} {b}")

s, b = call("GET", "/api/v1/auth/demo-accounts")
ids = {a["id"] for a in b} if s == 200 and isinstance(b, list) else set()
check("demo accounts list guest + host", {GUEST, HOST} <= ids, f"{s} {b}")

s, b = call("GET", "/api/v1/users/me")
check("no token -> 401/403", s in (401, 403), f"{s}")

s, b = call("GET", "/api/v1/users/me", token="eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJkZW1vfDUwMDAwMSJ9.forged")
check("forged token -> 401/403", s in (401, 403), f"{s}")

s, b = call("POST", "/api/v1/auth/demo-login", {"user_id": NOT_DEMO})
check("non-demo user cannot log in -> 403", s == 403, f"{s} {b}")

s, b = call("POST", "/api/v1/auth/demo-login", {"user_id": GUEST})
guest_token = b.get("access_token") if s == 200 and isinstance(b, dict) else None
check("demo login guest", bool(guest_token), f"{s} {b}")

s, b = call("GET", "/api/v1/users/me", token=guest_token)
check("users/me returns the guest", s == 200 and isinstance(b, dict) and (b.get("id") == GUEST or (b.get("data") or {}).get("id") == GUEST), f"{s} {str(b)[:200]}")

s, b = call("POST", "/api/v1/auth/demo-login", {"user_id": HOST})
host_token = b.get("access_token") if s == 200 and isinstance(b, dict) else None
check("demo login host", bool(host_token), f"{s} {b}")

s, b = call("GET", "/api/v1/properties/search?page=1&limit=5")
check("property search 200", s == 200, f"{s} {str(b)[:200]}")

s, b = call("GET", "/api/v1/properties/3109")
check("property detail 3109", s == 200, f"{s} {str(b)[:200]}")

s, b = call("GET", f"/api/v1/auctions/property/3109")
check("auctions of property 3109", s == 200, f"{s} {str(b)[:200]}")

s, b = call("GET", f"/api/v1/bookings/host/{HOST}", token=host_token)
check("host dashboard bookings", s == 200, f"{s} {str(b)[:200]}")

# Payment (mock): 2 nights of the guest's 300.00 bid -> 300
order = {"auctionId": AUCTION, "selectedNights": ["2025-08-15", "2025-08-16"], "amount": 300, "orderInfo": "smoke"}
s, b = call("POST", "/api/v1/payment/zalopay/create", order, token=guest_token, headers={"idempotency-key": str(uuid.uuid4())})
app_trans_id = b.get("appTransId") if s == 200 and isinstance(b, dict) else None
check("mock payment create", bool(app_trans_id), f"{s} {str(b)[:300]}")

s, b = call("GET", f"/api/v1/payment/zalopay/status/{app_trans_id}", token=guest_token)
check("mock payment status PAID", s == 200 and isinstance(b, dict) and b.get("status") == "PAID", f"{s} {str(b)[:300]}")

s, b = call("POST", f"/api/v1/payment/{app_trans_id}/booking", token=guest_token)
check("booking created from payment", s in (200, 201), f"{s} {str(b)[:300]}")

s, b = call("GET", f"/api/v1/payment/{app_trans_id}/booking", token=guest_token)
check("booking readable by guest", s == 200, f"{s} {str(b)[:300]}")

passed = sum(results)
print(f"\n{passed}/{len(results)} passed")
sys.exit(0 if passed == len(results) else 1)
