import json
import uuid
from celery import current_task
from app.core.celery_app import celery_app
from app.core.database import db
from app.services.notebook_generator import NotebookGenerator
from app.services.huggingface import HuggingFaceService
from app.services.notebook_validator import NotebookValidator
import asyncio
from typing import Dict, Any

@celery_app.task(bind=True)
async def generate_notebook_task(self, hf_model_id: str) -> Dict[str, Any]:
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
            model_info = await hf_service.get_model_info(hf_model_id)
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

            generator = NotebookGenerator()
            notebook_data = await generator.generate_notebook(hf_model_id)
        except Exception as e:
            raise e

        # Step 3: Validate notebook execution
        self.update_state(
            state="PROGRESS",
            meta={
                "current_step": "Validating notebook execution",
                "progress": 60
            }
        )

        validator = NotebookValidator()
        validation_result = await validator.validate_notebook(
            {"cells": notebook_data["cells"], "metadata": notebook_data["metadata"]},
            hf_model_id
        )

        if validation_result["overall_status"] != "success":
            # If validation fails, include validation details in the response
            self.update_state(
                state="FAILURE",
                meta={
                    "current_step": f"Notebook validation failed: {len(validation_result['syntax_errors'])} syntax errors, {len(validation_result['runtime_errors'])} runtime errors",
                    "progress": 0,
                    "validation_errors": validation_result,
                    "error": "Generated notebook failed validation"
                }
            )
            raise ValueError(f"Generated notebook failed validation: {validation_result}")

        # Step 5: Create share ID
        self.update_state(
            state="PROGRESS",
            meta={
                "current_step": "Creating share link",
                "progress": 75
            }
        )

        share_id = str(uuid.uuid4())[:8]  # Short share ID

        # Step 6: Save to database
        self.update_state(
            state="PROGRESS",
            meta={
                "current_step": "Saving to database",
                "progress": 90
            }
        )

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
        self.update_state(
            state="SUCCESS",
            meta={
                "current_step": f"Notebook generated and validated successfully ({validation_result['cells_validated']} cells validated)",
                "progress": 100,
                "share_id": share_id,
                "notebook_id": str(result["id"]),
                "validation_summary": {
                    "cells_validated": validation_result["cells_validated"],
                    "syntax_errors": len(validation_result["syntax_errors"]),
                    "runtime_errors": len(validation_result["runtime_errors"]),
                    "model_loaded": validation_result["model_loading_success"]
                }
            }
        )

        return {
            "status": "completed",
            "share_id": share_id,
            "notebook_id": str(result["id"]),
            "task_id": task_id,
            "validation": {
                "overall_status": validation_result["overall_status"],
                "cells_validated": len(validation_result["cells_validated"]),
                "syntax_errors": len(validation_result["syntax_errors"]),
                "runtime_errors": len(validation_result["runtime_errors"]),
                "model_loading_success": validation_result["model_loading_success"]
            }
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