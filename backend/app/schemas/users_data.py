from pydantic import BaseModel
from typing import Optional


# -- 使用者資料相關 (含登入驗證) --


class UserLogin(BaseModel):
    email: str
    password: str
    login_status: int


class UserVerifyAccount(BaseModel):
    username: str
    email: str
    password: str
    login_status: int


class UserSignUp(BaseModel):
    username: str
    email: str
    password: str
    verification_code: str
    login_status: int


class UserResetPassword(BaseModel):
    email: str
    new_password: str
    verification_code: str


class UserAccountSupports(BaseModel):
    email: str     # 忘記密碼的信箱
    password: Optional[str]  # 修改使用者名稱
    new_username: Optional[str]  # 新使用者名稱
    status: int


class UserDeleteAccount(BaseModel):
    username: str
    email: str
    password: str
# -- End. --
