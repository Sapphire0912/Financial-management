# fastApi
from fastapi import APIRouter, Query, Request, Response
from fastapi.responses import JSONResponse

# Databases & Schemas
from app.models.mongo_model import Accounting, IncomeAccounting
from app.schemas.accounting import AccountingCreate, AccountingUpdate, AccountingDelete, IncomeCreate, IncomeUpdate, IncomeDelete, FilterRequest

# JWT
from app.utils.jwt_verification import verify_jwt_token

# cache & key builder
from fastapi_cache.decorator import cache
from app.utils.cachekey import transaction_key_builder

# Tools
from app.utils.attach_info import verify_utc_time, convert_to_utc_datetime
from app.utils.query_map import handle_filter_query
from datetime import date, datetime
from bson import ObjectId
from typing import Tuple, Dict, List, Any

# tags 是在 swagger UI 中的分區名稱資料
router = APIRouter(prefix="/accounting", tags=["accounting"])


_CACHE_MEMORY_TIME = 300  # 快取 function 到記憶體的時間, 單位秒


@router.post("/transaction/history")
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


# - 記帳支出相關操作 -
@router.post("/create")
@verify_jwt_token
async def create_users_accounting(request: Request, data: AccountingCreate):
    """
      :router 新增使用者記帳支出資料
    """
    if not verify_utc_time(user_utc_time=data.current_utc_time):
        return JSONResponse(status_code=403, content={"success": False, "message": "使用者時區或使用者本地時間有誤"})

    try:
        utc_time = convert_to_utc_datetime(data.user_time_data, data.timezone)

        # 以後可以做序列化的方式處理
        record = Accounting(
            statistics_kind=data.statistics_kind,
            category=data.category,
            user_name=data.user_name,
            line_user_id=data.user_id,
            cost_name=data.cost_name,
            cost_status=data.cost_status,
            unit=data.unit,
            cost=data.cost,
            pay_method=data.pay_method,
            store_name=data.store_name,
            invoice_number=data.invoice_number,
            description=data.description,
            created_at=utc_time,
            updated_at=utc_time
        )

        record.save()
        return JSONResponse(status_code=201, content={"success": True, "message": "新增資料成功"})

    except Exception as e:
        print(f'error: {e}')
        return JSONResponse(status_code=403, content={"success": False, "message": "使用者資料缺少必填欄位"})


@router.post("/update")
@verify_jwt_token
async def update_users_accounting(request: Request, data: AccountingUpdate):
    """
      :router 更新使用者記帳支出資料
    """
    if not verify_utc_time(user_utc_time=data.current_utc_time):
        return JSONResponse(status_code=403, content={"success": False, "message": "使用者時區或使用者本地時間有誤"})

    try:
        # 先限定只有本人可以更新資料
        record = Accounting.objects.get(id=ObjectId(
            data.id), user_name=data.user_name)
        utc_time = convert_to_utc_datetime(data.user_time_data, data.timezone)

        update_fields = {
            "statistics_kind": data.statistics_kind,
            "category": data.category,
            "user_name": data.user_name,
            # "line_user_id": data.user_id,
            "cost_name": data.cost_name,
            "cost_status": data.cost_status,
            "unit": data.unit,
            "cost": data.cost,
            "pay_method": data.pay_method,
            "store_name": data.store_name,
            "invoice_number": data.invoice_number,
            "description": data.description,
            "created_at": utc_time
        }
        record.update(**{f"set__{k}": v for k, v in update_fields.items()})

    except Accounting.DoesNotExist:
        return JSONResponse(status_code=404, content={"success": False, "message": "Data not found"})
    except Exception as e:
        print(f'error: {e}')
        return JSONResponse(status_code=500, content={"success": False, "message": str(e)})

    return JSONResponse(status_code=200, content={"success": True, "message": "Accounting updated successfully"})


