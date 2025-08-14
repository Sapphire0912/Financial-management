# Fastapi
from fastapi import APIRouter, Depends, Request, Response
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.exceptions import HTTPException

# Databases
from sqlalchemy import or_, and_
from sqlalchemy.orm import Session
from app.databases.mysql_setting import connect_mysql
from app.models.sql_model import User

# JWT
from app.utils.jwt_verification import create_jwt_token, create_refresh_token, verify_refresh_token
from passlib.context import CryptContext

# request/response information & celery task
from app.utils.attach_info import get_client_ip, set_cookies, clear_cookies
from app.tasks.tasks import log_user_login

# User api schema
from app.schemas.users_data import UserLogin, UserVerifyAccount, UserSignUp, UserAccountSupports, UserResetPassword, UserDeleteAccount

# Line Login
from app.router.login.line_oauth import get_line_login_url, get_line_access_token_params, verify_line_id_token

# Gmail SMTP services
from app.services.smtp_services import send_email, verify_digital_code

# other tools
import os
import requests
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["Auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")  # 使用者密碼加密方式


@router.post("/login")
async def login(request: Request, response: Response, data: UserLogin, sqldb: Session = Depends(connect_mysql), ip: str = Depends(get_client_ip)):
    """
      使用者登入驗證

      login_status:
      > 1: Gmail 登入
      > 2: line 登入
    """
    _log_data = {
        "ip": ip,
        "email": data.email,
    }
    now = datetime.utcnow()

    if data.login_status == 1:
        _log_data["method"] = "gmail"
        user = sqldb.query(User).filter(User.email == data.email).first()

        if not user or not pwd_context.verify(data.password, user.password):
            log_user_login.delay(data=_log_data, status=False)   # 紀錄登入失敗內容
            return JSONResponse(status_code=401, content={
                "success": False, "message": "帳號或密碼錯誤"})

        # 更新最後登入時間 & 登入日誌
        log_user_login.delay(data=_log_data, status=True)
        user.last_login_at = now
        sqldb.commit()

        # - 新增 refresh token 來更新 access token -
        jwt_token = create_jwt_token(data={
            "username": user.username,
            "email": user.email,
            "line_user_name": user.line_user_name,
            "line_user_id": user.line_user_id,
            "is_active": user.is_active
        })

        jwt_refresh_token = create_refresh_token(data={
            "username": user.username,
            "email": user.email,
            "line_user_name": user.line_user_name,
            "line_user_id": user.line_user_id,
            "is_active": user.is_active
        })

        response = JSONResponse(
            status_code=200,
            content={"success": True, "token": jwt_token, "token_type": "bearer"})
        set_cookies(response, token=jwt_refresh_token, expired_days=3)
        # - End. -

        return response

    elif data.login_status == 2:
        return JSONResponse(status_code=200, content={"success": True, "url": get_line_login_url()})

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
        if not (data.email and data.username and data.password):
            return JSONResponse(status_code=403, content={"success": False, "message": "使用者名稱、信箱或密碼不可為空"})

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


@router.post("/verification/token")
@verify_refresh_token
async def refresh_token(request: Request):
    """
      更新 access token (需攜帶舊的過期 token)
      註: refresh token 作為標示, 但需要驗證過期的 access token 以及 refresh token
    """
    new_access_token = request.state.new_token
    if new_access_token:
        return JSONResponse(status_code=200, content={"success": True, "token": new_access_token})
    else:
        return JSONResponse(status_code=401, content={"success": False, "message": "Token 已過期，請重新登入"})


@router.post("/line/login/callback")
async def line_login_callback(request: Request, parms: dict, sqldb: Session = Depends(connect_mysql)):
    """
      Line Login 的 callback
    """
    code = parms.get("code")
    state = parms.get("state")
    error = parms.get("error")

    if error:
        return JSONResponse(status_code=400, content={"success": False, "message": f"LINE 授權失敗: {error}"})
    if not code or not state:
        return JSONResponse(status_code=400, content={"success": False, "message": "缺少必要參數 code 或 state"})

    # 取得 Line Access Token 參數與連結
    access_url, params, nonce = get_line_access_token_params(code, state)
    if not params:
        return JSONResponse(status_code=400, content={"success": False, "message": "授權登入狀態已過期"})

    # 取得使用者 Access Token
    response = requests.post(access_url, data=params)
    if response.status_code != 200:
        return JSONResponse(status_code=400, content={"success": False, "message": "取得使用者 Access Token 失敗"})

    # 驗證 Line ID Token
    token_data = response.json()
    id_token = token_data.get("id_token", None)
    if not id_token or not verify_line_id_token(id_token, nonce):
        return JSONResponse(status_code=400, content={"success": False, "message": "Line ID Token 驗證失敗"})

    # 取得使用者資料
    # sub: line_user_id
    # name: line_user_name
    # picture: line_user_picture
    user_data = verify_line_id_token(id_token, nonce)
    if not user_data:
        return JSONResponse(status_code=400, content={"success": False, "message": "Line ID Token 驗證失敗"})

    # TODO 這段邏輯需要重新設計, 前端要多一個讓使用者選擇綁定現有帳號還是建立新帳號的選項 (需綁定 Line 帳號才可以使用 Line Message Bot 功能)
    line_user_id = user_data.get("sub")
    user = sqldb.query(User).filter(User.line_user_id == line_user_id).first()
    if not user:
        user = User(
            line_user_id=user_data.get("sub"),
            line_user_name=user_data.get("name"),
            line_user_picture=user_data.get("picture"),
            is_active=False
        )
        sqldb.add(user)
        sqldb.commit()
    else:
        user.line_user_name = user_data.get("name")
        user.line_user_picture = user_data.get("picture")
        sqldb.commit()

    # - 新增 refresh token 來更新 access token -
    jwt_token = create_jwt_token(data={
        "username": user.username,
        "email": user.email,
        "line_user_name": user.line_user_name,
        "line_user_id": user.line_user_id,
        "is_active": user.is_active
    })

    jwt_refresh_token = create_refresh_token(data={
        "username": user.username,
        "email": user.email,
        "line_user_name": user.line_user_name,
        "line_user_id": user.line_user_id,
        "is_active": user.is_active
    })

    json_response = JSONResponse(status_code=200, content={
        "success": True,
        "token": jwt_token
    })
    set_cookies(json_response, token=jwt_refresh_token, expired_days=3)
    # - End. -

    return json_response


@router.post("/logout")
async def logout(response: Response):
    """
      使用者登出 (須清除 cookies)
    """
    try:
        response = JSONResponse(status_code=200, content={
            "success": True,
            "message": "登出成功"
        })
        clear_cookies(response)
        return response

    except Exception:
        return JSONResponse(status_code=500, content={
            "success": False,
            "message": "登出失敗"
        })
