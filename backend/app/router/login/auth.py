# Fastapi
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

# Databases
from sqlalchemy import or_, and_
from sqlalchemy.orm import Session
from app.databases.mysql_setting import connect_mysql
from app.models.sql_model import User

# JWT
from app.utils.jwt_verification import create_jwt_token
from passlib.context import CryptContext

# request information & celery task
from app.utils.request_info import get_client_ip
from app.tasks.tasks import log_user_login

# User api schema
from app.schemas.users_data import UserLogin, UserVerifyAccount, UserSignUp, UserAccountSupports, UserResetPassword, UserDeleteAccount

# Gmail SMTP services
from app.services.smtp_services import send_email, verify_digital_code

# other tools
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["Auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")  # 使用者密碼加密方式


@router.post("/login")
async def login(data: UserLogin, sqldb: Session = Depends(connect_mysql), ip: str = Depends(get_client_ip)):
    """
      使用者登入驗證

      login_status:
      > 1: Gmail 登入
      > 2: line 登入
    """
    _log_data = {
        "ip": ip,
        "email": data.email,
        "line_user_name": data.line_user_name,
        "line_user_id": data.line_user_id
    }
    now = datetime.now()

    if data.login_status == 1:
        user = sqldb.query(User).filter(User.email == data.email).first()
        if not user or not pwd_context.verify(data.password, user.password):
            return JSONResponse(status_code=401, content={
                "success": False, "message": "帳號或密碼錯誤"})

        # 更新最後登入時間 & 登入日誌
        _log_data["method"] = "gmail"
        log_user_login.delay(data=_log_data, status=True)

        user.last_login_at = now
        sqldb.commit()

        jwt_token = create_jwt_token(data={"sub": user.username})
        return JSONResponse(status_code=200, content={"success": True, "token": jwt_token, "token_type": "bearer"})

    elif data.login_status == 2:
        # TODO: Line 登入
        pass

    else:
        return JSONResponse(status_code=500, content={"success": False, "message": "登入參數錯誤"})


@router.post("/signup")
async def signup(data: UserSignUp, sqldb: Session = Depends(connect_mysql)):
    """
      含驗證碼的註冊 (Gmail)
    """
    if data.login_status == 1:
        if not verify_digital_code(to_email=data.email, code=data.verification_code):
            return JSONResponse(status_code=401, content={"success": False, "message": "Gmail 驗證碼錯誤"})

        else:
            try:
                new_user = User(
                    username=data.username,
                    email=data.email,
                    password=pwd_context.hash(data.password),
                    is_active=False,  # 尚未綁定 line 帳號
                    line_user_name=None,
                    line_user_id=None
                )
                sqldb.add(new_user)
                sqldb.commit()
                return JSONResponse(status_code=201, content={"success": True, "message": "註冊帳號成功"})

            except Exception as e:
                sqldb.rollback()  # 避免 session 卡住
                return JSONResponse(status_code=500, content={"success": False, "message": f"伺服器錯誤: {str(e)}"})

    elif data.login_status == 2:
        # TODO: Line 註冊
        pass

    else:
        return JSONResponse(status_code=500, content={"success": False, "message": "註冊參數錯誤"})


@router.post("/verification/account")
async def verification_account(data: UserVerifyAccount, sqldb: Session = Depends(connect_mysql)):
    """
      驗證使用者帳號以及發送驗證信
      註: 收不到驗證碼可以再打一次此 api

      login_status: 
      > 1: Gmail 註冊
      > 2: Line 註冊
    """

    def check_user_exists() -> bool:
        is_user = sqldb.query(User).filter(
            or_(User.username == data.username, User.email == data.email)
        ).first()

        return bool(is_user)

    if data.login_status == 1:
        if check_user_exists():
            return JSONResponse(status_code=409, content={"success": False, "message": "該信箱或使用者名稱已被使用過"})

        await send_email(to_email=data.email)
        return JSONResponse(status_code=200, content={"success": True, "message": "已向使用者發送信件"})

    elif data.login_status == 2:
        # TODO: Line login 邏輯
        return JSONResponse(status_code=501, content={"success": True, "message": "尚未實作 line 註冊功能"})

    else:
        return JSONResponse(status_code=500, content={"success": False, "message": "登入參數錯誤"})


@router.post("/supports")
async def supports(data: UserAccountSupports, sqldb: Session = Depends(connect_mysql)):
    """
      帳號支援功能

      status:
      > 1: 忘記密碼
      > 2: 更改 username
      > 3: 忘記密碼的信箱驗證碼
    """
    if data.status == 1:
        # TODO: 再打重設密碼的 api
        user = sqldb.query(User).filter(User.email == data.email).first()
        if not user:
            return JSONResponse(status_code=401, content={"success": False, "message": "使用者信箱錯誤"})
        await send_email(to_email=data.email)
        return JSONResponse(status_code=200, content={"success": True, "message": "已向使用者發送信件"})

    elif data.status == 2:
        user = sqldb.query(User).filter(User.email == data.email).first()
        if not user or not pwd_context.verify(data.password, user.password):
            return JSONResponse(status_code=401, content={"success": False, "message": "使用者信箱或密碼錯誤"})

        user.username = data.new_username
        sqldb.commit()

        return JSONResponse(status_code=200, content={"success": True, "message": "已更新使用者名稱"})

    elif data.status == 3:
        if not verify_digital_code(to_email=data.email, code=data.verification_code):
            return JSONResponse(status_code=401, content={"success": False, "message": "Gmail 驗證碼錯誤"})
        return JSONResponse(status_code=200, content={"success": True, "message": "驗證成功, 請重新修改密碼"})

    return JSONResponse(status_code=501, content={"success": False, "message": "帳號支援參數錯誤"})


@router.post("/reset/password")
async def reset_password(data: UserResetPassword, sqldb: Session = Depends(connect_mysql)):
    """
      修改使用者密碼
    """
    try:
        user = sqldb.query(User).filter(User.email == data.email).first()
        user.password = pwd_context.hash(data.new_password)
        sqldb.commit()

        return JSONResponse(status_code=201, content={"success": True, "message": "修改密碼成功"})
    except Exception as e:
        sqldb.rollback()
        return JSONResponse(status_code=500, content={"success": False, "message": f"伺服器錯誤: {str(e)}"})


@router.post("/delete/account")
async def delete_account(data: UserDeleteAccount, sqldb: Session = Depends(connect_mysql)):
    """
      刪除帳號
    """
    user = sqldb.query(User).filter(
        and_(User.username == data.username, User.email == data.email)).first()
    if not user:
        return JSONResponse(status_code=403, content={"success": False, "message": "查無此使用者"})

    if not pwd_context.verify(data.password, user.password):
        return JSONResponse(status_code=401, content={"success": False, "message": "密碼錯誤"})

    sqldb.delete(user)
    sqldb.commit()

    return JSONResponse(status_code=200, content={"success": True, "message": "使用者帳號刪除成功"})
