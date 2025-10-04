from fastapi import APIRouter, Query
from typing import List, Optional
from app.services.huggingface import HuggingFaceService
from app.models.notebook import ModelInfo

router = APIRouter()
hf_service = HuggingFaceService()

@router.get("/popular", response_model=List[ModelInfo])
async def get_popular_models():
    """Get list of popular Hugging Face models"""
    return await hf_service.get_popular_models()

@router.get("/search", response_model=List[ModelInfo])
async def search_models(
    category: Optional[str] = Query(None, description="Filter by model category/pipeline tag")
):
    """Search models by category"""
    return await hf_service.search_models(category)