@router.post("/delete")
@verify_jwt_token
async def delete_users_accounting(request: Request, data: AccountingDelete):
    """
      :router 刪除使用者記帳支出資料
    """

    if not verify_utc_time(user_utc_time=data.current_utc_time):
        return JSONResponse(status_code=403, content={"success": False, "message": "使用者時區或使用者本地時間有誤"})

    try:
        # 先判斷只有使用者本人才可以做刪除操作
        record = Accounting.objects(id=ObjectId(
            data.id), user_name=data.user_name).first()
        if record:
            record.delete()
        else:
            return JSONResponse(status_code=404, content={"success": False, "message": "找不到對應的刪除資料或是非使用者本人操作"})

    except Accounting.DoesNotExist:
        return JSONResponse(status_code=404, content={"success": False, "message": "Data not found"})
    return JSONResponse(status_code=200, content={"success": True, "message": "Accounting deleted successfully"})
# - 記帳支出相關操作 End. -


# - 記帳收入相關操作 -
@router.post("/create/income")
@verify_jwt_token
async def create_income_accounting(request: Request, data: IncomeCreate):
    """
      :router 新增使用者記帳收入資料
    """
    if not verify_utc_time(user_utc_time=data.current_utc_time):
        return JSONResponse(status_code=403, content={"success": False, "message": "使用者時區或使用者本地時間有誤"})
    try:
        utc_time = convert_to_utc_datetime(data.user_time_data, data.timezone)

        # 以後可以做序列化的方式處理
        record = IncomeAccounting(
            income_kind=data.income_kind,
            category=data.category,
            user_name=data.user_name,
            line_user_id=data.user_id,
            unit=data.unit,
            amount=data.amount,
            payer=data.payer,
            pay_account=data.pay_account,
            description=data.description,
            created_at=utc_time,
            updated_at=utc_time
        )

        record.save()
        return JSONResponse(status_code=201, content={"success": True, "message": "新增資料成功"})

    except Exception as e:
        print(f'error: {e}')
        return JSONResponse(status_code=403, content={"success": False, "message": "使用者資料缺少必填欄位"})


@router.post("/update/income")
@verify_jwt_token
async def update_income_accounting(request: Request, data: IncomeUpdate):
    """
      :router 更新使用者記帳收入資料
    """

    if not verify_utc_time(user_utc_time=data.current_utc_time):
        return JSONResponse(status_code=403, content={"success": False, "message": "使用者時區或使用者本地時間有誤"})

    try:
        # 先限定只有本人可以更新資料
        record = IncomeAccounting.objects.get(id=ObjectId(
            data.id), user_name=data.user_name)
        utc_time = convert_to_utc_datetime(data.user_time_data, data.timezone)

        update_fields = {
            "income_kind": data.income_kind,
            "category": data.category,
            "user_name": data.user_name,
            # "line_user_id": data.user_id,
            "unit": data.unit,
            "amount": data.amount,
            "payer": data.payer,
            "pay_account": data.pay_account,
            "description": data.description,
            "created_at": utc_time,
        }
        record.update(**{f"set__{k}": v for k, v in update_fields.items()})

    except IncomeAccounting.DoesNotExist as e:
        print(e)
        return JSONResponse(status_code=404, content={"success": False, "message": "找不到相關資料"})

    except Exception as e:
        print(f'error: {e}')
        return JSONResponse(status_code=500, content={"success": False, "message": str(e)})
    return JSONResponse(status_code=200, content={"success": True, "message": "Income Accounting updated successfully"})


@router.post("/delete/income")
@verify_jwt_token
async def delete_income_accounting(request: Request, data: IncomeDelete):
    """
      :router 刪除使用者記帳收入資料
    """
    if not verify_utc_time(user_utc_time=data.current_utc_time):
        return JSONResponse(status_code=403, content={"success": False, "message": "使用者時區或使用者本地時間有誤"})

    try:
        # 先判斷只有使用者本人才可以做刪除操作
        record = IncomeAccounting.objects(id=ObjectId(
            data.id), user_name=data.user_name).first()
        if record:
            record.delete()
        else:
            return JSONResponse(status_code=404, content={"success": False, "message": "找不到對應的刪除資料或是非使用者本人操作"})

    except IncomeAccounting.DoesNotExist:
        return JSONResponse(status_code=404, content={"success": False, "message": "Data not found"})
    return JSONResponse(status_code=200, content={"success": True, "message": "Accounting deleted successfully"})
# - 記帳收入相關操作 End. -
