from fastapi import Request, Response
from dotenv import load_dotenv
import os

load_dotenv()
DEVELOP_ENV = os.getenv("DEVELOP_ENV", "True")


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
