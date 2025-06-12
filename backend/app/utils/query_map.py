from app.schemas.accounting import FilterRow
from typing import Dict

OPERATOR_MAP = {
    "ne": "$ne",
    "lt": "$lt",
    "lte": "$lte",
    "gt": "$gt",
    "gte": "$gte",
}

_COST_STATUS_MAP = {
    "必要": 0,
    "想要": 1,
    "臨時必要": 2,
    "臨時想要": 3
}


_PAY_METHOD_MAP = {
    "現金": 0,
    "Line Pay": 1,
    "信用卡": 2,
    "銀行轉帳": 3,
    "其他": 4
}


def handle_filter_query(query: FilterRow) -> Dict[str, list | dict]:
    """
    將使用者篩選條件欄位轉換成 Mongo Query

    Args:
        query (FilterRow): FilterRow 物件
            - field: str
            - operator: str
            - value: str
            - matchMode: Optional[str] = None
            - sortOrder: Optional[str] = None

    Returns:
        Dict[str, list | dict]:
          - mongo_query: dict, 轉換成 mongo 的 query 查詢條件
          - sort_order: list, 資料排序方式
    """
    mongo_query = dict()
    sort_order = list()

    # 組合成以下查詢方式
    for column in query:
        # 判斷欄位是否一致 (初始化每個欄位條件)
        field = column.field if column.field != 'date' else 'created_at'
        operator = column.operator
        value = int(column.value) if field in [
            'cost', 'amout'] else column.value
        mode = column.matchMode

        # 處理 operator
        if operator == "eq":
            mongo_query[field] = value

        elif operator in OPERATOR_MAP.keys():
            mongo_query[field] = {OPERATOR_MAP[operator]: value}

        elif operator == "include":
            # 處理文字包含條件 與 精準/模糊查詢
            if mode == "exact":
                mongo_query[field] = value
            elif mode == "fuzzy":
                mongo_query[field] = {"$regex": value, "$options": "i"}

        elif operator == "exclude":
            # 處理文字不包含條件 與 精準/模糊查詢
            if mode == "exact":
                mongo_query[field] = {"$ne": value}
            elif mode == "fuzzy":
                mongo_query[field] = {
                    "$not": {"$regex": value, "$options": "i"}}

        # 處理排序
        if column.sortOrder:
            order = 1 if column.sortOrder == "+" else -1
            sort_field = column.field if column.field != 'date' else "created_at"
            sort_order.append((sort_field, order))

    # 處理 mapping 欄位
    if 'pay_method' in mongo_query.keys():
        mongo_query['pay_method'] = _PAY_METHOD_MAP[mongo_query["pay_method"]]

    if 'cost_status' in mongo_query.keys():
        mongo_query['cost_status'] = _COST_STATUS_MAP[mongo_query["cost_status"]]

    return {"mongo_query": mongo_query, "sort_order": sort_order}
