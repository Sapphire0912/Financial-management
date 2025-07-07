from pydantic import BaseModel
from typing import Optional
from datetime import time

# -- 使用者設定相關 Schema --


class TimeInfo(BaseModel):
    # 用於處理時差與判斷時間是否合理
    # 註: (user_time_data + timezone) covert to utc time = created_at.
    user_time_data: str  # form time
    timezone: str
    current_utc_time: str


class NotifyContent(BaseModel):
    sort: int
    label: str
    isActive: bool
    frequency: Optional[int]
    time: Optional[time]
    threshold: Optional[int]
    isEmail: bool
    isLine: bool
