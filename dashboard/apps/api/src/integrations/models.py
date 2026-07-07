from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base


class IntegrationCredential(Base):
    __tablename__ = "integration_credentials"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    provider: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    encrypted_credentials: Mapped[str] = mapped_column(Text, nullable=False, default="{}")
    encrypted_config: Mapped[str] = mapped_column(Text, nullable=False, default="{}")
    connected: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[str] = mapped_column(String(32), default="disconnected")
    version: Mapped[str] = mapped_column(String(32), default="—")
    last_sync: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    last_error: Mapped[str | None] = mapped_column(String(512), nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
