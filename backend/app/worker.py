import os
import time
from celery import Celery
from app.core.config import settings

# Initialize Celery app
celery_app = Celery(
    "placementforge_worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

# Configuration overrides
celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
)

@celery_app.task(name="app.worker.test_task")
def test_task(x: int, y: int) -> int:
    time.sleep(1)
    return x + y

@celery_app.task(name="app.worker.send_push_notification_task")
def send_push_notification_task(user_id: str, title: str, message: str) -> bool:
    # Simulate sending push notification via Firebase Cloud Messaging
    print(f"[FCM Notification] Sending to User: {user_id} - Title: {title} | Message: {message}")
    # In actual deployment, requests.post("https://fcm.googleapis.com/fcm/send", ...) would go here
    return True
