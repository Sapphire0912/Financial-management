import os
import redis
from dotenv import load_dotenv

load_dotenv()

REDIS_URI = os.environ.get("REDIS_URI")
DEFAULT_DB = 0


def connect_redis(redis_db: int = DEFAULT_DB) -> redis.Redis:
    try:
        # decode_responses 讓回傳值是 string
        uri = f'{REDIS_URI}/{redis_db}'
        pool = redis.ConnectionPool.from_url(uri, decode_responses=True)
        r = redis.Redis(connection_pool=pool)
        r.ping()
        print(f'connecting redis server successfully db:{redis_db}')

        return r

    except redis.exceptions.ConnectionError as e:
        print(f'Redis 連線失敗, {e}')
        return e
