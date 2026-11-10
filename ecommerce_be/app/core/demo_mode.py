"""Demo mode: run the app without the (retired) Auth0 and ZaloPay accounts.

DEMO_LOGIN=true    -> the API also issues its own HS256 tokens for whitelisted demo users
                      (POST /api/v1/auth/demo-login). Auth0 RS256 tokens keep working when
                      AUTH0_DOMAIN is set, so both logins can be offered side by side.
                      (AUTH_MODE=demo is accepted as an alias.)
PAYMENT_MODE=mock  -> ZaloPay create/query are simulated; payments succeed immediately.

Demo tokens carry sub="demo|<user id>", matched against users.auth0_id exactly like
an Auth0 subject, so every route keeps using the same auth dependency.
"""

import os
import time
from typing import Optional

import jwt

DEMO_LOGIN = (
	os.getenv("DEMO_LOGIN", "").strip().lower() in ("1", "true", "yes")
	or os.getenv("AUTH_MODE", "").strip().lower() == "demo"
)
PAYMENT_MODE = os.getenv("PAYMENT_MODE", "zalopay").strip().lower()

DEMO_ISSUER = "ec-airbnb-demo"
DEMO_AUDIENCE = "ec-airbnb-api"
DEMO_TOKEN_TTL_SECONDS = int(os.getenv("DEMO_TOKEN_TTL_SECONDS", str(8 * 3600)))
# Only these users can be logged into without a password.
DEMO_USER_IDS = [int(x) for x in os.getenv("DEMO_USER_IDS", "500001,2884").split(",") if x.strip().isdigit()]

_SECRET = os.getenv("DEMO_JWT_SECRET", "")
_MIN_SECRET_LEN = 32


def is_demo_auth() -> bool:
	return DEMO_LOGIN


def is_demo_token(token: str) -> bool:
	"""Demo tokens are HS256 with our issuer; Auth0 tokens are RS256. Each path verifies
	with a fixed algorithm, so a token cannot be accepted by the other verifier."""
	try:
		header = jwt.get_unverified_header(token)
		claims = jwt.decode(token, options={"verify_signature": False})
	except jwt.PyJWTError:
		return False
	return header.get("alg") == "HS256" and claims.get("iss") == DEMO_ISSUER


def is_mock_payment() -> bool:
	return PAYMENT_MODE == "mock"


def secret_configured() -> bool:
	return len(_SECRET) >= _MIN_SECRET_LEN


def demo_subject(user_id: int) -> str:
	return f"demo|{user_id}"


def issue_token(user_id: int, email: Optional[str]) -> tuple[str, int]:
	if not secret_configured():
		raise RuntimeError(f"DEMO_JWT_SECRET must be set (>= {_MIN_SECRET_LEN} chars) when DEMO_LOGIN=true")
	now = int(time.time())
	payload = {
		"sub": demo_subject(user_id),
		"email": email,
		"iss": DEMO_ISSUER,
		"aud": DEMO_AUDIENCE,
		"iat": now,
		"exp": now + DEMO_TOKEN_TTL_SECONDS,
	}
	return jwt.encode(payload, _SECRET, algorithm="HS256"), DEMO_TOKEN_TTL_SECONDS


def decode_token(token: str) -> dict:
	"""Raises jwt.ExpiredSignatureError / jwt.InvalidTokenError like the Auth0 path."""
	if not secret_configured():
		raise jwt.InvalidTokenError("demo secret not configured")
	return jwt.decode(token, _SECRET, algorithms=["HS256"], audience=DEMO_AUDIENCE, issuer=DEMO_ISSUER)
