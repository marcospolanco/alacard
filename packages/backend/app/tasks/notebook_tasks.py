import json
import uuid
from celery import current_task
from app.core.celery_app import celery_app
from app.core.database import db
from app.services.notebook_generator import NotebookGenerator
from app.services.huggingface import HuggingFaceService
import asyncio
from typing import Dict, Any

@celery_app.task(bind=True)
def generate_notebook_task(self, hf_model_id: str) -> Dict[str, Any]:
    """Background task to generate a notebook from a Hugging Face model"""

    task_id = self.request.id

    try:
        # Update task status
        self.update_state(
            state="PROGRESS",
            meta={
                "current_step": "Initializing notebook generation",
                "progress": 10
            }
        )

        # Initialize services
        generator = NotebookGenerator()
        hf_service = HuggingFaceService()

        # Step 1: Get model info
        self.update_state(
            state="PROGRESS",
            meta={
                "current_step": "Fetching model information",
                "progress": 20
            }
        )

        # Run async methods in sync context
        try:
            model_info = asyncio.run(hf_service.get_model_info(hf_model_id))
            if not model_info:
                raise ValueError(f"Model {hf_model_id} not found")

            # Step 2: Generate notebook content
            self.update_state(
                state="PROGRESS",
                meta={
                    "current_step": "Generating notebook cells",
                    "progress": 40
                }
            )

            notebook_data = asyncio.run(generator.generate_notebook(hf_model_id))
        except Exception as e:
            raise e

        # Step 3: Create share ID
        self.update_state(
            state="PROGRESS",
            meta={
                "current_step": "Creating share link",
                "progress": 60
            }
        )

        share_id = str(uuid.uuid4())[:8]  # Short share ID

        # Step 4: Save to database
        self.update_state(
            state="PROGRESS",
            meta={
                "current_step": "Saving to database",
                "progress": 80
            }
        )

        query = """
        INSERT INTO notebooks (share_id, hf_model_id, notebook_content, metadata)
        VALUES (%s, %s, %s, %s)
        RETURNING id, created_at
        """

        result = db.execute_single_query(
            query,
            (share_id, hf_model_id, json.dumps(notebook_data["notebook_content"]), json.dumps(notebook_data["metadata"]))
        )

        # Step 5: Complete
        self.update_state(
            state="SUCCESS",
            meta={
                "current_step": "Notebook generated successfully",
                "progress": 100,
                "share_id": share_id,
                "notebook_id": str(result["id"])
            }
        )

        return {
            "status": "completed",
            "share_id": share_id,
            "notebook_id": str(result["id"]),
            "task_id": task_id
        }

    except Exception as e:
        # Update task status to failed
        self.update_state(
            state="FAILURE",
            meta={
                "current_step": f"Error: {str(e)}",
                "progress": 0,
                "error": str(e)
            }
        )

        # Re-raise exception to mark task as failed
        raise e