from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID

class NotebookGenerationRequest(BaseModel):
    hf_model_id: str

class NotebookResponse(BaseModel):
    id: UUID
    created_at: datetime
    share_id: str
    hf_model_id: str
    notebook_content: Dict[str, Any]
    metadata: Optional[Dict[str, Any]] = None
    download_count: int = 0

class ModelInfo(BaseModel):
    id: str
    modelId: str
    name: str
    description: Optional[str] = None
    pipeline_tag: Optional[str] = None
    downloads: int
    likes: int
    tags: List[str]

class TaskStatus(BaseModel):
    task_id: str
    status: str  # pending, processing, completed, failed
    progress: int = 0
    current_step: Optional[str] = None
    message: Optional[str] = None
    share_id: Optional[str] = None
    error: Optional[str] = None
    validation_summary: Optional[Dict[str, Any]] = None

class NotebookGenerationResponse(BaseModel):
    task_id: str
    estimated_time: int = 30

class ProgressUpdate(BaseModel):
    type: str = "progress"
    data: TaskStatus