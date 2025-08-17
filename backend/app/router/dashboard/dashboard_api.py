# Fastapi
from fastapi import APIRouter, Depends, Request, Response
from fastapi.responses import JSONResponse

# Databases & Schemas
from app.schemas.dashboard import TimeInfo, DashboardMenuInfo
from app.models.mongo_model import Accounting, IncomeAccounting

from app.databases.mysql_setting import connect_mysql
from app.models.sql_model import User, UserBudgetSetting
from sqlalchemy.orm import Session
from sqlalchemy import select

# JWT
from app.utils.jwt_verification import verify_jwt_token

# cache & key builder
from fastapi_cache.decorator import cache
from app.utils.cachekey import dashboard_balance_key_builder

# Tools
from app.utils.attach_info import verify_utc_time, convert_to_utc_datetime
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
    line_user_id = payload.get("line_user_id", "")
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


# -- TODO: 以下 Route 的 DB 連線與 時間可以包裝成共用的 cache function --
@router.post("/balance/info")
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
    line_user_id = payload.get("line_user_id", "")

    # 判斷上個月狀況使用
    utc_time = convert_to_utc_datetime(
        timeInfo.user_time_data, timeInfo.timezone)
    end_time = utc_time.replace(
        day=1, hour=0, minute=0, second=0, microsecond=0)
    start_time = end_time - relativedelta(months=1)
    #

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


@router.post("/income/info")
@verify_jwt_token
async def get_user_income_information(request: Request, params: DashboardMenuInfo):
    """
    取得儀錶板收入資料 (需攜帶時間資訊驗證是否合理)

    Args:
        menu (str): 選單日期資訊

    Returns:
        data, 總餘額頁面所需的資訊
    """
    if not verify_utc_time(user_utc_time=params.current_utc_time):
        return JSONResponse(status_code=403, content={"success": False, "message": "使用者時區或使用者本地時間有誤"})

    # 使用者參數處理
    payload = request.state.payload
    user_name = payload.get("username")
    line_user_id = payload.get("line_user_id", "")
    menu: str = params.menu  # "全部" | "yyyy-mm"
    utc_time = convert_to_utc_datetime(params.user_time_data, params.timezone).replace(
        day=1, hour=0, minute=0, second=0, microsecond=0)
    #

    data = {
        "total_income": 0, "incr_percent": 0.0,
        "incr_income": 0, "total_salary": 0,
        "total_bouns": 0, "others": 0
    }

    if menu == "全部":
        # 本月份時間範圍
        current_start_time = utc_time
        current_end_time = utc_time + relativedelta(months=1)
        income_data = IncomeAccounting.objects(user_name=user_name, unit="TWD")
    else:
        # 本月份時間範圍
        current_start_time = datetime.strptime(menu, "%Y-%m")
        current_end_time = current_start_time + relativedelta(months=1)
        income_data = IncomeAccounting.objects(
            user_name=user_name, unit="TWD", created_at__gte=current_start_time, created_at__lt=current_end_time)

    # 計算全部收入, 薪資, 獎金, 其他 (含本月收入)
    current_month_income = 0
    for d in income_data:
        amount = d.amount
        if d.income_kind == "薪資":
            data["total_salary"] += amount
        elif d.income_kind == "獎金":
            data["total_bouns"] += amount
        else:
            data["others"] += amount
        data["total_income"] += amount

        if current_start_time <= d.created_at < current_end_time:
            current_month_income += amount
    #

    # 上個月份時間範圍 (計算成長率 & 成長金額)
    last_start_time = current_start_time - relativedelta(months=1)
    last_month_income = IncomeAccounting.objects(
        user_name=user_name, unit="TWD", created_at__gte=last_start_time, created_at__lt=current_start_time).sum('amount')

    data["incr_income"] = current_month_income - last_month_income
    data["incr_percent"] = round(
        data["incr_income"] * 100 / last_month_income, 2) if last_month_income > 0 else 0.0
    #

    return JSONResponse(status_code=200, content={"success": True, "data": data})


