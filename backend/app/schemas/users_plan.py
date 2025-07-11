from pydantic import BaseModel
from typing import Optional
from datetime import datetime, time

# -- 使用者理財規劃相關 Schema --


class TimeInfo(BaseModel):
    # 用於處理時差與判斷時間是否合理
    # 註: (user_time_data + timezone) covert to utc time = created_at.
    user_time_data: str  # form time
    timezone: str
    current_utc_time: str


class PlanContent(BaseModel):
    sort: int
    label: str
    isActive: bool
    isEmail: bool
    isLine: bool
    threshold: Optional[int]

    # 週期預算設定
    frequency: Optional[int]

    # 存錢計畫
    reach_time: Optional[str]
