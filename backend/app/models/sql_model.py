from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime, date

Base = declarative_base()


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
        return f"<UserLoginLog (id={self.id}, status={self.success_status})"
