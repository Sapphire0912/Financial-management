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

# cache time
_CACHE_MEMORY_TIME = 60 * 60


router = APIRouter(prefix="/accounting/figure", tags=["accounting/figure"])


@router.get("/user_income")
@verify_jwt_token
async def get_user_income_figure(request: Request):
    # 使用者參數處理
    payload = request.state.payload
    user_name = payload.get("username", None)
    line_user_name = payload.get("line_user_name", None)
    line_user_id = payload.get("line_user_id", None)
    is_active = payload.get("is_active", False)

    # 檢查使用者登入方式
    login_method = check_user_login_method(payload)

    @cache(expire=_CACHE_MEMORY_TIME, key_builder=accounting_figure_key_builder)
    def _get_user_income_data(user_name: str, line_user_id: str = None, login_method: str = "password"):
        if login_method == "bind":
            query = IncomeAccounting.objects(
                user_name=user_name, line_user_id=line_user_id)
        elif login_method == "line":
            query = IncomeAccounting.objects(line_user_id=line_user_id)
        else:
            query = IncomeAccounting.objects(user_name=user_name)

        first_data = query.order_by("created_at").first()
        last_data = query.order_by("-created_at").first()
        return first_data, last_data

    first_data, last_data = await _get_user_income_data(user_name, line_user_id, login_method)

    return JSONResponse(status_code=200, content={"success": True, "data": {"first_data": first_data, "last_data": last_data}})
