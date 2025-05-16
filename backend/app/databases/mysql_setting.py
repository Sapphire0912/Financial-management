import os
import time
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

load_dotenv()

MYSQL_URI = os.getenv("MYSQL_URI")
MAX_RETRIES = 10  # mysql 重新連線次數

for i in range(MAX_RETRIES):
    try:
        engine = create_engine(MYSQL_URI, pool_pre_ping=True)
        SessionLocal = sessionmaker(
            autocommit=False, autoflush=False, bind=engine)
        break
    except Exception as e:
        time.sleep(1)
else:
    raise ConnectionError("無法連線到 Mysql, 請確認資料庫服務狀態")


def connect_mysql() -> Session:
    mysql = SessionLocal()
    try:
        print("connecting mysql server successfully.")
        yield mysql  # <sqlalchemy.orm.session.Session>
    finally:
        mysql.close()
