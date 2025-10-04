import httpx
from app.models.notebook import ModelInfo
from typing import List, Optional
from app.core.config import settings

class HuggingFaceService:
    def __init__(self):
        self.base_url = "https://huggingface.co/api"
        self.headers = {}
        if settings.HF_API_TOKEN:
            self.headers["Authorization"] = f"Bearer {settings.HF_API_TOKEN}"

    async def get_popular_models(self) -> List[ModelInfo]:
        """Get list of popular Hugging Face models"""
        # Hardcoded popular models for now (same as frontend)
        models_data = [
            {
                "id": "meta-llama/Llama-3.1-8B-Instruct",
                "modelId": "meta-llama/Llama-3.1-8B-Instruct",
                "name": "Meta Llama 3.1 8B Instruct",
                "description": "Meta's advanced conversational AI model",
                "pipeline_tag": "text-generation",
                "downloads": 1200000,
                "likes": 25000,
                "tags": ["text-generation", "conversational", "instruct"]
            },
            {
                "id": "distilbert-base-uncased",
                "modelId": "distilbert-base-uncased",
                "name": "DistilBERT Base Uncased",
                "description": "Lightweight BERT model for classification tasks",
                "pipeline_tag": "text-classification",
                "downloads": 2100000,
                "likes": 15000,
                "tags": ["text-classification", "bert", "lightweight"]
            },
            {
                "id": "facebook/bart-large-cnn",
                "modelId": "facebook/bart-large-cnn",
                "name": "BART Large CNN",
                "description": "Text summarization model trained on CNN/Daily Mail",
                "pipeline_tag": "summarization",
                "downloads": 1400000,
                "likes": 12000,
                "tags": ["summarization", "bart", "news"]
            }
        ]

        return [ModelInfo(**model) for model in models_data]

    async def search_models(self, category: Optional[str] = None) -> List[ModelInfo]:
        """Search models by category"""
        popular_models = await self.get_popular_models()

        if category:
            # Filter by category (pipeline tag)
            return [model for model in popular_models if model.pipeline_tag == category]

        return popular_models

    async def get_model_info(self, model_id: str) -> Optional[ModelInfo]:
        """Get detailed information about a specific model"""
        # For now, return from our hardcoded list
        popular_models = await self.get_popular_models()
        for model in popular_models:
            if model.modelId == model_id:
                return model

        # If not found, try to fetch from API
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.base_url}/models/{model_id}", headers=self.headers)
                if response.status_code == 200:
                    data = response.json()
                    return ModelInfo(
                        id=data.get("id", model_id),
                        modelId=data.get("id", model_id),
                        name=data.get("modelId", model_id),
                        description=data.get("description"),
                        pipeline_tag=data.get("pipeline_tag"),
                        downloads=data.get("downloads", 0),
                        likes=data.get("likes", 0),
                        tags=data.get("tags", [])
                    )
        except Exception as e:
            print(f"Error fetching model info: {e}")

        return None

    async def get_model_readme(self, model_id: str) -> Optional[str]:
        """Get the README content for a model"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"https://huggingface.co/{model_id}/raw/main/README.md",
                    headers=self.headers
                )
                if response.status_code == 200:
                    return response.text
        except Exception as e:
            print(f"Error fetching model README: {e}")

        return None