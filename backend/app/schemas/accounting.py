from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date


# -- Accounting Router 相關 --
# 使用者記帳支出相關
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
    id: str  # mongo document id
    statistics_kind: Optional[str] = "其他"
    category: Optional[str] = None
    user_name: str
    user_id: Optional[str]  # 使用者 line id
    cost_name: Optional[str] = None
    cost_status: int = 0
    cost: int
    unit: str = "TWD"
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


class AccountingDelete(BaseModel):
    id: str  # mongo document id
    user_name: str
    user_id: Optional[str] = None  # 使用者 line id
    current_utc_time: str


# -- 使用者記帳收入相關 --
class IncomeCreate(BaseModel):
    income_kind: str
    category: Optional[str]
    user_name: str
    user_id: Optional[str]  # 使用者 line id
    amount: int
    unit: str
    payer: str
    pay_account: str
    description: Optional[str]
    created_at: Optional[datetime] = datetime.utcnow()
    updated_at: Optional[datetime] = datetime.utcnow()

    # 用於處理時差與判斷時間是否合理
    # 註: (user_time_data + timezone) covert to utc time = created_at.
    user_time_data: str  # form time
    timezone: str
    current_utc_time: str


class IncomeUpdate(BaseModel):
    id: str
    income_kind: str
    category: Optional[str]
    user_name: str
    user_id: Optional[str]  # 使用者 line id
    amount: int
    unit: str
    payer: str
    pay_account: str
    description: Optional[str]
    created_at: Optional[datetime] = datetime.utcnow()
    updated_at: Optional[datetime] = datetime.utcnow()

    # 用於處理時差與判斷時間是否合理
    # 註: (user_time_data + timezone) covert to utc time = created_at.
    user_time_data: str  # form time
    timezone: str
    current_utc_time: str


class IncomeDelete(BaseModel):
    id: str  # mongo document id
    user_name: str
    user_id: Optional[str] = None  # 使用者 line id
    current_utc_time: str
# -- End --


# -- 使用者篩選查詢相關 --
class FilterRow(BaseModel):
    field: str
    operator: str
    value: str
    matchMode: Optional[str] = None
    sortOrder: Optional[str] = None


class FilterRequest(BaseModel):
    oper: str
    page: int
    per_page: int
    filters: List[FilterRow]
