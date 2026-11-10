"""Authentication dependencies."""

from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session
import jwt
from jwt import PyJWKClient

from ..models import User
from ..exceptions import AuthenticationError, TokenExpiredError, InvalidTokenError
from .database import get_db_session
from ...core.config import settings
from ...core import demo_mode

import logging
_log = logging.getLogger(__name__)

security = HTTPBearer(auto_error=False)

# JWKS client for Auth0
_JWKS_URL = f"https://{settings.auth0.domain}/.well-known/jwks.json" if settings.auth0.domain else ""
_jwk_client: Optional[PyJWKClient] = PyJWKClient(_JWKS_URL) if _JWKS_URL else None


def _decode_with_jwks(token: str) -> dict:
	"""Decode a demo HS256 token (DEMO_LOGIN=true) or an Auth0 RS256 token via JWKS (kid-based)."""
	if demo_mode.is_demo_auth() and demo_mode.is_demo_token(token):
		try:
			return demo_mode.decode_token(token)
		except jwt.ExpiredSignatureError:
			raise TokenExpiredError()
		except jwt.InvalidTokenError:
			raise InvalidTokenError()
	if not _jwk_client:
		raise AuthenticationError("Auth0 domain not configured for JWKS")
	try:
		# Fetch signing key by kid and decode
		signing_key = _jwk_client.get_signing_key_from_jwt(token).key
		payload = jwt.decode(
			token,
			signing_key,
			algorithms=["RS256"],
			audience=settings.auth0.audience,
			leeway=demo_mode.CLOCK_SKEW_LEEWAY_SECONDS,
			issuer=f"https://{settings.auth0.domain}/" if settings.auth0.domain else None,
		)
		return payload
	except jwt.ExpiredSignatureError:
		raise TokenExpiredError()
	except jwt.InvalidTokenError as e:
		# Log the reason (never the token) so 401s are diagnosable, e.g. ImmatureSignatureError
		# when the server clock is behind the issuer.
		_log.warning("Auth0 token rejected: %s: %s", type(e).__name__, e)
		raise InvalidTokenError()
	except Exception as e:
		raise AuthenticationError(f"Authentication failed: {str(e)}")


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db_session)
) -> Optional[User]:
    """Get current user if authenticated, None otherwise."""
    
    if not credentials:
        return None
    
    try:
        return await _decode_token_and_get_user(credentials.credentials, db)
    except (AuthenticationError, TokenExpiredError, InvalidTokenError):
        return None


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db_session)
) -> User:
    """Get current authenticated user."""
    if not credentials:
        raise AuthenticationError("No token provided")
    
    return await _decode_token_and_get_user(credentials.credentials, db)


# Admin = authenticated user whose id is listed in ADMIN_USER_IDS (comma-separated).
# Empty by default: nobody can call admin endpoints (there is no role column).
import os as _os
ADMIN_USER_IDS = {int(x) for x in _os.getenv("ADMIN_USER_IDS", "").split(",") if x.strip().isdigit()}


def require_admin(user: User = Depends(get_current_user)) -> User:
	"""Require an authenticated admin (403 otherwise)."""
	if user.id not in ADMIN_USER_IDS:
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
	return user


def require_auth(user: User = Depends(get_current_user)) -> User:
    """Require authentication dependency."""
    return user


async def verify_auth0_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Verify Auth0 JWT using JWKS and return its payload without requiring a DB user.
    Useful for first-time auth0 sync where the user may not exist yet.
    """
    if not credentials:
        raise AuthenticationError("No token provided")

    token = credentials.credentials
    return _decode_with_jwks(token)


async def _decode_token_and_get_user(token: str, db: Session) -> User:
    """Decode JWT token via JWKS and get user from DB."""
    
    payload = _decode_with_jwks(token)
    # Get user from database
    auth0_id = payload.get("sub")
    if not auth0_id:
        raise InvalidTokenError("Invalid token payload")
    
    user = db.query(User).filter(User.auth0_id == auth0_id).first()
    if not user:
        raise AuthenticationError("User not found")
    
    if not user.is_active:
        raise AuthenticationError("User account is disabled")
    
    return user