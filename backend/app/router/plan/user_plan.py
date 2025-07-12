# Fastapi
from fastapi import APIRouter, Depends, Request, Response
from fastapi.encoders import jsonable_encoder  # 處理 json 序列化操作
from fastapi.responses import JSONResponse

# Databases
from sqlalchemy.orm import Session
from app.databases.mysql_setting import connect_mysql
from app.models.sql_model import User, UserBudgetSetting, UserSavingsPlan, UserExpenseNotifySetting, UserIncomeNotifySetting

# Schemas
from app.schemas.users_plan import PlanContent

# JWT
from app.utils.jwt_verification import verify_jwt_token

# Tools
from app.utils.attach_info import convert_datetime_to_date_string, convert_to_utc_datetime
from datetime import time, datetime
from dateutil.relativedelta import relativedelta
from typing import List

router = APIRouter(prefix="/planning", tags=["planning"])


@router.get("/{timezone}", response_model=dict)
@verify_jwt_token
async def get_user_planning_menu(request: Request, timezone: str, sqldb: Session = Depends(connect_mysql)):
    """
    取得使用者理財規劃表格資料
    註: frequency 此處僅保留此欄位但不使用 (默認都為 2 => 每個月預算設定)

    Returns:
        data.content: 輸出由上到下內容顯示格式與使用者的設定資料
    """
    payload = request.state.payload
    user = sqldb.query(User).filter(
        User.username == payload["username"]).first()
    if not user:
        return JSONResponse(status_code=401, content={"success": False, "message": "使用者名稱錯誤"})

    content: List[PlanContent] = []

    def build_plan(
            index: int, label: str, isActive: bool, frequency: int,
            reach_time: str | None, threshold: int,
            isEmail: bool = False, isLine: bool = False
    ) -> PlanContent:
        return PlanContent(
            sort=index,
            label=label,
            isActive=isActive,
            threshold=threshold,
            frequency=frequency,
            reach_time=reach_time,
            isEmail=isEmail,
            isLine=isLine
        )

    def _add_sql_data(table_name, user_id: int):
        data = table_name(user_id=user_id)
        sqldb.add(data)
        sqldb.commit()

    # 預算設定
    budget_setting = sqldb.query(UserBudgetSetting).filter(
        UserBudgetSetting.user_id == user.id).first()
    if budget_setting:
        content.append(build_plan(
            index=0,
            label="每個月預算花費設定⭢$",
            isActive=budget_setting.is_open_plan,
            frequency=budget_setting.budget_period,
            threshold=budget_setting.budget,
            reach_time=None,
            isEmail=budget_setting.is_period_email_notify,
            isLine=budget_setting.is_period_line_notify
        ))

    else:
        _add_sql_data(UserBudgetSetting, user.id)
        content.append(
            PlanContent(
                sort=0, label="當月預算花費設定⭢$", isActive=False, threshold=0,
                frequency=0, reach_time=None, isEmail=False, isLine=False
            )
        )

    # 存錢目標規劃
    savings_plan = sqldb.query(UserSavingsPlan).filter(
        UserSavingsPlan.user_id == user.id).first()
    if savings_plan:
        content.append(build_plan(
            index=1,
            label="存錢目標計畫",
            isActive=savings_plan.is_open_plan,
            frequency=None,
            threshold=savings_plan.target_amount,
            reach_time=convert_datetime_to_date_string(
                savings_plan.reach_time, timezone),
            isEmail=savings_plan.is_period_email_notify,
            isLine=savings_plan.is_period_line_notify
        ))
    else:
        _add_sql_data(UserSavingsPlan, user.id)

        # 默認時間的 reach_time 是 utc time + 1 個月
        default_reach_time = datetime.utcnow() + relativedelta(months=1)
        content.append(PlanContent(
            sort=1, label="存錢目標計畫", isActive=False, threshold=0,
            frequency=None, reach_time=convert_datetime_to_date_string(default_reach_time, timezone),
            isEmail=False, isLine=False
        ))

    # - 處理選單資訊 -
    # menu = [
    #     {"label": "每天", "value": 0},
    #     {"label": "每周", "value": 1},
    #     {"label": "每月", "value": 2},
    #     {"label": "每季", "value": 3},
    #     {"label": "每半年", "value": 4},
    #     {"label": "每年", "value": 5}
    # ]

    return JSONResponse(status_code=200, content={
        "success": True,
        "data": {
            "content": jsonable_encoder(content),
            # "periodMenu": menu
        }
    })


@router.put("/update/{timezone}")
@verify_jwt_token
async def update_user_plan_setting(request: Request, content: List[PlanContent], timezone: str, sqldb: Session = Depends(connect_mysql)):
    """
    更新理財計畫設定
    """
    payload = request.state.payload
    user = sqldb.query(User).filter(
        User.username == payload["username"]).first()
    if not user:
        # TODO: 需新增通知訊息 Log
        return JSONResponse(status_code=401, content={"success": False, "message": "使用者名稱錯誤"})

    try:
        # 更新預算設定
        budget_setting = sqldb.query(UserBudgetSetting).filter(
            UserBudgetSetting.user_id == user.id).first()
        budget_content, plan_content = content[0], content[1]

        budget_setting.is_open_plan = budget_content.isActive
        budget_setting.budget = budget_content.threshold
        budget_setting.is_period_email_notify = budget_content.isEmail
        budget_setting.is_period_line_notify = budget_content.isLine

        # 更新存錢計畫設定
        plan_setting = sqldb.query(UserSavingsPlan).filter(
            UserSavingsPlan.user_id == user.id).first()
        plan_setting.is_open_plan = plan_content.isActive
        plan_setting.target_amount = plan_content.threshold
        plan_setting.reach_time = convert_to_utc_datetime(
            plan_content.reach_time, timezone)
        plan_setting.is_period_email_notify = plan_content.isEmail
        plan_setting.is_period_line_notify = plan_content.isLine

        sqldb.commit()
        return JSONResponse(status_code=200, content={"success": True, "message": "更新理財計畫設定成功"})

    except Exception as e:
        print(f'更新理財計畫設定失敗, {e}')
        sqldb.rollback()

    return JSONResponse(status_code=500, content={"success": False, "message": "更新理財計畫設定失敗"})
