# Fastapi
from fastapi import APIRouter, Depends, Request, Response
from fastapi.encoders import jsonable_encoder  # 處理 json 序列化操作
from fastapi.responses import JSONResponse

# Databases
from sqlalchemy.orm import Session
from app.databases.mysql_setting import connect_mysql
from app.models.sql_model import User, UserBudgetSetting, UserSavingsPlan, UserExpenseNotifySetting, UserIncomeNotifySetting

# Schemas
from app.schemas.users_setting import NotifyContent

# JWT
from app.utils.jwt_verification import verify_jwt_token

# Tools
from app.utils.attach_info import convert_time_to_utc_time
from datetime import datetime, timedelta, time
from dateutil.relativedelta import relativedelta
from typing import List, Tuple
import re


router = APIRouter(prefix="/prefer/setting", tags=["prefer_setting"])
_CACHE_MEMORY_TIME = 300  # (s)


@router.get("/{timezone}", response_model=dict)
@verify_jwt_token
async def get_message_notify_setting(request: Request, timezone: str, sqldb: Session = Depends(connect_mysql)):
    """
    取得使用者訊息通知設定表格資料

    Returns:
        data.content: 輸出由上到下內容顯示格式與使用者的設定資料
    """
    payload = request.state.payload
    user = sqldb.query(User).filter(
        User.username == payload["username"]).first()
    if not user:
        return JSONResponse(status_code=401, content={"success": False, "message": "使用者名稱錯誤"})

    content: List[NotifyContent] = []

    def build_notify(index: int, label: str, isActive: bool, frequency: int, notify_time: time,
                     threshold: int = None, isEmail=False, isLine=False) -> NotifyContent:
        return NotifyContent(
            sort=index,
            label=label,
            isActive=isActive,
            frequency=frequency,
            time=convert_time_to_utc_time(notify_time, timezone),
            threshold=threshold,
            isEmail=isEmail,
            isLine=isLine
        )

    def _add_sql_data(table_name, user_id: int):
        data = table_name(user_id=user_id)
        sqldb.add(data)
        sqldb.commit()

    # 1 & 2. 預算設定
    budget = sqldb.query(UserBudgetSetting).filter_by(user_id=user.id).first()
    if budget:
        content.append(build_notify(
            0, "定期預算通知",
            budget.is_period_notify,
            budget.period_frequency,
            budget.period_notify_time,
            None,
            budget.is_period_email_notify,
            budget.is_period_line_notify
        ))
        content.append(build_notify(
            1, "警示預算通知",
            budget.is_warning_notify,
            budget.warning_frequency,
            budget.warning_notify_time,
            budget.lower_warning_percent,
            budget.is_warning_email_notify,
            budget.is_warning_line_notify
        ))
    else:
        # 新增資料
        _add_sql_data(UserBudgetSetting, user.id)

        content += [
            NotifyContent(
                sort=i, label=t, isActive=False, frequency=None, time=None,
                threshold=None, isEmail=False, isLine=False
            ) for i, t in [(0, "定期預算通知"), (1, "警示預算通知")]
        ]

    # 3 & 4. 存錢計畫設定
    saving = sqldb.query(UserSavingsPlan).filter_by(user_id=user.id).first()
    if saving:
        content.append(build_notify(
            2, "定期存錢計畫通知",
            saving.is_period_notify,
            saving.period_frequency,
            saving.period_notify_time,
            None,
            saving.is_period_email_notify,
            saving.is_period_line_notify
        ))
        content.append(build_notify(
            3, "目標達成通知",
            saving.is_warning_notify,
            saving.warning_frequency,
            saving.warning_notify_time,
            saving.upper_warning_percent,
            saving.is_warning_email_notify,
            saving.is_warning_line_notify
        ))
    else:
        # 新增資料
        _add_sql_data(UserSavingsPlan, user.id)

        content += [
            NotifyContent(
                sort=i, label=t, isActive=False, frequency=None, time=None,
                threshold=None, isEmail=False, isLine=False
            ) for i, t in [(2, "定期存錢計畫通知"), (3, "目標達成通知")]
        ]

    # 5. 支出通知
    expense = sqldb.query(UserExpenseNotifySetting).filter_by(
        user_id=user.id).first()
    if expense:
        content.append(build_notify(
            4, "定期支出統計通知",
            expense.is_period_notify,
            expense.period_frequency,
            expense.period_notify_time,
            None,
            expense.is_period_email_notify,
            expense.is_period_line_notify
        ))
    else:
        # 新增資料
        _add_sql_data(UserExpenseNotifySetting, user_id=user.id)

        content.append(NotifyContent(sort=4, label="定期支出統計通知", isActive=False, frequency=None, time=None,
                                     threshold=None, isEmail=False, isLine=False))

    # 6. 收入通知
    income = sqldb.query(UserIncomeNotifySetting).filter_by(
        user_id=user.id).first()
    if income:
        content.append(build_notify(
            5, "定期收入統計通知",
            income.is_period_notify,
            income.period_frequency,
            income.period_notify_time,
            None,
            income.is_period_email_notify,
            income.is_period_line_notify
        ))
    else:
        # 新增資料
        _add_sql_data(UserIncomeNotifySetting, user_id=user.id)

        content.append(NotifyContent(sort=5, label="定期收入統計通知", isActive=False, frequency=None, time=None,
                                     threshold=None, isEmail=False, isLine=False))

    # - 處理週期通知 & 警示通知的選單 -
    menu = [
        {"label": "每天", "value": 0},
        {"label": "每兩天", "value": 1},
        {"label": "每三天", "value": 2},
        {"label": "每週", "value": 3},
        {"label": "每兩週", "value": 4},
        {"label": "每個月", "value": 5},
        {"label": "每季", "value": 6},
        {"label": "半年", "value": 7},
        {"label": "一年", "value": 8},
        {"label": "僅平日", "value": 9},
        {"label": "僅假日", "value": 10},
    ]

    return JSONResponse(status_code=200, content={
        "success": True,
        "data": {
            "content": jsonable_encoder(content),
            "periodMenu": menu,
            "warningMenu": menu,
        }
    })


