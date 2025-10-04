import json
from typing import Dict, Any, Optional
from redis import Redis
from app.core.config import settings

class ProgressTracker:
    def __init__(self):
        self.redis_client = Redis.from_url(settings.REDIS_URL, decode_responses=True)

    def update_progress(self, task_id: str, progress_data: Dict[str, Any]):
        """Update progress for a task"""
        key = f"progress:{task_id}"
        self.redis_client.setex(key, 3600, json.dumps(progress_data))  # Expire after 1 hour

    def get_progress(self, task_id: str) -> Optional[Dict[str, Any]]:
        """Get progress for a task"""
        key = f"progress:{task_id}"
        data = self.redis_client.get(key)
        if data:
            return json.loads(data)
        return None

    def get_task_result(self, task_id: str) -> Optional[Dict[str, Any]]:
        """Get the final result of a task"""
        from celery.result import AsyncResult
        from app.core.celery_app import celery_app

        try:
            result = AsyncResult(task_id, app=celery_app)

            if result.ready():
                if result.successful():
                    return result.get()
                else:
                    return {
                        "status": "failed",
                        "error": str(result.info) if result.info else "Unknown error"
                    }
            else:
                # Return current progress
                progress = self.get_progress(task_id)
                if progress:
                    return {
                        "status": "processing",
                        **progress
                    }
                return None
        except Exception as e:
            # If there's an error getting the result (like corrupted data), return a failure status
            return {
                "status": "failed",
                "error": f"Unable to retrieve task result: {str(e)}"
            }

# Global progress tracker instance
progress_tracker = ProgressTracker()