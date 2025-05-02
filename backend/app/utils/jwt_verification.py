from datetime import datetime, timedelta
from jose import JWTError, jwt
import os

ALGORITHM = "HS256"
TOKEN_EXPIRES = 60  # 1 hr
JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY")


def create_jwt_token(data: dict):
    """
      create_jwt_token(data: dict): 建立 JWT token
      註: 若需要新增使用者的資料, 可以在此處理

      :param
        data: 使用者需要加密的資料

      :return
        jwt: JWT token 或 None.
    """
    if not JWT_SECRET_KEY:
        print("check JWT_SECRET_KEY environment value!")
        return None

    encode_data = data.copy()
    expire_time = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRES)
    encode_data.update({"exp": expire_time})

    jwt_token = jwt.encode(encode_data, JWT_SECRET_KEY, algorithm=ALGORITHM)
    return jwt_token


def verify_jwt_token(token: str):
    """
      verify_jwt_token(token: str): 驗證 jwt token

      :return
        payload: 使用者加密的資料
    """
    try:
        paylaod = jwt.encode(token, JWT_SECRET_KEY, algorithms=ALGORITHM)
        return paylaod
    except JWTError:
        print("JWT token error.")
        return None
