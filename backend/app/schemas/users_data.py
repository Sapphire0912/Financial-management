from pydantic import BaseModel

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
# -- End. --
