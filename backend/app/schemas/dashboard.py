from pydantic import BaseModel
from typing import Optional


# -- 儀錶板相關驗證 --
class TimeInfo(BaseModel):
    # 用於處理時差與判斷時間是否合理
    # 註: (user_time_data + timezone) covert to utc time = created_at.
    user_time_data: str  # form time
    timezone: str
    current_utc_time: str


class DashboardMenuInfo(TimeInfo):
    menu: str
