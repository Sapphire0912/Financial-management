from celery import Celery
import os
from dotenv import load_dotenv

load_dotenv()
CELERY_BROKER_URL = os.environ.get("CELERY_BROKER_URL")

celery = Celery(
    "worker",
    broker=CELERY_BROKER_URL,
    backend=CELERY_BROKER_URL
)

celery.autodiscover_tasks(['app.tasks'])  # 要讓 celery 自動找到任務位置 (註冊任務)

__all__ = ['celery']
