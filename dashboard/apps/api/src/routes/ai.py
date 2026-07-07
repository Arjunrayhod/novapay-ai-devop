from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.get("/models")
async def list_models():
    raise HTTPException(status_code=501, detail="Not implemented")


@router.post("/chat")
async def chat_completion():
    raise HTTPException(status_code=501, detail="Not implemented")


@router.get("/insights")
async def get_insights():
    raise HTTPException(status_code=501, detail="Not implemented")
