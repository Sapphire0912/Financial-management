from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date


# -- Accounting Router 相關 --
class AccountingCreate(BaseModel):
    statistics_kind: Optional[str] = "其他"
    category: Optional[str] = "其他"
    user_name: str
    user_id: Optional[str]  # 使用者 line id
    cost_name: str
    cost_status: int = 0
    unit: str = "TWD"
    cost: int
    pay_method: int
    store_name: Optional[str] = ""
    invoice_number: Optional[str] = ""
    description: Optional[str] = ""
    created_at: Optional[datetime] = datetime.utcnow()
    updated_at: Optional[datetime] = datetime.utcnow()

    # 用於處理時差與判斷時間是否合理
    # 註: (user_time_data + timezone) covert to utc time = created_at.
    user_time_data: str  # form time
    timezone: str
    current_utc_time: str


class AccountingUpdate(BaseModel):
    id: Optional[str] = None  # mongo document id
    user_name: Optional[str] = None
    user_id: Optional[str] = None
    statistics_kind: Optional[str] = None
    category: Optional[str] = None
    cost_name: Optional[str] = None
    unit: Optional[str] = None
    cost: Optional[int] = None
    store_name: Optional[str] = None
    description: Optional[str] = None
    updated_at: Optional[datetime] = datetime.utcnow()


class AccountingDelete(BaseModel):
    id: Optional[str] = None  # mongo document id
    user_name: str
    user_id: str
    statistics_kind: str
    category: str
    cost_name: str
    cost: Optional[int] = None
    store_name: Optional[str] = None
# -- End --
