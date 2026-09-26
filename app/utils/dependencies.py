from fastapi import Depends, Header
from sqlalchemy.orm import Session
from jose import JWTError

from app.db.database import get_db
from app.db.models import User
from app.utils.jwt_utils import decode_access_token
from app.core.exceptions import UnauthorizedException


def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise UnauthorizedException()

    token = authorization.split(" ")[1]

    try:
        payload = decode_access_token(token)
    except JWTError:
        raise UnauthorizedException()

    user_id = payload.get("user_id")
    if not user_id:
        raise UnauthorizedException()

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise UnauthorizedException()

    return user