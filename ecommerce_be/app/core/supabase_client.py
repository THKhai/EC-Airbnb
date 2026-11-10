"""Supabase Storage client (property image uploads). Optional.

When SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set (demo deployment), the client
is None and image uploads are disabled instead of crashing the whole app at import time.
"""
import os
from typing import Optional

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()

_url = os.getenv("SUPABASE_URL", "")
_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

supabase_client: Optional[Client] = create_client(_url, _key) if _url and _key else None


def require_supabase() -> Client:
    if supabase_client is None:
        from app.shared.exceptions import BusinessLogicError
        raise BusinessLogicError("Image upload is disabled in this demo", code="UPLOAD_DISABLED", status_code=503)
    return supabase_client
