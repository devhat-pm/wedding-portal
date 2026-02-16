from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID
import hashlib
import secrets
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from app.database import get_db
from app.models import Wedding

security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash. Supports both bcrypt and legacy SHA256."""
    # Support bcrypt hashes (start with $2b$)
    if hashed_password.startswith('$2b$') or hashed_password.startswith('$2a$'):
        return pwd_context.verify(plain_password, hashed_password)
    # Fallback: support legacy SHA256 hashes for existing users
    try:
        salt, hash_value = hashed_password.split('$')
        hash_obj = hashlib.sha256((salt + plain_password).encode())
        return hash_obj.hexdigest() == hash_value
    except Exception:
        return False


def create_access_token(wedding_id: UUID, expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode = {
        "sub": str(wedding_id),
        "exp": expire,
        "iat": datetime.utcnow()
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[UUID]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        wedding_id: str = payload.get("sub")
        if wedding_id is None:
            return None
        return UUID(wedding_id)
    except JWTError:
        return None


async def get_current_wedding(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> Wedding:
    token = credentials.credentials
    wedding_id = decode_access_token(token)

    if wedding_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )

    result = await db.execute(
        select(Wedding).where(Wedding.id == wedding_id)
    )
    wedding = result.scalar_one_or_none()

    if wedding is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Wedding not found",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if not wedding.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Wedding account is deactivated"
        )

    return wedding
