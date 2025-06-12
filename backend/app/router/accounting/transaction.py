# fastApi
from fastapi import APIRouter, Request, Response
from fastapi.responses import JSONResponse

# Databases
from app.models.mongo_model import Accounting, IncomeAccounting
from app.schemas.accounting import FilterRequest

# JWT
from app.utils.jwt_verification import verify_jwt_token

# cache & key builder
from fastapi_cache.decorator import cache
from app.utils.cachekey import transaction_key_builder

# Tools
from app.utils.attach_info import verify_utc_time, convert_to_utc_time
from app.utils.query_map import handle_filter_query
from datetime import date, datetime
from bson import ObjectId
from typing import Tuple, Dict, List, Any

# tags 是在 swagger UI 中的分區名稱資料
router = APIRouter(prefix="/transaction", tags=["transaction"])


_CACHE_MEMORY_TIME = 300  # 快取 function 到記憶體的時間, 單位秒


@router.post("/history")
@verify_jwt_token
async def get_transaction_history(request: Request, query: FilterRequest):
    """
      :router 記帳紀錄

      註: 每一頁回傳 12 筆資料
    """
    # 參數處理
    per_page = query.per_page
    end_index = query.page * per_page
    start_index = end_index - per_page if end_index >= per_page else 0
    convert_query = handle_filter_query(query=query.filters)
    query_conditions, sort_order = convert_query["mongo_query"], convert_query["sort_order"]
    #
    print(query_conditions)
    print(sort_order)

    @cache(expire=_CACHE_MEMORY_TIME, key_builder=transaction_key_builder)
    def _get_transaction_data(
        collection: Accounting | IncomeAccounting,
        user_name: str,
        query: Dict[str, Any],
        sort_order: List[Tuple[str, int]],
        start_index: int,
        end_index: int
    ):
        """
        取得記帳資料

        Returns:
            response_data: 記帳資料
            max_page, 最大頁數
        """
        # 採用 aggregate 查詢
        pipeline = [
            {"$match": {"user_name": user_name, **query}},
        ]
        if sort_order:
            for field, order in sort_order:
                pipeline.append({"$sort": {field: order}})
        #

        transaction_data = list(collection.objects.aggregate(*pipeline))
        max_page = (len(transaction_data) + per_page - 1) // per_page

        if collection.__name__ == "Accounting":
            response_data = [
                {
                    "id": str(data["_id"]),
                    "user_name": data["user_name"],
                    "statistics_kind": data["statistics_kind"],
                    "category": data["category"],
                    "store_name": data["store_name"],
                    "cost_name": data["cost_name"],
                    "cost": data["cost"],
                    "unit": data["unit"],
                    "pay_method": data["pay_method"],
                    "cost_status": data["cost_status"],
                    "description": data["description"],
                    "created_at": data["created_at"].strftime("%Y-%m-%d %H:%M:%S"),
                } for data in transaction_data[start_index:end_index]
            ]
        else:
            response_data = [
                {
                    "id": str(data["_id"]),
                    "user_name": data["user_name"],
                    "income_kind": data["income_kind"],
                    "category": data["category"],
                    "amount": data["amount"],
                    "unit": data["unit"],
                    "payer": data["payer"],
                    "pay_account": data["pay_account"],
                    "description": data["description"],
                    "created_at": data["created_at"].strftime("%Y-%m-%d %H:%M:%S"),
                } for data in transaction_data[start_index:end_index]
            ]

        return response_data, max_page

    try:
        oper = query.oper
        if oper in "01":
            response_data, max_page = await _get_transaction_data(
                Accounting if oper == "0" else IncomeAccounting,
                request.state.payload['username'],
                query_conditions,
                sort_order,
                start_index,
                end_index
            )
            return JSONResponse(status_code=200, content={"success": True, "data": response_data, "max_page": max_page})

        else:
            return JSONResponse(status_code=404, content={"success": True, "message": "找不到相應的頁面"})

    except Exception as e:
        print(f'error: {e}')
        return JSONResponse(status_code=500, content={"success": False, "message": "無法取得使用者交易紀錄"})


@router.get("/new/record")
@verify_jwt_token
async def get_new_record(request: Request):
    """
    取得使用者距離上次瀏覽交易紀錄頁面時, 新增了幾筆紀錄
    """
    pass


@router.put("/last_browser_time")
@verify_jwt_token
async def update_last_browser_time(request: Request):
    """
    紀錄使用者瀏覽交易紀錄頁面的時間
    """
    pass
