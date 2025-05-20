from fastapi import Request, Response
from dotenv import load_dotenv
from datetimr import datetime, timedelta, timezone as dt_timezone
import os
import re

load_dotenv()
DEVELOP_ENV = os.getenv("DEVELOP_ENV", "True")


def verify_utc_time(user_utc_time: str, timezone: str, create_at: str) -> bool:
    """
    驗證使用者提交的 UTC 時間是否合理，依據其時區與建立時間進行比對。
    (允許誤差 10 分鐘)

    Args:
        user_utc_time (str): 使用者端根據其時區轉換後的 UTC 時間（ISO 8601 格式）。
        timezone (str): 使用者所在的時區名稱（如 'UTC+8'）。
        create_at (str): 用戶原始操作當地時間（ISO 格式，例如 '2025-05-20T14:00'）。

    Returns:
        bool: 若使用者時間與伺服器時間差異在合理範圍內（例如 ±5 分鐘），則回傳 True，否則回傳 False。
    """
    try:
        user_utc_dt = datetime.fromisoformat(user_utc_time)
        local_dt = datetime.fromisoformat(create_at)

        # 處理 timezone（如 'UTC+8' -> +08:00）
        match = re.match(r"UTC([+-])(\d{1,2})", timezone)
        if not match:
            return False

        sign, hours = match.groups()
        offset = int(hours)
        if sign == "-":
            offset = -offset

        offset_tz = dt_timezone(timedelta(hours=offset))
        local_dt = local_dt.replace(tzinfo=offset_tz)
        local_utc_dt = local_dt.astimezone(dt_timezone.utc)

        delta = abs((user_utc_dt - local_utc_dt).total_seconds())
        return delta <= 600

    except Exception:
        return False


def get_client_ip(request: Request) -> str:
    """
    取得使用者的 IP 位置。

    Args:
        request (Request): FastAPI 的請求物件。

    Returns:
        str: 使用者的 IP 位址。
    """
    x_forwarded_for = request.headers.get('X-Forwarded-For')
    ip = x_forwarded_for.split(
        ',')[0] if x_forwarded_for else request.client.host
    return ip


def set_cookies(response: Response, token: str, expired_days: int = 7):
    """
    設定 refresh token 到 response 的 HttpOnly Cookie。

    Args:
        response (Response): FastAPI 回應物件，用來設定 Cookie。
        token (str): 要寫入 Cookie 的 refresh token 字串。
        expired_days (int, optional): Cookie 的過期天數，預設為 7 天。

    Returns:
        None
    """
    response.set_cookie(
        key="refresh_token",
        value=token,
        httponly=True,
        secure=False if DEVELOP_ENV == 'True' else True,
        samesite="lax",
        path="/",
        max_age=expired_days * 24 * 60 * 60
    )


def clear_cookies(response: Response):
    """
    清除使用者的 refresh token Cookies。

    Args:
        response (Response): FastAPI 回應物件，用來設定 Cookie。

    Returns:
        None
    """
    response.delete_cookie(
        key="refresh_token",
        path="/"
    )
