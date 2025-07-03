# Fastapi
from fastapi import APIRouter, Depends, Request, Response
from fastapi.responses import JSONResponse

# Databases & Schemas
from app.schemas.dashboard import TimeInfo, DashboardBalanceInfo
from app.models.mongo_model import Accounting, IncomeAccounting

# JWT
from app.utils.jwt_verification import verify_jwt_token

# cache & key builder
from fastapi_cache.decorator import cache
from app.utils.cachekey import dashboard_balance_key_builder

# Tools
from app.utils.attach_info import verify_utc_time, convert_to_utc_time
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from typing import List, Tuple


router = APIRouter(prefix="/dashboard", tags=["dashboard"])

_CACHE_MEMORY_TIME = 300  # (s)


@router.post("/")
@verify_jwt_token
async def get_user_data(request: Request):
    """
    取得使用者資訊

    Returns:
        payload (dict), 使用者 token 資訊
    """
    payload = request.state.payload
    return JSONResponse(status_code=200, content={"success": True, "data": payload})


@router.post("/date_menu")
@verify_jwt_token
async def get_user_dashboard_date_menu(request: Request, timeInfo: TimeInfo):
    """
    取得儀錶板首頁選單資料
        - 支出 & 收入 & 年度統計的選單
    註: 計算使用者最早有紀錄的月份/年份 ~ 最新紀錄的月份/年份

    Returns:
        data:
            - income_menu: 收入選單
            - expense_menu: 支出選單
            - year_statistics_menu: 年度統計選單
    """
    if not verify_utc_time(user_utc_time=timeInfo.current_utc_time):
        return JSONResponse(status_code=403, content={"success": False, "message": "使用者時區或使用者本地時間有誤"})

    # 使用者參數處理
    payload = request.state.payload
    user_name = payload.get("username")
    line_user_id = payload.get("line_user_id")
    #

    def _get_menu(collection: Accounting | IncomeAccounting) -> Tuple[List[str], List[str]]:
        """
        取得選單列表資料

        Returns:
            (month_menu, year_menu)
        """
        query = collection.objects(user_name=user_name).only("created_at")

        first_data = query.order_by("created_at").first()
        last_data = query.order_by("-created_at").first()

        if not first_data or not last_data:
            now = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            return ["全部", now.strftime("%Y-%m")], [str(now.year)]

        first_date = first_data.created_at.replace(
            day=1, hour=0, minute=0, second=0, microsecond=0)
        last_date = last_data.created_at.replace(
            day=1, hour=0, minute=0, second=0, microsecond=0)

        # 月份選單：由最新到最舊
        month_menu = ["全部"]
        current = last_date
        while current >= first_date:
            month_menu.append(current.strftime("%Y-%m"))
            current -= relativedelta(months=1)

        # 年份選單
        year_menu = [str(year) for year in range(
            last_date.year, first_date.year - 1, -1)]

        return month_menu, year_menu

    expense_month_menu, expense_year_menu = _get_menu(Accounting)
    income_month_menu, income_year_menu = _get_menu(IncomeAccounting)

    data = {
        'expense_menu': expense_month_menu,
        'income_menu': income_month_menu,
        'year_statistics_menu': income_year_menu if len(income_year_menu) > len(expense_year_menu) else expense_year_menu
    }
    return JSONResponse(status_code=200, content={"success": True, "data": data})


@router.get("/balance/info")
@verify_jwt_token
async def get_user_balance_information(request: Request, timeInfo: TimeInfo):
    """
    取得儀錶板餘額資料 (需攜帶時間資訊驗證是否合理)
    計算方式:
        - 總餘額 = 總收入 - 總支出

    Returns:
        data, 總餘額頁面所需的資訊
    """
    if not verify_utc_time(user_utc_time=timeInfo.current_utc_time):
        return JSONResponse(status_code=403, content={"success": False, "message": "使用者時區或使用者本地時間有誤"})

    # 使用者參數處理
    payload = request.state.payload
    user_name = payload.get("username")
    line_user_id = payload.get("line_user_id")

    utc_time = convert_to_utc_time(timeInfo.user_time_data, timeInfo.timezone)
    end_time = utc_time.replace(
        day=1, hour=0, minute=0, second=0, microsecond=0)
    start_time = end_time - relativedelta(months=1)
    #
    print(f'line_user_id: {line_user_id}')
    print(f'[DEBUG] start: {start_time}, end: {end_time}. utc: {utc_time}')

    def _in_last_month(created_at: datetime):
        """判斷是否在當前月份內"""
        return start_time <= created_at < end_time

    try:
        data = dict()
        # - 此處未來需要處理匯率類型, 先以 TWD 為主 -
        expenses = Accounting.objects(user_name=user_name, unit="TWD")
        incomes = IncomeAccounting.objects(user_name=user_name, unit="TWD")

        # 總餘額
        total_expenses = sum(x.cost for x in expenses)
        total_incomes = sum(x.amount for x in incomes)
        data["total_balance"] = total_incomes - total_expenses

        # 上個月收入, 獎金, 支出
        last_month_expenses = sum(
            x.cost for x in expenses if _in_last_month(x.created_at))
        last_month_incomes = sum(
            x.amount for x in incomes if _in_last_month(x.created_at))
        last_month_bonus = sum(
            x.amount for x in incomes if x.income_kind == "獎金" and _in_last_month(x.created_at))

        data["last_month_expenses"] = last_month_expenses
        data["last_month_incomes"] = last_month_incomes
        data["last_month_bonus"] = last_month_bonus

        return JSONResponse(status_code=200, content={"success": True, "data": data})

    except Exception as e:
        print(f'error: {e}')
        return JSONResponse(status_code=500, content={"success": False, "message": "無法取得使用者儀錶板資料"})