@router.put("/update/{timezone}")
@verify_jwt_token
async def update_message_notify_setting(request: Request, content: List[NotifyContent], timezone: str, sqldb: Session = Depends(connect_mysql)):
    """
    更新訊息通知設定 
    註: 利用 sort 來判斷當前更新的 table 位置 (若 sort 改變此處需要更新)
    """
    payload = request.state.payload
    user = sqldb.query(User).filter(
        User.username == payload["username"]).first()
    if not user:
        # TODO: 需新增通知訊息 Log
        return JSONResponse(status_code=401, content={"success": False, "message": "使用者名稱錯誤"})

    def _update_period_data(target_data, target_content):
        """更新定期通知的資料"""
        target_data.is_period_notify = target_content.isActive
        target_data.period_frequency = target_content.frequency
        target_data.period_notify_time = convert_time_to_utc_time(
            target_content.time, timezone)
        target_data.is_period_email_notify = target_content.isEmail
        target_data.is_period_line_notify = target_content.isLine

    def _update_warning_data(target_data, target_content, field: str = "lower"):
        """更新警示通知的資料"""
        target_data.is_warning_notify = target_content.isActive
        target_data.warning_frequency = target_content.frequency
        target_data.warning_notify_time = convert_time_to_utc_time(
            target_content.time, timezone)

        if field == "lower":
            target_data.lower_warning_percent = target_content.threshold
        else:
            target_data.upper_warning_percent = target_content.threshold

        target_data.is_warning_email_notify = target_content.isEmail
        target_data.is_warning_line_notify = target_content.isLine

    # 更新 預算通知 相關
    try:
        budget_setting = sqldb.query(UserBudgetSetting).filter(
            UserBudgetSetting.user_id == user.id).first()
        _update_period_data(budget_setting, content[0])  # 定期預算通知
        _update_warning_data(budget_setting, content[1], "lower")  # 警示預算通知

        # 3 & 4. 更新存錢計畫 & 目標達成通知
        savings_plan = sqldb.query(UserSavingsPlan).filter(
            UserSavingsPlan.user_id == user.id).first()
        _update_period_data(savings_plan, content[2])  # 定期存錢計畫通知
        _update_warning_data(savings_plan, content[3], "upper")  # 目標達成通知

        # 5 & 6. 更新 定期支出/收入統計
        expense_notify = sqldb.query(UserExpenseNotifySetting).filter(
            UserExpenseNotifySetting.user_id == user.id).first()
        _update_period_data(expense_notify, content[4])

        income_notify = sqldb.query(UserIncomeNotifySetting).filter(
            UserIncomeNotifySetting.user_id == user.id).first()
        _update_period_data(income_notify, content[5])

        sqldb.commit()
        return JSONResponse(status_code=200, content={"success": True, "message": "更新訊息通知設定成功"})

    except Exception as e:
        print(f'更新訊息通知設定失敗, {e}')
        sqldb.rollback()

    return JSONResponse(status_code=500, content={"success": False, "message": "更新訊息通知設定失敗"})
