from fastapi import APIRouter, Query
from app.models.mongo_model import Accounting
from app.schemas.accounting import AccountingCreate, AccountingUpdate, AccountingDelete
from fastapi.responses import JSONResponse
from datetime import date, datetime
from bson import ObjectId

# tags 是在 swagger UI 中的分區名稱資料
router = APIRouter(prefix="/users_accounting", tags=["users_accounting"])


@router.get("/search")
async def create_users_accounting(
    user_name: str = Query(..., description="使用者名稱"),
    user_id: str = Query(..., description="使用者ID"),
    statistics_kind: str = Query(None, description="統計類型"),
    category: str = Query(None, description="類別"),
    start_date: date = Query(..., description="開始日期"),
    end_date: date = Query(..., description="結束日期"),
    store_name: str = Query(None, description="店家名稱"),
):
    """
      :router 取得使用者查詢的記帳資料
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


@router.post("/create")
async def create_users_accounting(data: AccountingCreate):
    """
      :router 新增使用者記帳資料
    """
    record = Accounting(**data.dict())
    record.save()
    return JSONResponse(status_code=200, content={"success": True, "message": "Accounting created successfully"})


@router.post("/update")
async def update_users_accounting(data: AccountingUpdate):
    """
      :router 更新使用者記帳資料
    """
    try:
        record = Accounting.objects.get(id=ObjectId(data.id))
        update_fields = {
            k: v for k, v in data.dict().items() if k != 'id' and v is not None
        }
        record.update(**{f"set__{k}": v for k, v in update_fields.items()})
    except Accounting.DoesNotExist:
        return JSONResponse(status_code=404, content={"success": False, "message": "Data not found"})
    except Exception as e:
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
