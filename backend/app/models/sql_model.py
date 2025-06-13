from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime, date

Base = declarative_base()


# -- 使用者相關 Schema --
class JwtTokenLog(Base):
    """
    JWT token 日誌紀錄

    資料欄位：
        id (int): 資料庫自增屬性。
        ip (str): 使用者 ip。
        ua (str): 使用者代理。
        created_at (datetime): 建立時間。
    """
    __tablename__ = "jwt_token_log"
    id = Column(Integer, primary_key=True)
    ip = Column(String(50), nullable=False)
    ua = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class User(Base):
    """
    使用者資料表模型

    資料欄位：
        id (int): 資料庫自增屬性。
        username (str): 使用者名稱。
        email (str): 使用者 Email。
        password (str): 使用者密碼（加密後）。
        is_active (bool): 是否已啟用 / 綁定。
        line_user_name (str): 使用者 Line 名稱。
        line_user_id (str): 使用者 Line ID。
        created_at (datetime): 建立時間。
        updated_at (datetime): 更新時間。
        last_login_at (datetime): 最後登入時間。
    """

    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=False)
    line_user_name = Column(String(100), nullable=True)
    line_user_id = Column(String(100), unique=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow)
    last_login_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<User (id={self.id}, username='{self.username}')>"


class UserLoginLog(Base):
    """
    使用者登入日誌

    資料欄位：
        id (int): 日誌紀錄 ID。
        email (str): 使用者 Email。
        line_user_name (str): 使用者 Line 名稱。
        line_user_id (str): 使用者 Line ID。
        method (str): 登入方式（如 password, line）。
        success_status (bool): 是否成功登入。
        created_at (datetime): 建立時間。
    """
    __tablename__ = "users_login_log"
    id = Column(Integer, primary_key=True, autoincrement=True)
    ip = Column(String(30))
    email = Column(String(100), nullable=False)
    line_user_name = Column(String(100), nullable=True)
    line_user_id = Column(String(100), unique=True, nullable=True)
    method = Column(String(10), nullable=True)
    success_status = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<UserLoginLog (id={self.id}, status={self.success_status})>"


class UserBrowserRecord(Base):
    """
    紀錄使用者交易歷史與通知的最後瀏覽時間
    (關聯 User 資料表)

    資料欄位:
        id (int): 資料庫自增屬性。
        user_id (int): 關聯 User 表的 ID 值
        history_last_view_at (datetime): 上次瀏覽交易歷史紀錄時間
        notification_last_view_at (datetime): 上次瀏覽通知紀錄時間
    """
    __tablename__ = "user_browser_record"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)  # 外鍵關聯
    history_last_view_at = Column(DateTime, nullable=True)
    notification_last_view_at = Column(DateTime, nullable=True)

    def __repr__(self):
        return f"<UserBrowserRecord (user_id={self.user_id})>"
