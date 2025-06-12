from collections import defaultdict
from typing import Dict, Any
from datetime import datetime, timedelta
from app.schemas.accounting import FilterRow

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


def handle_filter_query(query: list[FilterRow]) -> Dict[str, Any]:
    mongo_query = defaultdict(dict)
    sort_order = []
    eq_accumulator = defaultdict(list)  # 收集同一欄位多個 eq 值
    isDefaultOrder = True

    for column in query:
        field = column.field if column.field != 'date' else 'created_at'
        operator = column.operator
        mode = column.matchMode

        # 處理 value datatype
        if field in ['cost', 'amount']:
            value = int(column.value)
        elif field == "created_at":
            value = datetime.strptime(column.value, "%Y-%m-%d")
        else:
            value = column.value

        # 合併特殊欄位的 range 條件
        if field in ['cost', 'amount', 'created_at'] and operator in OPERATOR_MAP:
            mongo_query[field][OPERATOR_MAP[operator]] = value

        # 收集多個 eq 變成 $in
        elif operator == "eq":
            if field == "created_at":
                # 日期等於 → 處理為當日範圍查詢
                start = value
                end = value + timedelta(days=1)
                mongo_query[field]["$gte"] = start
                mongo_query[field]["$lt"] = end
            else:
                eq_accumulator[field].append(value)

        elif operator in OPERATOR_MAP:
            mongo_query[field] = {OPERATOR_MAP[operator]: value}

        elif operator == "include":
            if mode == "exact":
                eq_accumulator[field].append(value)
            elif mode == "fuzzy":
                mongo_query[field] = {"$regex": value, "$options": "i"}

        elif operator == "exclude":
            if mode == "exact":
                mongo_query[field] = {"$ne": value}
            elif mode == "fuzzy":
                mongo_query[field] = {
                    "$not": {"$regex": value, "$options": "i"}}

        # 排序
        if column.sortOrder:
            isDefaultOrder = False
            order = 1 if column.sortOrder == "+" else -1
            sort_order.append((field, order))

    # 合併 eq 為 $in 或單值
    for field, values in eq_accumulator.items():
        mongo_query[field] = {"$in": values} if len(values) > 1 else values[0]

    # Mapping 欄位處理
    for field, mapping in [("pay_method", _PAY_METHOD_MAP), ("cost_status", _COST_STATUS_MAP)]:
        if field in mongo_query:
            val = mongo_query[field]
            if isinstance(val, dict) and "$in" in val:
                val["$in"] = [mapping.get(v, v) for v in val["$in"]]
            elif isinstance(val, list):
                mongo_query[field] = {"$in": [mapping.get(v, v) for v in val]}
            else:
                mongo_query[field] = mapping.get(val, val)

    if isDefaultOrder and ("created_at", -1) not in sort_order:
        sort_order.append(("created_at", -1))

    return {
        "mongo_query": dict(mongo_query),
        "sort_order": sort_order
    }
