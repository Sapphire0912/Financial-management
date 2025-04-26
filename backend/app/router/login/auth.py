# Fastapi
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

# Databases
from sqlalchemy.orm import Session
from app.databases.mysql_setting import connect_mysql
from app.models.sql_model import User

# JWT
from app.utils.jwt_verification import create_jwt_token
from passlib.context import CryptContext

# User api schema
from app.schemas.users_data import UserLogin


router = APIRouter(prefix="/auth", tags=["Auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")  # 使用者密碼加密方式


# 前端需要傳登入方式的資料
# email: 1
# line: 2
# google: 3  (未來新增)

@router.post("/login")
async def login(data: UserLogin, sqldb: Session = Depends(connect_mysql)):
    """
      使用者登入驗證
    """
    user = sqldb.query(User).filter(User.email == data.email).first()

    if not user or not pwd_context.verify(data.password, user.password):
        raise JSONResponse(status_code=401, content={
                           "success": False, "message": "帳號或密碼錯誤"})

    jwt_token = create_jwt_token(data={"sub": user.username})
    return JSONResponse(status_code=200, content={"success": True, "token": jwt_token, "token_type": "bearer"})


@router.post("/register")
def register():
    return {"message": "Register Router test"}


@router.post("/forget/password")
def forget_password():
    return {"message": "forget password Router test."}
