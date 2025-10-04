from fastapi import APIRouter
from app.api.v1.endpoints import models, notebooks, websocket

api_router = APIRouter()

api_router.include_router(models.router, prefix="/models", tags=["models"])
api_router.include_router(notebooks.router, prefix="/notebooks", tags=["notebooks"])
api_router.include_router(websocket.router, prefix="/ws", tags=["websocket"])