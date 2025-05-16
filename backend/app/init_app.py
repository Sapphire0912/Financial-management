# FastAPI
from fastapi import FastAPI
from fastapi import Request
from fastapi.responses import JSONResponse

# CORS
from fastapi.middleware.cors import CORSMiddleware

# database setting
from app.databases.mongo_setting import connect_mongo
from app.databases.mysql_setting import engine
from app.models.sql_model import Base

# router setting
from app.router.accounting import users_accounting
from app.router.login import auth
from app.router.dashboard import dashboard_api

# error handling
from app.utils.error_handle import AuthorizationError
from app.tasks.tasks import jwt_exception_log


def init_app() -> FastAPI:
    app = FastAPI()

    origins = [
        "http://localhost:5173"
    ]

    # 設定 CORS 問題
    app.add_middleware(
        CORSMiddleware,
        # 不能用 "*" 和 allow_credentials 同時存在 (未來部屬時要改成 domain)
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],  # 僅允許 get 和 post 請求
        allow_headers=["*"],
    )

    @app.on_event("startup")
    def startup():
        connect_mongo()
        Base.metadata.create_all(bind=engine)

    @app.get("/")
    def root():
        return {"message": "Hello from FastAPI in Docker!"}

    @app.exception_handler(AuthorizationError)
    async def authorization_exception_handler(request: Request, exc: AuthorizationError):
        jwt_exception_log.delay(exc.client_ip, exc.user_agent, exc.token)
        return JSONResponse(status_code=401, content={"message": "Unauthorized"})

    app.include_router(auth.router, prefix="/app")
    app.include_router(dashboard_api.router, prefix="/app")
    app.include_router(users_accounting.router, prefix="/app")

    return app
