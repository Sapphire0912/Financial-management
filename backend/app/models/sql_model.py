from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime, date

Base = declarative_base()


class User(Base):
    """
      使用者資料表

      id: 使用者ID
      username: 使用者名稱
      email: 使用者Email
      password: 使用者密碼
      is_active: 是否綁定
      line_user_name: 使用者Line名稱
      line_user_id: 使用者LineID
      created_at: 建立時間
      updated_at: 更新時間
      last_login_at: 最後登入時間
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

      id: 日誌紀錄id
      email: 使用者Email
      line_user_name: 使用者Line名稱
      line_user_id: 使用者LineID
      method: 登入方式
      success_status: 登入是否成功
      created_at: 建立時間
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
