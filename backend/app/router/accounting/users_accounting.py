# fastApi
from fastapi import APIRouter, Query, Request, Response
from fastapi.responses import JSONResponse

# Databases
from app.models.mongo_model import Accounting
from app.schemas.accounting import AccountingCreate, AccountingUpdate, AccountingDelete

# JWT
from app.utils.jwt_verification import verify_jwt_token

# Tools
from app.utils.attach_info import verify_utc_time, convert_to_utc_time
from datetime import date, datetime
from bson import ObjectId

# tags 是在 swagger UI 中的分區名稱資料
router = APIRouter(prefix="/accounting", tags=["accounting"])


@router.get("/search")
async def query_users_accounting(
    user_name: str = Query(..., description="使用者名稱"),
    user_id: str = Query(..., description="使用者ID"),
    statistics_kind: str = Query(None, description="統計類型"),
    category: str = Query(None, description="類別"),
    start_date: date = Query(..., description="開始日期"),
    end_date: date = Query(..., description="結束日期"),
    store_name: str = Query(None, description="店家名稱"),
):
    """
      :router 取得使用者查詢的記帳資料 (棄用, 在交易歷史處新增)
    """
    start_dt = datetime.combine(start_date, datetime.min.time())
    end_dt = datetime.combine(end_date, datetime.max.time())

    if not user_name or not user_id or not start_date or not end_date:
        return JSONResponse(status_code=400, content={"success": False, "message": "Missing required parameters"})

    query = {"user_name": user_name, "user_id": user_id,
             "created_at": {"$gte": start_dt, "$lte": end_dt}}

    if statistics_kind:
        query["statistics_kind"] = statistics_kind
    if category:
        query["category"] = category
    if store_name:
        query["store_name"] = store_name

    accounting_data = Accounting.objects(**query)
    data = [accounting.to_dict() for accounting in accounting_data]

    return JSONResponse(
        status_code=200,
        content={
            "success": True,
            "data": data,
            "total": len(data)
        }
    )


@router.get("/transaction/history")
@verify_jwt_token
async def get_transaction_history(request: Request):
    """
      :router 記帳紀錄
    """
    try:
        transaction_data = Accounting.objects(
            user_name=request.state.payload['username']).order_by('-created_at')

        response_data = [data.to_api_format() for data in transaction_data]
        return JSONResponse(status_code=200, content={"success": True, "data": response_data})

    except Exception as e:
        return JSONResponse(status_code=500, content={"success": False, "message": "無法取得使用者交易紀錄"})


# 記帳相關操作
@router.post("/create")
@verify_jwt_token
async def create_users_accounting(request: Request, data: AccountingCreate):
    """
      :router 新增使用者記帳資料
    """
    if not verify_utc_time(user_utc_time=data.current_utc_time):
        return JSONResponse(status_code=403, content={"success": False, "message": "使用者時區或使用者本地時間有誤"})

    try:
        utc_time = convert_to_utc_time(data.user_time_data, data.timezone)

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
      :router 更新使用者記帳資料
    """
    if not verify_utc_time(user_utc_time=data.current_utc_time):
        return JSONResponse(status_code=403, content={"success": False, "message": "使用者時區或使用者本地時間有誤"})

    try:
        record = Accounting.objects.get(id=ObjectId(data.id))
        utc_time = convert_to_utc_time(data.user_time_data, data.timezone)

        update_fields = {
            "statistics_kind": data.statistics_kind,
            "category": data.category,
            "user_name": data.user_name,
            "line_user_id": data.user_id,
            "cost_name": data.cost_name,
            "cost_status": data.cost_status,
            "unit": data.unit,
            "cost": data.cost,
            "pay_method": data.pay_method,
            "store_name": data.store_name,
            "invoice_number": data.invoice_number,
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
async def delete_users_accounting(data: AccountingDelete):
    """
      :router 刪除使用者記帳資料
    """
    try:
        record = Accounting.objects.get(id=ObjectId(data.id))
        record.delete()
    except Accounting.DoesNotExist:
        return JSONResponse(status_code=404, content={"success": False, "message": "Data not found"})
    return JSONResponse(status_code=200, content={"success": True, "message": "Accounting deleted successfully"})
