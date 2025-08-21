import hashlib
import json


def transaction_key_builder(func, namespace, request, *args, **kwargs):
    """
    設定交易查詢資料的快取 key，用於 fastapi-cache 快取系統。

    快取 key 結構範例：
    fastapi-cache:_get_transaction_data:IncomeAccounting:alice:fdc2ab...:73bc99...

    參數說明：
        - func: 被快取的函式本身，例如 _get_transaction_data
        - namespace: 快取命名空間（通常是 fastapi-cache）
        - request: FastAPI 的 Request 物件，可用於取登入者、路徑等
        - *args: 傳入函式的位置參數（例如 collection、user_name、start_index）
        - **kwargs: 傳入函式的命名參數（如 query dict、sort_order list）
    """

    # 將所有位置參數轉為字串，作為 key 的一部分
    key_parts = [str(a) for a in args]

    # 對 query dict 參數進行 JSON 序列化（排序鍵避免 key 不穩），再做 md5 hash，確保 key 長度簡短且唯一
    if "query" in kwargs:
        q_str = json.dumps(kwargs["query"], sort_keys=True)
        key_parts.append(hashlib.md5(q_str.encode()).hexdigest())

    # 對 sort_order list 也進行序列化與 hash，避免資料過長或順序變動導致快取命中錯誤
    if "sort_order" in kwargs:
        s_str = json.dumps(kwargs["sort_order"])
        key_parts.append(hashlib.md5(s_str.encode()).hexdigest())

    # 將命名空間、函式名稱與參數片段組成完整 Redis 快取 key
    return f"{namespace}:{func.__name__}:{':'.join(key_parts)}"


def dashboard_balance_key_builder(func, namespace, request, *args, **kwargs):
    """
    設定'儀錶板總餘額'的快取 key
    """
    key_parts = [str(a) for a in args]
    return f"{namespace}:{func.__name__}:{','.join(key_parts)}"


def accounting_figure_key_builder(func, namespace, request, *args, **kwargs):
    """
    設定'記帳圖表'的快取 key
    """
    key_parts = [str(a) for a in args]
    return f"{namespace}:{func.__name__}:{','.join(key_parts)}"
