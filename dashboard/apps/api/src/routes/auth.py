from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models.user import User
from ..utils.auth import (
    create_jwt,
    get_current_user,
    hash_password,
    verify_password,
)

router = APIRouter()


class RegisterBody(BaseModel):
    username: str
    email: str
    password: str
    display_name: str | None = None


class LoginBody(BaseModel):
    username: str
    password: str


class AuthResponse(BaseModel):
    token: str
    user: dict


@router.post("/register")
async def register(body: RegisterBody, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(
        select(User).where((User.username == body.username) | (User.email == body.email))
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Username or email already taken")

    user = User(
        username=body.username,
        email=body.email,
        password_hash=hash_password(body.password),
        display_name=body.display_name or body.username,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_jwt(user.id)
    return AuthResponse(
        token=token,
        user={
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "display_name": user.display_name,
        },
    )


@router.post("/login")
async def login(body: LoginBody, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == body.username))
    user = result.scalar_one_or_none()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_jwt(user.id)
    return AuthResponse(
        token=token,
        user={
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "display_name": user.display_name,
        },
    )


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "display_name": current_user.display_name,
    }
