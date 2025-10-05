from celery import Celery
from app.core.config import settings
import logging
import traceback
import sys

# Set up comprehensive logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('/tmp/celery_worker.log')
    ]
)

logger = logging.getLogger(__name__)

# Create Celery instance
try:
    logger.info(f"Initializing Celery with Redis URL: {settings.REDIS_URL}")
    celery_app = Celery(
        "alacard_backend",
        broker=settings.REDIS_URL,
        backend=settings.REDIS_URL,
        include=["app.tasks.notebook_tasks"]
    )
    logger.info("Celery instance created successfully")
except Exception as e:
    logger.error(f"Failed to create Celery instance: {e}")
    logger.error(f"Traceback: {traceback.format_exc()}")
    raise

# Configure Celery
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,  # 5 minutes
    task_soft_time_limit=240,  # 4 minutes
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
    worker_log_format='[%(asctime)s: %(levelname)s/%(processName)s] %(message)s',
    worker_task_log_format='[%(asctime)s: %(levelname)s/%(processName)s][%(task_name)s(%(task_id)s)] %(message)s',
    worker_log_color=False,
)

# Add database connection test
@celery_app.task(bind=True)
def test_db_connection(self):
    """Test database connection on startup"""
    try:
        from app.core.database import db
        # Test basic connection
        result = db.execute_query("SELECT 1 as test, version() as version")
        logger.info(f"Database connection test successful: {result}")

        # Test if card_presets table exists and has data
        presets_result = db.execute_query("SELECT COUNT(*) as count FROM public.card_presets")
        logger.info(f"Card presets table test successful: {presets_result}")

        return {
            "status": "success",
            "db_test": result,
            "presets_test": presets_result
        }
    except Exception as e:
        logger.error(f"Database connection test failed: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return {"status": "error", "error": str(e)}

# Worker ready signal
@celery_app.task
def worker_ready():
    """Called when worker is ready to accept tasks"""
    logger.info("Celery worker is ready to accept tasks")
    return {"status": "ready"}

# Connect worker signals
from celery.signals import worker_ready, worker_init, worker_shutdown

@worker_ready.connect
def worker_ready_handler(sender=None, **kwargs):
    """Called when worker is ready"""
    logger.info(f"Worker {sender} is ready and accepting tasks")
    # Test database connection when worker is ready
    try:
        from app.core.database import db
        result = db.execute_query("SELECT 1 as test")
        logger.info(f"Database connection confirmed on worker startup: {result}")
    except Exception as e:
        logger.error(f"Database connection failed on worker startup: {e}")

@worker_init.connect
def worker_init_handler(sender=None, **kwargs):
    """Called when worker is initializing"""
    logger.info(f"Worker {sender} is initializing...")

@worker_shutdown.connect
def worker_shutdown_handler(sender=None, **kwargs):
    """Called when worker is shutting down"""
    logger.info(f"Worker {sender} is shutting down")