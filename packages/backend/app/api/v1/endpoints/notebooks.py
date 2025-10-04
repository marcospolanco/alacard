from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.tasks.notebook_tasks import generate_notebook_task
from app.services.progress_tracker import progress_tracker
from app.core.database import db
from app.models.notebook import (
    NotebookGenerationRequest,
    NotebookGenerationResponse,
    TaskStatus,
    NotebookResponse
)
from typing import Dict, Any
import json

router = APIRouter()

@router.post("/generate", response_model=NotebookGenerationResponse)
async def generate_notebook(request: NotebookGenerationRequest):
    """Start notebook generation task"""
    # Start background task
    task = generate_notebook_task.delay(request.hf_model_id)

    return NotebookGenerationResponse(
        task_id=task.id,
        estimated_time=30
    )

@router.get("/task/{task_id}", response_model=TaskStatus)
async def get_task_status(task_id: str):
    """Get status of notebook generation task"""
    result = progress_tracker.get_task_result(task_id)

    if not result:
        raise HTTPException(status_code=404, detail="Task not found")

    if result["status"] == "completed":
        return TaskStatus(
            task_id=task_id,
            status="completed",
            progress=100,
            current_step="Notebook generated successfully",
            share_id=result["share_id"]
        )
    elif result["status"] == "failed":
        return TaskStatus(
            task_id=task_id,
            status="failed",
            progress=0,
            error=result.get("error", "Unknown error")
        )
    elif result["status"] == "processing":
        return TaskStatus(
            task_id=task_id,
            status="processing",
            progress=result.get("progress", 0),
            current_step=result.get("current_step"),
            message=result.get("message")
        )
    else:
        raise HTTPException(status_code=404, detail="Task not found")

@router.get("/{share_id}", response_model=NotebookResponse)
async def get_notebook(share_id: str):
    """Get notebook metadata by share ID"""
    query = """
    SELECT id, created_at, share_id, hf_model_id, notebook_content, metadata, download_count
    FROM notebooks
    WHERE share_id = %s
    """

    result = db.execute_single_query(query, (share_id,))

    if not result:
        raise HTTPException(status_code=404, detail="Notebook not found")

    return NotebookResponse(
        id=result["id"],
        created_at=result["created_at"],
        share_id=result["share_id"],
        hf_model_id=result["hf_model_id"],
        notebook_content=result["notebook_content"],
        metadata=result["metadata"],
        download_count=result["download_count"]
    )

@router.get("/{share_id}/download")
async def download_notebook(share_id: str):
    """Download notebook as .ipynb file"""
    query = """
    SELECT notebook_content, hf_model_id, download_count
    FROM notebooks
    WHERE share_id = %s
    """

    result = db.execute_single_query(query, (share_id,))

    if not result:
        raise HTTPException(status_code=404, detail="Notebook not found")

    # Increment download count
    update_query = "UPDATE notebooks SET download_count = download_count + 1 WHERE share_id = %s"
    db.execute_query(update_query, (share_id,))

    # Return file content
    from fastapi.responses import Response
    import json

    notebook_content = result["notebook_content"]
    hf_model_id = result["hf_model_id"]

    # Convert notebook_content to JSON string if it's a dict
    if isinstance(notebook_content, dict):
        notebook_json = json.dumps(notebook_content, indent=2)
    else:
        notebook_json = notebook_content

    filename = f"{hf_model_id.replace('/', '_')}_notebook.ipynb"

    return Response(
        content=notebook_json,
        media_type="application/x-ipynb+json",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )