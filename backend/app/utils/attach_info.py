from fastapi import Request, Response
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone, time
import os
import re

load_dotenv()
DEVELOP_ENV = os.getenv("DEVELOP_ENV", "True")


def verify_utc_time(user_utc_time: str) -> bool:
    """
    驗證使用者提交的 UTC 時間是否合理，依據其時區與建立時間進行比對。
    (允許誤差 10 分鐘)

    Args:
        user_utc_time (str): 使用者端當前的 UTC 時間（ISO 8601 格式）。

    Returns:
        bool: 若使用者時間與伺服器時間差異在合理範圍內（例如 ±10 分鐘），則回傳 True，否則回傳 False。
    """
    user_utc_at = datetime.fromisoformat(
        user_utc_time.replace("Z", "+00:00")).replace(tzinfo=None)

    server_utc_time = datetime.utcnow()
    delta = abs((server_utc_time - user_utc_at).total_seconds())

    return delta <= 600


def convert_time_to_utc_time(notify_time: time, timezone: str) -> time:
    """
    轉換時間 (Time 格式) 為 UTC 時間

    Args:
        notify_time (time): 表格時間 (HH:MM:SS)
        timezone (str): UTC 時區格式 (UTC+8)

    Returns:
        utc_time, 僅轉換後的時間格式 (HH:MM:SS)
    """
    match = re.match(r"UTC([+-])(\d{1,2})", timezone)
    if not match:
        return None

    sign, hours = match.groups()
    offset_hours = int(hours) * (-1 if sign == "+" else 1)

    local_dt = datetime.combine(datetime.today(), notify_time)
    utc_dt = local_dt + timedelta(hours=offset_hours)
    return utc_dt.time()


def convert_to_utc_datetime(user_time: str, user_timezone: str) -> datetime:
    """
    轉換使用者表單時間為資料庫 UTC 時間。

    Args:
        user_time (str): 使用者表單輸入時間 (例如: "2025-04-01T08:00")
        user_timezone (str): 使用者時區 (例如: "UTC+8")

    Returns:
        datetime: 對應資料庫的時間
    """
    user_local_time = datetime.fromisoformat(user_time)

    match = re.match(r"UTC([+-])(\d{1,2})", user_timezone)
    if not match:
        raise ValueError("無效的時區格式")

    sign, hours = match.groups()
    offset_hours = int(hours) * (-1 if sign == "-" else 1)

    aware_local_time = user_local_time.replace(
        tzinfo=timezone(timedelta(hours=offset_hours)))

    utc_time = aware_local_time.astimezone(timezone.utc).replace(tzinfo=None)
    return utc_time


def convert_datetime_to_date_string(utc_datetime: datetime, user_timezone: str) -> str:
    """
    轉換日期時間為 使用者所在時區的日期字串格式

    Args:
        utc_datetime (datetime): 要轉換的 UTC 日期時間
        user_timezone (str): 使用者所在時區 (例如: "UTC+8")

    Returns:
        str: 使用者所在時區的日期字串格式 (例如: "2025-04-01")
    """
    match = re.match(r"UTC([+-])(\d{1,2})", user_timezone)
    if not match:
        raise ValueError("無效的時區格式")

    sign, hours = match.groups()
    offset_hours = int(hours) * (-1 if sign == "-" else 1)

    date_str = (utc_datetime + timedelta(hours=offset_hours)
                ).strftime("%Y-%m-%d")
    return date_str


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
