# Depends & celery & data type check
from app.celery import celery
from typing import Dict

# mysql models
from app.databases.mysql_setting import SessionLocal
from app.models.sql_model import UserLoginLog, JwtTokenLog

__all__ = ['log_user_login']


@celery.task(bind=True)
def log_user_login(task, data: Dict[str, str | None], status: bool):
    """
    排程任務：記錄使用者登入日誌。

    Args:
        task: 任務物件，通常為背景排程傳入的任務上下文。
        data (Dict[str, str | None]): 使用者登入相關資料，包括：
            - ip (str | None): 使用者 IP 位置。
            - email (str | None): 使用者信箱。
            - line_user_name (str | None): 使用者 Line 名稱。
            - line_user_id (str | None): 使用者 Line ID。
            - method (str | None): 登入方式（如 password、line 等）。

        status (bool): 登入是否成功。
    """
    sqldb = SessionLocal()
    try:
        new_log = UserLoginLog(
            ip=data["ip"],
            email=data["email"],
            line_user_name=data["line_user_name"],
            line_user_id=data["line_user_id"],
            method=data["method"],
            success_status=status
        )
        sqldb.add(new_log)
        sqldb.commit()

    except Exception as e:
        sqldb.rollback()
        print(f'[Celery]紀錄使用者登入日誌失敗: {e}')
    finally:
        sqldb.close()


@celery.task(bind=True)
def jwt_exception_log(task, ip: str, user_agent: str, token: str):
    """
    紀錄 JWT Token 錯誤日誌 (暫時不紀錄 token 資訊)

    Args:
        task: 任務物件，通常為背景排程傳入的任務上下文。
        ip (str): 使用者 ip 位置。
        user_agent (str): 使用者 UA。
        token (str): 使用者 token 欄位資料
    """
    sqldb = SessionLocal()
    try:
        new_log = JwtTokenLog(ip=ip, ua=user_agent)
        sqldb.add(new_log)
        sqldb.commit()
    except Exception as e:
        sqldb.rollback()
        print(f'[Celery]紀錄 JWT Token 日誌失敗: {e}')
    finally:
        sqldb.close()
