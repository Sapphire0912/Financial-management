from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Numeric, Time
from sqlalchemy.ext.declarative import declarative_base
from enum import IntEnum
from datetime import datetime, date, time

Base = declarative_base()


# -- 使用者 & 使用者登入/日誌相關 Schema --
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
    紀錄使用者 交易歷史與通知 > 最後瀏覽時間
    (關聯 User 資料表)

    資料欄位:
        id (int): 資料庫自增屬性
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
# ----- End. -----


# ----- 理財規劃相關 Schema -----
# 註: 以下通知時間為機器時間 (需要加上 UTCTime 才是使用者收到訊息的時間)
# 例如: 09:00, UTC+8 則使用者 18:00 才會收到訊息
class NotifyInterval(IntEnum):
    """通知間隔 (WEEK_2 代表 2 週)"""
    DAY_1 = 0
    DAY_2 = 1
    DAY_3 = 2
    WEEK_1 = 3
    WEEK_2 = 4
    MONTH_1 = 5
    QUARTERLY = 6
    SEMIANNUALLY = 7
    YEARLY = 8
    ONLY_WEEKDAY = 9  # 僅 一 ~ 五
    ONLY_WEEKEND = 10  # 僅六日


class PeriodNotifySchema(Base):
    """
    使用者通知設定相關欄位 (週期性設定)

    資料欄位:
        is_period_notify (bool): 是否開啟定期通知
        frequency (int): 通知間隔 (預設為每天)
        period_notify_time (Time): 通知時間 (hh:mm:ss)
        is_period_email_notify (bool): 是否開啟信箱通知
        is_period_line_notify (bool): 是否開啟 Line 通知
    """
    __abstract__ = True
    is_period_notify = Column(Boolean, default=False)
    period_frequency = Column(Integer, nullable=True)
    period_notify_time = Column(Time, nullable=False, default=time(10, 0))
    is_period_email_notify = Column(Boolean, default=False)
    is_period_line_notify = Column(Boolean, default=False)


class WarningNotifySchema(Base):
    """
    使用者通知設定相關欄位 (警示/達成設定)

    資料欄位:
        is_warning_notify (bool): 是否開啟警示通知
        warning_frequency (int): 通知間隔 (預設為每天)
        warning_notify_time (Time): 通知時間 (hh:mm:ss)
        is_warning_email_notify (bool): 是否開啟信箱通知
        is_warning_line_notify (bool): 是否開啟 Line 通知
    """
    __abstract__ = True
    is_warning_notify = Column(Boolean, default=False)
    warning_frequency = Column(Integer, nullable=True)
    warning_notify_time = Column(Time, nullable=False, default=time(10, 0))
    is_warning_email_notify = Column(Boolean, default=False)
    is_warning_line_notify = Column(Boolean, default=False)


class PlanningPeriod(IntEnum):
    """預算設定週期"""
    DAILY = 0
    WEEKLY = 1
    MONTHLY = 2
    QUARTERLY = 3
    SEMIANNUALLY = 4
    YEARLY = 5


class UserBudgetSetting(PeriodNotifySchema, WarningNotifySchema):
    """
    使用者 理財規劃 > 預算設定

    資料欄位:
        id (int): 資料庫自增屬性
        user_id (int): 關聯 User table ID
        budget (float): 預算設定
        budget_period (int): 週期 (例如: 每個月預算 10000)
            - 0: 每天
            - 1: 每周
            - 2: 每個月
            - 3: 每一季 
            - 4: 每半年
            - 5: 每年
        is_open_plan (bool): 是否開啟預算設定功能
        lower_warning_percent (int): 預算'低於多少'發出警示通知
    """
    __tablename__ = 'user_budget_setting'
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # 預算設定
    budget = Column(Numeric(10, 2), nullable=True)  # 採用 Numeric 較符合金融上的計算
    budget_period = Column(Integer, default=0)
    is_open_plan = Column(Boolean, default=False)

    # 警示預算設定
    lower_warning_percent = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow)


class UserSavingsPlan(PeriodNotifySchema, WarningNotifySchema):
    """
    使用者 理財規劃 > 存錢計畫

    資料欄位:
        id (int): 資料庫自增屬性
        user_id (int): 關聯 User table ID
        target_amount (float): 目標金額
        reach_time (datetime): 達成時間
        is_open_plan (bool): 是否開啟存錢計畫功能
        upper_warning_percent (int): 目標高於多少 % 通知
    """
    __tablename__ = 'user_savings_plan'
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # 目標 - 存錢計畫設定
    target_amount = Column(Numeric(10, 2), nullable=True)
    reach_time = Column(DateTime, default=datetime.utcnow)
    is_open_plan = Column(Boolean, default=False)

    # 目標高於多少 % 通知
    upper_warning_percent = Column(Integer, default=100)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow)

# ----- End. -----

# ----- 使用者偏好設定相關 (設定, 個人資料) -----
# 註: 理財規劃的設定通知會在理財規劃的 Schema 中, 其他設定在 UserNotifySetting 中


class UserExpenseNotifySetting(PeriodNotifySchema):
    """
    使用者 設定 > 訊息通知設定
    註: 定期支出通知邏輯 
        - 若設定每日 09:00 通知支出, 則代表 前一天 09:00:00 ~ 今日 09:00:00 

    資料欄位:
        id (int): 資料庫自增屬性
        user_id (int): 關聯 User table ID
    """
    __tablename__ = 'user_expense_notify_setting'
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow)


class UserIncomeNotifySetting(PeriodNotifySchema):
    """
    使用者 設定 > 訊息通知設定
    註: 定期收入通知邏輯 
        - 若設定每日 09:00 通知支出, 則代表 前一天 09:00:00 ~ 今日 09:00:00 

    資料欄位:
        id (int): 資料庫自增屬性
        user_id (int): 關聯 User table ID
    """
    __tablename__ = 'user_income_notify_setting'
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow)

# ----- End. -----
