from datetime import datetime, timedelta, timezone
from jose import jwt
from app.core.config import settings

ALGORITHM = "HS256"

def create_access_token(data: dict, expires_minutes: int = 30):
    to_encode = data.copy()
    to_encode["exp"] = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=ALGORITHM)

def decode_access_token(token: str):
    return jwt.decode(token, settings.JWT_SECRET, algorithms=[ALGORITHM])