import os
import base64
import hashlib
import json
import secrets
from datetime import timedelta
from urllib.parse import urlencode
import jwt
from jwt import PyJWKClient


# redis
from app.databases.redis_setting import connect_redis


# 1. 取得 Line Login 的 Channel ID 和 Channel Secret
LINE_LOGIN_CHANNEL_ID = os.getenv("LINE_LOGIN_CHANNEL_ID", "")
LINE_LOGIN_CHANNEL_SECRET = os.getenv("LINE_LOGIN_CHANNEL_SECRET", "")

if not (LINE_LOGIN_CHANNEL_ID and LINE_LOGIN_CHANNEL_SECRET):
    raise ValueError(
        "LINE_LOGIN_CHANNEL_ID or LINE_LOGIN_CHANNEL_SECRET 尚未設定")

# 2. 設定 Oauth 2.0 的參數
LINE_LOGIN_REDIRECT_URI = os.getenv("LINE_LOGIN_CALLBACK_URL", "")
LINE_LOGIN_SCOPE = "profile openid email"
LINE_LOGIN_RESPONSE_TYPE = "code"
LINE_LOGIN_CODE_CHALLENGE_METHOD = "S256"

# 3. 設定 Line Login/Auth 等 URL
LINE_LOGIN_AUTH_URL = "https://access.line.me/oauth2/v2.1/authorize"   # 授權登入
LINE_ACCESS_TOKEN_URL = "https://api.line.me/oauth2/v2.1/token"        # 取得 Access Token
LINE_PROFILE_URL = "https://api.line.me/v2/profile"                    # 取得 User 資料
# 驗證 JWT token (JWKS)
LINE_JWKS_URL = "https://api.line.me/oauth2/v2.1/certs"


def get_line_login_url() -> str:
    """
    取得 Line Login 的 URL

    Returns:
        str: Line Login 的 URL  
    """
    state = secrets.token_urlsafe(24)            # 防 CSRF
    nonce = secrets.token_urlsafe(24)            # 防 id_token 重放
    code_verifier = secrets.token_urlsafe(64)    # 43~128 字元
    code_challenge = base64.urlsafe_b64encode(
        hashlib.sha256(code_verifier.encode()).digest()
    ).decode().rstrip("=")

    # 透過 Redis 儲存 User 授權登入狀態
    redis_client = connect_redis(redis_db=1)

    key = f"UserLineLogin:{state}"
    redis_client.setex(
        key,
        int(timedelta(minutes=10).total_seconds()),
        json.dumps({
            "nonce": nonce,
            "code_verifier": code_verifier,
        })
    )

    params = {
        "response_type": "code",
        "client_id": LINE_LOGIN_CHANNEL_ID,
        "redirect_uri": LINE_LOGIN_REDIRECT_URI,
        "scope": LINE_LOGIN_SCOPE,
        "state": state,
        "nonce": nonce,
        "code_challenge": code_challenge,
        "code_challenge_method": LINE_LOGIN_CODE_CHALLENGE_METHOD,
    }
    return f"{LINE_LOGIN_AUTH_URL}?{urlencode(params)}"


def get_line_access_token_params(code: str, state: str) -> tuple[str, dict] | None:
    """
    取得 Line Access Token

    Returns:
        dict: Line Access Token Parameters
    """
    # 透過 Redis 取得 User 授權登入狀態
    redis_client = connect_redis(redis_db=1)
    key = f"UserLineLogin:{state}"
    data = redis_client.get(key)
    if not data:
        return None

    data = json.loads(data)
    code_verifier = data.get("code_verifier")
    nonce = data.get("nonce")

    return LINE_ACCESS_TOKEN_URL, {
        "grant_type": "authorization_code",
        "code": code,
        "client_id": LINE_LOGIN_CHANNEL_ID,
        # NOTE 若攜帶 client_secret 簽名, 會產生 HS256 簽名而非 RS256
        # "client_secret": LINE_LOGIN_CHANNEL_SECRET,
        "code_verifier": code_verifier,
        "redirect_uri": LINE_LOGIN_REDIRECT_URI,
    }, nonce


def verify_line_id_token(id_token: str, nonce: str) -> dict | None:
    """
    驗證 Line ID Token

    Returns:
        dict: 驗證結果 (payload)
    """
    # 驗證 Line ID Token
    if not id_token:
        return None

    # 1. 取簽章金鑰並驗簽
    jwk_client = PyJWKClient(LINE_JWKS_URL)
    signing_key = jwk_client.get_signing_key_from_jwt(id_token).key
    print(signing_key)

    # 2. 檢查 JWT token
    # NOTE 若取得 Access Token 時, 攜帶 client_secret 簽名, 會產生 HS256 簽名而非 RS256.
    # NOTE 此時解 JWT token 的 secret key 要和 "client_secret" 相同.
    # TODO Line Developer 查看 Access Token 簽名方式
    claims = jwt.decode(
        id_token,
        signing_key,
        algorithms=["RS256"],
        audience=LINE_LOGIN_CHANNEL_ID,
        issuer="https://access.line.me",
        options={"require": ["exp", "iat", "aud", "iss"]},
        leeway=30,
    )

    # 3. 比對 nonce（防重放）
    if claims.get("nonce") != nonce:
        return None

    return claims
