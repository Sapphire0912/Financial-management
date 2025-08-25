# fastApi
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

# Databases & Schemas
from app.models.mongo_model import Accounting, IncomeAccounting

# JWT
from app.utils.jwt_verification import verify_jwt_token

# cache & key builder
from fastapi_cache.decorator import cache
from app.utils.cachekey import accounting_figure_key_builder

# Tools
from app.utils.attach_info import verify_utc_time, convert_to_utc_datetime, check_user_login_method
from app.utils.query_map import handle_filter_query
from datetime import datetime
from dateutil.relativedelta import relativedelta

# cache time
_CACHE_MEMORY_TIME = 60 * 60


router = APIRouter(prefix="/accounting/figure", tags=["accounting/figure"])


@router.get("/user_income")
@verify_jwt_token
async def get_user_income_figure(request: Request):
    # 使用者參數處理
    payload = request.state.payload
    user_name = payload.get("username", None)
    line_user_id = payload.get("line_user_id", None)

    # 檢查使用者登入方式
    login_method = check_user_login_method(payload)

    @cache(expire=_CACHE_MEMORY_TIME, key_builder=accounting_figure_key_builder)
    def _get_user_income_data(user_name: str, line_user_id: str = None, login_method: str = "password"):
        """取得使用者本月份的詳細收入資料"""

        res_data = {'labels': [], 'values': []}
        if login_method == "bind":
            query = IncomeAccounting.objects(
                user_name=user_name, line_user_id=line_user_id)
        elif login_method == "line":
            query = IncomeAccounting.objects(line_user_id=line_user_id)
        else:
            query = IncomeAccounting.objects(user_name=user_name)

        query_data = query.aggregate(
            {"$match": {"unit": "TWD", "created_at": {"$gte": current_start_date,
                                                      "$lt": current_end_date}}},
            {"$group": {"_id": "$income_kind", "total_income": {"$sum": "$amount"}}},
            {"$sort": {"_id": 1}}
        )

        for data in query_data:
            res_data['labels'].append(data['_id'])
            res_data['values'].append(data['total_income'])
        return res_data

    data = await _get_user_income_data(user_name, line_user_id, login_method)

    return JSONResponse(status_code=200, content={"success": True, "data": data})


@router.get("/user_expense")
@verify_jwt_token
async def get_user_expense_figure(request: Request):
    # 使用者參數處理
    payload = request.state.payload
    user_name = payload.get("username", None)
    line_user_id = payload.get("line_user_id", None)

    # 檢查使用者登入方式
    login_method = check_user_login_method(payload)

    @cache(expire=_CACHE_MEMORY_TIME, key_builder=accounting_figure_key_builder)
    def _get_user_expense_data(user_name: str, line_user_id: str = None, login_method: str = "password"):
        """取得使用者本月份的詳細支出資料"""
        res_data = {'labels': [], 'values': []}

        if login_method == "bind":
            query = Accounting.objects(
                user_name=user_name, line_user_id=line_user_id)
        elif login_method == "line":
            query = Accounting.objects(line_user_id=line_user_id)
        else:
            query = Accounting.objects(user_name=user_name)

        current_start_date = datetime.utcnow().replace(
            day=1, hour=0, minute=0, second=0, microsecond=0)
        current_end_date = current_start_date + relativedelta(months=1)

        query_data = query.aggregate(
            {"$match": {"unit": "TWD", "created_at": {"$gte": current_start_date,
                                                      "$lt": current_end_date}}},
            {"$group": {"_id": "$statistics_kind", "total_expense": {"$sum": "$cost"}}},
            {"$sort": {"_id": 1}}
        )

        for data in query_data:
            res_data['labels'].append(data['_id'])
            res_data['values'].append(data['total_expense'])
        return res_data

    data = await _get_user_expense_data(user_name, line_user_id, login_method)

    return JSONResponse(status_code=200, content={"success": True, "data": data})
