import os
from dotenv import load_dotenv
from mongoengine import connect

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB = os.getenv("MONGO_DB")


def connect_mongo():
    connect(
        host=MONGO_URI,
        db=MONGO_DB,
        alias="default",
    )
    print("connecting mongo server successfully.")
