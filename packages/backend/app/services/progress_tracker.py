import json
import time
from typing import Dict, Any, Optional
from app.core.config import settings

class ProgressTracker:
    def __init__(self):
        # Use in-memory storage instead of Redis
        self._storage: Dict[str, Dict[str, Any]] = {}
        self._expiry: Dict[str, float] = {}

    def _cleanup_expired(self):
        """Remove expired entries"""
        current_time = time.time()
        expired_keys = [key for key, expiry in self._expiry.items() if current_time > expiry]
        for key in expired_keys:
            self._storage.pop(key, None)
            self._expiry.pop(key, None)

    def update_progress(self, task_id: str, progress_data: Dict[str, Any]):
        """Update progress for a task"""
        key = f"progress:{task_id}"
        self._storage[key] = progress_data
        # Set expiry to 1 hour (3600 seconds)
        self._expiry[key] = time.time() + 3600
        # Clean up expired entries periodically
        self._cleanup_expired()

    def get_progress(self, task_id: str) -> Optional[Dict[str, Any]]:
        """Get progress for a task"""
        key = f"progress:{task_id}"
        
        # Check if expired
        if key in self._expiry and time.time() > self._expiry[key]:
            self._storage.pop(key, None)
            self._expiry.pop(key, None)
            return None
            
        return self._storage.get(key)

    def get_task_result(self, task_id: str) -> Optional[Dict[str, Any]]:
        """Get the final result of a task (direct invocation version)"""
        try:
            # Return current progress
            progress = self.get_progress(task_id)
            if progress:
                return progress
            return None
        except Exception as e:
            # If there's an error getting the result, return a failure status
            return {
                "status": "failed",
                "error": f"Unable to retrieve task result: {str(e)}"
            }

# Global progress tracker instance
progress_tracker = ProgressTracker()