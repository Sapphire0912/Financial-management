import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

load_dotenv()


MYSQL_URI = os.getenv("MYSQL_URI")

engine = create_engine(MYSQL_URI)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def connect_mysql() -> Session:
    mysql = SessionLocal()
    try:
        print("connecting mysql server successfully.")
        yield mysql  # <sqlalchemy.orm.session.Session>
    finally:
        mysql.close()
