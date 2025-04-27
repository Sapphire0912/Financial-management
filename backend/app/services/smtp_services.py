import os
import random
from dotenv import load_dotenv

# redis
from app.databases.redis_setting import connect_redis

# SMTP services
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# 非同步處理模組
import asyncio

load_dotenv()

# 發送 Gmail SMTP 驗證碼的服務 (使用 Gmail 註冊時需要)
SMTP_SERVER = os.environ.get("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "465"))
SMTP_USER = os.environ.get("SMTP_USER")
SMTP_APP_PASSWORD = os.environ.get("SMTP_APP_PASSWORD")  # Gmail 應用程式密碼


__all__ = ['send_email', 'verify_digital_code']


def set_digital_code(to_email: str) -> str:
    """
      set_digital_code(to_email: str): 生成 6 位數字驗證碼
    """

    digits = "0123456789"
    verification_code = ''.join(random.choices(digits, k=6))

    # redis/3
    verification_redis = connect_redis(redis_db=3)
    key = f"{to_email}_digital_code"
    verification_redis.set(key, verification_code, ex=5 * 60)  # 5 分鐘失效

    return verification_code


async def send_email(to_email: str):
    """
      send_email(to_email: str): 發送 Gmail 驗證信

      :params
        to_email: 目標使用者信箱
    """
    # python 3.10+ 官方建議使用 get_running_loop(), 非 get_event_loop()
    loop = asyncio.get_running_loop()

    def _handle_email():
        message = MIMEMultipart()
        message["From"] = SMTP_USER
        message["To"] = to_email
        message["Subject"] = "Sapphire 財務管理專案"

        body = f"Sapphire 財務管理驗證碼通知，您的驗證碼為： {set_digital_code(to_email=to_email)}, 此驗證碼將於 5 分鐘後失效，請盡快完成驗證。"
        message.attach(MIMEText(body, "plain"))

        try:
            with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT) as server:
                server.login(SMTP_USER, SMTP_APP_PASSWORD)
                server.sendmail(SMTP_USER, to_email, message.as_string())

            print(f'{to_email} 信件已送達')
        except Exception as e:
            print(f"{to_email} 信件送達失敗, {e}")

    await loop.run_in_executor(None, _handle_email)


async def verify_digital_code(to_email: str, code: str) -> bool:
    """
      verify_digital_code(to_email: str, code: str): 驗證數字驗證碼是否正確

      :params
        to_email: 使用者信箱
        code: 數字驗證碼
    """
    if not code:
        return False

    # redis/3
    verification_redis = connect_redis(redis_db=3)
    key = f"{to_email}_digital_code"
    verify_code = verification_redis.get(key)
    return verify_code == code


if __name__ == "__main__":
    gmail_test = os.environ.get("TEST_EMAIL")
    # gmail_test = "rouroubetty1205@gmail.com"
    asyncio.run(send_email(to_email=gmail_test))
