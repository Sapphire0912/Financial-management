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
      is_active: 是否啟用
      line_user_name: 使用者Line名稱
      line_user_id: 使用者LineID
      created_at: 建立時間
      updated_at: 更新時間
      last_login_at: 最後登入時間
    """
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    line_user_name = Column(String, nullable=True)
    line_user_id = Column(String, unique=True, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    last_login_at = Column(DateTime, default=datetime.now)

    def __repr__(self):
        return f"<User (id={self.id}, username='{self.username}')>"
