from pydantic import BaseModel
from typing import Optional
from datetime import time

# -- 使用者設定相關 Schema --


class NotifyContent(BaseModel):
    sort: int
    label: str
    isActive: bool
    frequency: Optional[int]
    time: Optional[time]
    threshold: Optional[int]
    isEmail: bool
    isLine: bool
