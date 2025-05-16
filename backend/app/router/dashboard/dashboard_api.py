# Fastapi
from fastapi import APIRouter, Depends, Request, Response
from fastapi.responses import JSONResponse

# Databases

# JWT
from app.utils.jwt_verification import verify_jwt_token

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.post("/")
@verify_jwt_token
async def get_user_data(request: Request):
    payload = request.state.payload
    return JSONResponse(status_code=200, content={"success": True, "data": payload})