@router.post("/expense/info")
@verify_jwt_token
async def get_user_expense_information(request: Request, params: DashboardMenuInfo, sqldb: Session = Depends(connect_mysql)):
    """
    取得儀錶板支出資料 (需攜帶時間資訊驗證是否合理)

    Args:
        menu (str): 選單日期資訊

    Returns:
        data, 總餘額頁面所需的資訊
    """
    if not verify_utc_time(user_utc_time=params.current_utc_time):
        return JSONResponse(status_code=403, content={"success": False, "message": "使用者時區或使用者本地時間有誤"})

    # 使用者參數處理
    payload = request.state.payload
    user_name = payload.get("username")
    line_user_id = payload.get("line_user_id", "")
    menu: str = params.menu  # "全部" | "yyyy-mm"
    utc_time = convert_to_utc_datetime(params.user_time_data, params.timezone).replace(
        day=1, hour=0, minute=0, second=0, microsecond=0)
    #

    data = {
        "total_expense": 0, "incr_expense_percent": 0.0,
        "top_expense_kind": "", "top_expense_amout": 0,
        "is_open_budget_setting": False,
        "month_budget": 0, "budget_use_percent": 0.0
    }
    if menu == "全部":
        # 本月份時間範圍
        current_start_time = utc_time
        current_end_time = utc_time + relativedelta(months=1)
        expense_data = Accounting.objects(user_name=user_name, unit="TWD")

    else:
        # 本月份時間範圍
        current_start_time = datetime.strptime(menu, "%Y-%m")
        current_end_time = current_start_time + relativedelta(months=1)
        expense_data = Accounting.objects(
            user_name=user_name, unit="TWD", created_at__gte=current_start_time, created_at__lt=current_end_time)

    # 計算全部支出, 各類別支出 (含本月支出)
    current_month_expense = 0
    each_expense_kind = dict()

    for d in expense_data:
        statistics_kind, cost = d.statistics_kind, d.cost

        data["total_expense"] += cost
        each_expense_kind[statistics_kind] = each_expense_kind.get(
            statistics_kind, 0) + cost

        if current_start_time <= d.created_at < current_end_time:
            current_month_expense += cost

    if each_expense_kind.items():
        top_expense_item: tuple = sorted(
            each_expense_kind.items(), key=lambda item: item[1], reverse=True)[0]
        data["top_expense_kind"], data["top_expense_amout"] = top_expense_item[0], top_expense_item[1]
    else:
        data["top_expense_kind"], data["top_expense_amout"] = "", 0
    #

    # 上個月份時間範圍 (計算支出成長率)
    last_start_time = current_start_time - relativedelta(months=1)
    last_month_expense = Accounting.objects(
        user_name=user_name, unit="TWD", created_at__gte=last_start_time, created_at__lt=current_start_time).sum('cost')

    diff_expense = current_month_expense - last_month_expense
    data["incr_expense_percent"] = round(
        diff_expense * 100 / last_month_expense, 2) if last_month_expense > 0 else 0.0
    #

    # 預算設定相關
    join_sql = (
        select(
            UserBudgetSetting.is_open_plan,
            UserBudgetSetting.budget
        )
        .select_from(User)
        .join(UserBudgetSetting, User.id == UserBudgetSetting.user_id)
        .where(User.username == user_name)
    )
    result = sqldb.execute(join_sql).first()
    if result:
        is_open_plan, budget = result
    else:
        is_open_plan, budget = False, 0

    data["is_open_budget_setting"] = is_open_plan
    data["month_budget"] = budget

    if data["month_budget"] > 0:
        data["budget_use_percent"] = round(
            current_month_expense * 100 / data["month_budget"], 2)
    else:
        data["budget_use_percent"] = 0.0

    return JSONResponse(status_code=200, content={"success": True, "data": data})


