# Depends & celery & data type check
from app.celery import celery
from typing import Dict

# mysql models
from app.databases.mysql_setting import SessionLocal
from app.models.sql_model import UserLoginLog

__all__ = ['log_user_login']


@celery.task(bind=True)
def log_user_login(task, data: Dict[str, str | None], status: bool):
    """
      log_user_login(data: Dict[str, any]): 排程, 使用者登入日誌紀錄

      :params
        data:
            ip: 使用者 ip 位置
            email: 使用者信箱
            line_user_name: 使用者 line 名稱
            line_user_id: 使用者 line id
            method: 登入方式

        status: 登入狀態
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
