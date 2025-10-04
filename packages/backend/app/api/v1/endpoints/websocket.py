from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.progress_tracker import progress_tracker
from app.models.notebook import TaskStatus, ProgressUpdate
import json
import asyncio

router = APIRouter()

@router.websocket("/progress/{task_id}")
async def websocket_progress(websocket: WebSocket, task_id: str):
    """WebSocket endpoint for real-time progress updates"""
    await websocket.accept()

    try:
        # Send initial status
        result = progress_tracker.get_task_result(task_id)
        if result and result["status"] != "completed":
            initial_status = TaskStatus(
                task_id=task_id,
                status="processing",
                progress=result.get("progress", 0),
                current_step=result.get("current_step"),
                message=result.get("message")
            )
            await websocket.send_text(ProgressUpdate(data=initial_status.dict()).json())

        # Poll for updates
        while True:
            await asyncio.sleep(1)  # Check every second

            result = progress_tracker.get_task_result(task_id)
            if not result:
                break

            if result["status"] == "completed":
                status = TaskStatus(
                    task_id=task_id,
                    status="completed",
                    progress=100,
                    current_step="Notebook generated successfully",
                    share_id=result["share_id"]
                )
                await websocket.send_text(ProgressUpdate(data=status.dict()).json())
                break

            elif result["status"] == "failed":
                status = TaskStatus(
                    task_id=task_id,
                    status="failed",
                    progress=0,
                    error=result.get("error", "Unknown error")
                )
                await websocket.send_text(ProgressUpdate(data=status.dict()).json())
                break

            elif result["status"] == "processing":
                status = TaskStatus(
                    task_id=task_id,
                    status="processing",
                    progress=result.get("progress", 0),
                    current_step=result.get("current_step"),
                    message=result.get("message")
                )
                await websocket.send_text(ProgressUpdate(data=status.dict()).json())

    except WebSocketDisconnect:
        # Client disconnected
        pass
    except Exception as e:
        # Send error message
        try:
            error_status = TaskStatus(
                task_id=task_id,
                status="failed",
                progress=0,
                error=f"Connection error: {str(e)}"
            )
            await websocket.send_text(ProgressUpdate(data=error_status.dict()).json())
        except:
            pass  # Connection might already be closed