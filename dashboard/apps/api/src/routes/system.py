from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def system_health():
    return {"status": "ok"}


@router.get("/info")
async def system_info():
    return {
        "name": "AegisAI API",
        "version": "0.1.0",
    }