@router.post("/year/statistics/info")
@verify_jwt_token
async def get_user_year_statistics_information(request: Request, params: DashboardMenuInfo):
    """
    取得儀錶板年度統計資料 (需攜帶時間資訊驗證是否合理)

    Args:
        menu (str): 選單日期資訊

    Returns:
        data, 總餘額頁面所需的資訊
    """
    if not verify_utc_time(user_utc_time=params.current_utc_time):
        return JSONResponse(status_code=403, content={"success": False, "message": "使用者時區或使用者本地時間有誤"})

    # 使用者參數處理
    payload = request.state.payload
    user_name = payload.get("username")
    line_user_id = payload.get("line_user_id")
    menu: str = params.menu  # "yyyy-mm"
    #

    start_time = datetime.strptime(menu, "%Y")
    end_time = start_time + relativedelta(years=1)

    def _get_year_data(collection: Accounting | IncomeAccounting):
        each_month_amount = [0] * 12
        datas = collection.objects(user_name=user_name, unit="TWD",
                                   created_at__lt=end_time, created_at__gte=start_time)
        for data in datas:
            month = data.created_at.month
            if hasattr(data, "amount"):
                each_month_amount[month - 1] += data.amount
            else:
                each_month_amount[month - 1] += data.cost
        return each_month_amount

    data = {
        'income': _get_year_data(IncomeAccounting),
        'expense': _get_year_data(Accounting)
    }
    return JSONResponse(status_code=200, content={"success": True, "data": data})


@router.post("/remaining/info")
@verify_jwt_token
async def get_user_remaining_information(request: Request, timeinfo: TimeInfo, sqldb: Session = Depends(connect_mysql)):
    """
    取得儀錶板剩餘區塊資訊
    (需攜帶時間驗證)

    Returns:
        data: 剩餘區塊資訊資料
            - 本月餘額
            - 預期每日支出
            - 平均每日支出
            - 支出前三類別名稱, 占比, 金額 (必要 & 想要)
    """
    if not verify_utc_time(user_utc_time=timeinfo.current_utc_time):
        return JSONResponse(status_code=403, content={"success": False, "message": "使用者時區或使用者本地時間有誤"})

    # 使用者參數處理
    payload = request.state.payload
    user_name = payload.get("username")
    line_user_id = payload.get("line_user_id", "")
    utc_time = convert_to_utc_datetime(timeinfo.user_time_data, timeinfo.timezone).replace(
        day=1, hour=0, minute=0, second=0, microsecond=0)
    #

    # 取得預算設定
    join_sql = (
        select(
            UserBudgetSetting.is_open_plan,
            UserBudgetSetting.budget
        )
        .select_from(User)
        .join(UserBudgetSetting, User.id == UserBudgetSetting.user_id)
        .where(User.username == user_name)
    )
    result = sqldb.execute(join_sql).first()
    if result:
        is_open_plan, budget = result
    else:
        is_open_plan, budget = False, 0

    # 取得本月目前支出 (預期/平均 每日支出)
    current_end_time = utc_time + relativedelta(months=1)
    total_expense = Accounting.objects(
        user_name=user_name, unit="TWD", created_at__gte=utc_time, created_at__lt=current_end_time).sum('cost')

    data = dict()
    data["reduce_budget"] = round(
        (budget - total_expense) * 100 / budget, 2) if budget > 0 else 0.0

    max_day = (current_end_time - timedelta(days=1)).day
    data["expect_expense_per_day"] = round(
        budget / max_day, 0) if budget > 0 else 0
    data["expense_per_day"] = round(total_expense / max_day, 0)

    # 取得當月支出前三高類別以及分別必要或想要的資料
    top_expense_kind = Accounting.objects.aggregate(
        {
            "$match": {
                "user_name": user_name, "unit": "TWD",
                "created_at": {
                    "$gte": utc_time,
                    "$lt": current_end_time
                }
            }
        },
        {"$group": {"_id": "$statistics_kind", "total_expense": {"$sum": "$cost"}}},
        {"$sort": {"total_expense": -1}},
        {"$limit": 3}
    )

    data["top_expense_data"] = list()
    for top_kind in top_expense_kind:
        # 必要花費
        necessary = Accounting.objects(statistics_kind=top_kind["_id"], cost_status__in=[
                                       0, 2], unit="TWD", created_at__gte=utc_time, created_at__lt=current_end_time).sum('cost')
        want = Accounting.objects(statistics_kind=top_kind["_id"], cost_status__in=[
                                  1, 3], unit="TWD", created_at__gte=utc_time, created_at__lt=current_end_time).sum("cost")

        data["top_expense_data"].append({
            "kind": top_kind["_id"],
            "total_expense": top_kind["total_expense"],
            "percent": round((necessary + want) * 100 / total_expense, 0),
            "necessary": necessary,
            "want": want
        })

    return JSONResponse(status_code=200, content={"success": True, "data": data})
