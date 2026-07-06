import base64
import hashlib

from cryptography.fernet import Fernet
from ..settings import settings


def _get_cipher() -> Fernet:
    key = settings.ENCRYPTION_KEY
    if not key:
        digest = hashlib.sha256(settings.JWT_SECRET.encode()).digest()
        key = base64.urlsafe_b64encode(digest).decode()
        settings.ENCRYPTION_KEY = key
    return Fernet(key.encode() if isinstance(key, str) else key)


def encrypt_token(plaintext: str) -> str:
    cipher = _get_cipher()
    return cipher.encrypt(plaintext.encode()).decode()


def decrypt_token(ciphertext: str) -> str:
    cipher = _get_cipher()
    return cipher.decrypt(ciphertext.encode()).decode()
