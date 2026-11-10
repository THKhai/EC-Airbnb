"""Demo login (AUTH_MODE=demo): password-less sign-in for a fixed whitelist of demo users."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session

from ...core import demo_mode
from ...shared.dependencies.database import get_db_session
from ...shared.models import User

router = APIRouter(prefix="/auth", tags=["auth"])


class DemoLoginRequest(BaseModel):
	user_id: int


def _require_demo():
	if not demo_mode.is_demo_auth():
		raise HTTPException(status_code=404, detail="Not found")
	if not demo_mode.secret_configured():
		raise HTTPException(status_code=503, detail="Demo login is not configured")


def _account(user: User) -> dict:
	return {
		"id": user.id,
		"name": user.full_name,
		"email": user.email,
		"picture": user.profile_image_url,
		"role": "host" if user.host_about or user.is_super_host else "guest",
	}


@router.get("/demo-accounts")
def demo_accounts(db: Session = Depends(get_db_session)):
	_require_demo()
	users = db.query(User).filter(User.id.in_(demo_mode.DEMO_USER_IDS), User.is_active == True).all()  # noqa: E712
	return [_account(u) for u in users]


@router.post("/demo-login")
def demo_login(body: DemoLoginRequest, db: Session = Depends(get_db_session)):
	_require_demo()
	if body.user_id not in demo_mode.DEMO_USER_IDS:
		raise HTTPException(status_code=403, detail="Not a demo account")
	user = db.query(User).filter(User.id == body.user_id).first()
	if not user or not user.is_active:
		raise HTTPException(status_code=404, detail="Demo account not found")
	# Tokens are matched to users via auth0_id (same as Auth0 subjects).
	subject = demo_mode.demo_subject(user.id)
	if user.auth0_id != subject:
		user.auth0_id = subject
		db.add(user)
		db.commit()
		db.refresh(user)
	token, ttl = demo_mode.issue_token(user.id, user.email)
	return {"access_token": token, "token_type": "bearer", "expires_in": ttl, "user": _account(user)}
