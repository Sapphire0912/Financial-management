from pydantic import BaseModel

# -- 使用者資料相關 (含登入驗證) --


class UserLogin(BaseModel):
    email: str
    password: str

# -- End. --
