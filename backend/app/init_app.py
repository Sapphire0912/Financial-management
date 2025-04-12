from fastapi import FastAPI
from app.databases.mongo_setting import connect_mongo
from app.databases.mysql_setting import engine
from app.models.sql_model import Base
from app.router import users_accounting


def init_app() -> FastAPI:
    app = FastAPI()

    @app.on_event("startup")
    def startup():
        connect_mongo()
        Base.metadata.create_all(bind=engine)

    @app.get("/")
    def root():
        return {"message": "Hello from FastAPI in Docker!"}

    app.include_router(users_accounting.router, prefix="/app")
    return app
