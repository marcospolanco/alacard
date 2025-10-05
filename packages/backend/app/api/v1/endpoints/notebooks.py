from fastapi import APIRouter, HTTPException, BackgroundTasks
# from app.tasks.notebook_tasks import generate_notebook_task  # DISABLED: Using direct invocation
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
import uuid
import asyncio

router = APIRouter()

@router.post("/generate", response_model=NotebookGenerationResponse)
async def generate_notebook(request: NotebookGenerationRequest, background_tasks: BackgroundTasks):
    """Start notebook generation task (direct invocation version)"""
    # Generate task ID
    task_id = str(uuid.uuid4())

    # Start notebook generation in background task (direct invocation)
    background_tasks.add_task(generate_notebook_direct, task_id, request.hf_model_id)

    return NotebookGenerationResponse(
        task_id=task_id,
        estimated_time=60  # Longer timeout for direct invocation
    )

async def generate_notebook_direct(task_id: str, hf_model_id: str):
    """Direct invocation version of notebook generation (replaces Celery task)"""
    try:
        # Import here to avoid circular imports
        from app.services.notebook_generator import NotebookGenerator
        from app.services.huggingface import HuggingFaceService
        from app.services.notebook_validator import NotebookValidator

        # Update initial progress
        progress_tracker.update_progress(task_id, {
            "status": "processing",
            "current_step": "Initializing notebook generation",
            "progress": 10
        })

        # Initialize services
        hf_service = HuggingFaceService()

        # Step 1: Get model info
        progress_tracker.update_progress(task_id, {
            "status": "processing",
            "current_step": "Fetching model information",
            "progress": 20
        })

        model_info = await hf_service.get_model_info(hf_model_id)
        if not model_info:
            raise ValueError(f"Model {hf_model_id} not found")

        # Step 2: Generate notebook content
        progress_tracker.update_progress(task_id, {
            "status": "processing",
            "current_step": "Generating notebook cells",
            "progress": 40
        })

        generator = NotebookGenerator()
        notebook_data = await generator.generate_notebook(hf_model_id)

        # Step 3: Validate notebook execution
        progress_tracker.update_progress(task_id, {
            "status": "processing",
            "current_step": "Validating notebook execution",
            "progress": 60
        })

        validator = NotebookValidator()
        validation_result = await validator.validate_notebook(
            {"cells": notebook_data["cells"], "metadata": notebook_data["metadata"]},
            hf_model_id
        )

        if validation_result["overall_status"] != "success":
            # If validation fails, include validation details in the response
            progress_tracker.update_progress(task_id, {
                "status": "failed",
                "current_step": f"Notebook validation failed: {len(validation_result['syntax_errors'])} syntax errors, {len(validation_result['runtime_errors'])} runtime errors",
                "progress": 0,
                "validation_errors": validation_result,
                "error": "Generated notebook failed validation"
            })
            return

        # Step 5: Create share ID
        progress_tracker.update_progress(task_id, {
            "status": "processing",
            "current_step": "Creating share link",
            "progress": 75
        })

        share_id = str(uuid.uuid4())[:8]  # Short share ID

        # Step 6: Save to database
        progress_tracker.update_progress(task_id, {
            "status": "processing",
            "current_step": "Saving to database",
            "progress": 90
        })

        # Prepare metadata including validation results
        enhanced_metadata = notebook_data["metadata"].copy()
        enhanced_metadata["validation"] = {
            "overall_status": validation_result["overall_status"],
            "cells_validated": len(validation_result["cells_validated"]),
            "syntax_errors": len(validation_result["syntax_errors"]),
            "runtime_errors": len(validation_result["runtime_errors"]),
            "model_loading_success": validation_result["model_loading_success"],
            "validation_timestamp": validation_result["validation_timestamp"]
        }

        query = """
        INSERT INTO notebooks (share_id, hf_model_id, notebook_content, metadata)
        VALUES (%s, %s, %s, %s)
        RETURNING id, created_at
        """

        result = db.execute_single_query(
            query,
            (share_id, hf_model_id, json.dumps(notebook_data["cells"]), json.dumps(enhanced_metadata))
        )

        # Step 7: Complete
        progress_tracker.update_progress(task_id, {
            "status": "completed",
            "current_step": f"Notebook generated and validated successfully ({validation_result['cells_validated']} cells validated)",
            "progress": 100,
            "share_id": share_id,
            "notebook_id": str(result["id"]),
            "validation": {
                "overall_status": validation_result["overall_status"],
                "cells_validated": len(validation_result["cells_validated"]),
                "syntax_errors": len(validation_result["syntax_errors"]),
                "runtime_errors": len(validation_result["runtime_errors"]),
                "model_loading_success": validation_result["model_loading_success"]
            }
        })

    except Exception as e:
        # Update task status to failed
        import traceback
        progress_tracker.update_progress(task_id, {
            "status": "failed",
            "current_step": f"Error: {str(e)}",
            "progress": 0,
            "error": str(e),
            "traceback": traceback.format_exc()
        })

@router.get("/task/{task_id}", response_model=TaskStatus)
async def get_task_status(task_id: str):
    """Get status of notebook generation task"""
    result = progress_tracker.get_task_result(task_id)

    if not result:
        raise HTTPException(status_code=404, detail="Task not found")

    if result["status"] == "completed":
        # Include validation information if available
        validation_summary = result.get("validation", {})
        current_step = result.get("current_step", "Notebook generated successfully")

        return TaskStatus(
            task_id=task_id,
            status="completed",
            progress=100,
            current_step=current_step,
            share_id=result["share_id"],
            validation_summary=validation_summary if validation_summary else None
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

@router.get("/{share_id}/validation")
async def get_notebook_validation(share_id: str):
    """Get notebook validation results by share ID"""
    query = """
    SELECT metadata, notebook_content
    FROM notebooks
    WHERE share_id = %s
    """

    result = db.execute_single_query(query, (share_id,))

    if not result:
        raise HTTPException(status_code=404, detail="Notebook not found")

    metadata = result["metadata"]
    notebook_content = result["notebook_content"]

    # Extract validation information from metadata
    validation_info = metadata.get("validation", {}) if metadata else {}

    # If no validation data exists, return empty validation
    if not validation_info:
        return {
            "share_id": share_id,
            "validation_performed": False,
            "message": "No validation data available - notebook was generated before validation was implemented"
        }

    return {
        "share_id": share_id,
        "validation_performed": True,
        "overall_status": validation_info.get("overall_status"),
        "cells_validated": validation_info.get("cells_validated", 0),
        "syntax_errors": validation_info.get("syntax_errors", 0),
        "runtime_errors": validation_info.get("runtime_errors", 0),
        "model_loading_success": validation_info.get("model_loading_success", False),
        "validation_timestamp": validation_info.get("validation_timestamp"),
        "validation_details": validation_info
    }