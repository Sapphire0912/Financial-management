from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date


# -- Accounting Router 相關 --
class AccountingCreate(BaseModel):
    user_name: str
    user_id: str
    statistics_kind: Optional[str] = "其他"
    category: Optional[str] = "其他"
    cost_name: str
    unit: str = "TWD"
    cost: int
    store_name: Optional[str] = ""
    description: Optional[str] = ""
    created_at: Optional[datetime] = datetime.now()
    updated_at: Optional[datetime] = datetime.now()


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
    updated_at: Optional[datetime] = datetime.now()


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
