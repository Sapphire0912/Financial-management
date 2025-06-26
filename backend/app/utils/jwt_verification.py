from fastapi import Request

from datetime import datetime, timedelta
from jose import ExpiredSignatureError, JWTError, jwt
from functools import wraps
from typing import Callable
import os

from app.utils.error_handle import AuthorizationError

ALGORITHM = "HS256"
TOKEN_EXPIRES = 15  # 15 minute
JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY")


def create_jwt_token(data: dict):
    """
    建立 JWT token。

    Args:
        data (dict): 使用者需要加密的資料，例如 user_id、email 等。

    Returns:
        str: JWT token 字串。若失敗則回傳 None。
    """
    if not JWT_SECRET_KEY:
        print("check JWT_SECRET_KEY environment value!")
        return None

    encode_data = data.copy()
    expire_time = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRES)
    encode_data.update({"exp": expire_time})

    jwt_token = jwt.encode(encode_data, JWT_SECRET_KEY, algorithm=ALGORITHM)
    return jwt_token


def create_refresh_token(data: dict, expired_days: int = 3):
    """
    建立 JWT Refresh Token。

    Args:
        data (dict): 使用者需要加密的資料，例如 user_id、email 等。
        expired_days (int): Refresh Token 過期時間，預設 3 天。

    Returns:
        str: Refresh Token 字串。若失敗則回傳 None。
    """
    encode_data = data.copy()
    expire_time = datetime.utcnow() + timedelta(days=expired_days)
    encode_data.update({"exp": expire_time})

    jwt_refresh_token = jwt.encode(
        encode_data, JWT_SECRET_KEY, algorithm=ALGORITHM)
    return jwt_refresh_token


def verify_refresh_token(func: Callable):
    """
    驗證使用者的 Refresh Token 並重新簽發新的 Access Token。

    Args:
        func (Callable): 被裝飾的 FastAPI 路由處理函式。

    Returns:
        str | None: 若驗證成功則回傳新的 Access Token，否則回傳 None。
    """

    @wraps(func)
    async def _verify_refresh_token(request: Request, *args, **kwargs):
        # 需要驗證已過期的 Access Token 和 refresh_token(Cookies) 的正確性
        auth_headers = request.headers.get("Authorization")
        refresh_token = request.cookies.get("refresh_token")

        if not auth_headers or not auth_headers.startswith("Bearer ") or not refresh_token:
            raise AuthorizationError(request)

        auth_token = auth_headers.split(' ')[1]
        try:
            auth_payload = jwt.decode(
                auth_token,
                JWT_SECRET_KEY,
                algorithms=[ALGORITHM],
                options={"verify_exp": False}  # 忽略過期驗證
            )

            refresh_payload = jwt.decode(
                refresh_token,
                JWT_SECRET_KEY,
                algorithms=[ALGORITHM]
            )

            # 比對 auth_payload 和 refresh_payload 除了時間以外其他是否一樣
            for key, value in auth_payload.items():
                if key != "exp" and value != refresh_payload.get(key):
                    raise AuthorizationError(request)

            new_token = create_jwt_token(refresh_payload)

        except JWTError:
            return None

        # 設定 request.state 將使用者訊息帶到 api (類似 flask.g)
        request.state.new_token = new_token
        return await func(request, *args, **kwargs)

    return _verify_refresh_token


def verify_jwt_token(func: Callable) -> Callable:
    """
    JWT 驗證裝飾器，用來驗證 HTTP 請求中的 JWT token 並將解碼後的 payload 存入 request.state。

    Args:
        func (Callable): 被裝飾的 FastAPI 路由處理函式。

    Returns:
        Callable: 包裝後的處理函式。若驗證成功，payload 會儲存在 request.state.payload 中。
    """
    @wraps(func)
    async def _jwt_authiorization(request: Request, *args, **kwargs):
        auth_headers = request.headers.get("Authorization")
        if not auth_headers or not auth_headers.startswith("Bearer "):
            raise AuthorizationError(request)

        token = auth_headers.split(' ')[1]
        try:
            payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
        except JWTError:
            raise AuthorizationError(request)

        # 設定 request.state 將使用者訊息帶到 api (類似 flask.g)
        request.state.payload = payload
        return await func(request, *args, **kwargs)

    return _jwt_authiorization
