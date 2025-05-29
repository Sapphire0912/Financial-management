# fastApi
from fastapi import APIRouter, Query, Request, Response
from fastapi.responses import JSONResponse

# Databases
from app.models.mongo_model import Accounting, IncomeAccounting
from app.schemas.accounting import AccountingCreate, AccountingUpdate, AccountingDelete, IncomeCreate, IncomeUpdate, IncomeDelete

# JWT
from app.utils.jwt_verification import verify_jwt_token

# Tools
from app.utils.attach_info import verify_utc_time, convert_to_utc_time
from datetime import date, datetime
from bson import ObjectId

# tags 是在 swagger UI 中的分區名稱資料
router = APIRouter(prefix="/accounting", tags=["accounting"])


@router.get("/transaction/history")
@verify_jwt_token
async def get_transaction_history(request: Request, oper: str):
    """
      :router 記帳紀錄

      Args:
          oper (str): 0 代表記帳支出歷史, 1 代表記帳收入歷史
    """
    try:
        if oper == "0":
            transaction_data = Accounting.objects(
                user_name=request.state.payload['username']).order_by('-created_at')

            response_data = [data.to_api_format() for data in transaction_data]
            return JSONResponse(status_code=200, content={"success": True, "data": response_data})

        elif oper == "1":
            transaction_data = IncomeAccounting.objects(
                user_name=request.state.payload['username']).order_by('-created_at')

            response_data = [data.to_api_format() for data in transaction_data]
            return JSONResponse(status_code=200, content={"success": True, "data": response_data})
        else:
            return JSONResponse(status_code=404, content={"success": True, "message": "找不到相應的頁面"})

    except Exception as e:
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
      :router 更新使用者記帳支出資料
    """
    if not verify_utc_time(user_utc_time=data.current_utc_time):
        return JSONResponse(status_code=403, content={"success": False, "message": "使用者時區或使用者本地時間有誤"})

    try:
        # 先限定只有本人可以更新資料
        record = Accounting.objects.get(id=ObjectId(
            data.id), user_name=data.user_name)
        utc_time = convert_to_utc_time(data.user_time_data, data.timezone)

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
            data.id), user_name=data.user_name, line_user_id=data.user_id).first()
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
        utc_time = convert_to_utc_time(data.user_time_data, data.timezone)

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
        utc_time = convert_to_utc_time(data.user_time_data, data.timezone)

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
            # "updated_at": utc_time
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
            data.id), user_name=data.user_name, line_user_id=data.user_id).first()
        if record:
            record.delete()
        else:
            return JSONResponse(status_code=404, content={"success": False, "message": "找不到對應的刪除資料或是非使用者本人操作"})

    except IncomeAccounting.DoesNotExist:
        return JSONResponse(status_code=404, content={"success": False, "message": "Data not found"})
    return JSONResponse(status_code=200, content={"success": True, "message": "Accounting deleted successfully"})
# - 記帳收入相關操作 End. -
