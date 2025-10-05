#!/usr/bin/env python3
"""
Test script to verify Celery worker can start and connect to database
"""
import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, '/Users/marcospolanco/Developer/hack/alacard/packages/backend')

# Change to backend directory
os.chdir('/Users/marcospolanco/Developer/hack/alacard/packages/backend')

# Set up virtual environment path
if os.path.exists('venv/bin/activate'):
    # Manually add the venv to Python path
    venv_site_packages = '/Users/marcospolanco/Developer/hack/alacard/packages/backend/venv/lib/python3.13/site-packages'
    if os.path.exists(venv_site_packages):
        sys.path.insert(0, venv_site_packages)
    print("✅ Virtual environment configured")

try:
    print("Testing Celery configuration...")

    # Import Celery app
    from app.core.celery_app import celery_app, logger
    print("✅ Celery app imported successfully")

    # Test database connection
    from app.core.database import db
    result = db.execute_query("SELECT 1 as test, version() as version")
    print(f"✅ Database connection successful: {result}")

    # Test card_presets table
    presets_result = db.execute_query("SELECT COUNT(*) as count FROM public.card_presets")
    print(f"✅ Card presets table accessible: {presets_result}")

    # Test Redis connection
    from celery import current_app
    import redis
    from app.core.config import settings

    redis_client = redis.from_url(settings.REDIS_URL)
    redis_result = redis_client.ping()
    print(f"✅ Redis connection successful: {redis_result}")

    print("🎉 All tests passed! Celery should be able to start properly.")

except Exception as e:
    print(f"❌ Test failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)