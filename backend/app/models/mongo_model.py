import mongoengine as me
from datetime import datetime


class BaseModel(me.Document):
    """
    欄位描述：

    Attributes:
        description (str): 備註。
        created_at (datetime): 建立時間。
        updated_at (datetime): 更新時間。
    """

    meta = {'abstract': True}  # 抽象類別, 不會建立資料庫
    description = me.StringField(default="")
    created_at = me.DateTimeField(default=datetime.utcnow)
    updated_at = me.DateTimeField(default=datetime.utcnow)

    def save(self, *args, **kwargs):
        if not self.created_at:
            self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        super().save(*args, **kwargs)


class Accounting(BaseModel):
    """
    使用者記帳資料表模型。

    Attributes:
        statistics_kind (str): 統計類型，例如：食、衣、住、行、育、樂、生活、其他。
        category (str): 花費細項類別，例如：早餐、午餐、晚餐、宵夜、零食等。

        user_name (str): 使用者名稱。
        line_user_id (str): 使用者 Line ID。

        cost_name (str): 花費名稱。
        cost_status (int): 花費狀態，代表是否為必要花費：
            - 0: 必要
            - 1: 想要
            - 2: 臨時必要
            - 3: 臨時想要

        unit (str): 金錢單位（例如: TWD, JPY)。
        cost (int): 花費金額。
        pay_method (int): 付費方式 
            - 0: 現金
            - 1: Line Pay
            - 2: 信用卡
            - 3: 銀行轉帳
            - 4: 其他
        store_name (str): 店家名稱。
        invoice_number (str): 發票號碼。
    """

    statistics_kind = me.StringField(required=True, default="其他")
    category = me.StringField(default="其他")

    user_name = me.StringField(required=True)
    line_user_id = me.StringField(default="")
    cost_name = me.StringField(required=True)
    cost_status = me.IntField(required=True)
    unit = me.StringField(required=True, default="TWD")
    cost = me.IntField(required=True)
    pay_method = me.IntField(required=True)
    store_name = me.StringField(default="")
    invoice_number = me.StringField(default="")  # 發票號碼, 之後串金流可用

    meta = {
        "indexes": [
            {
                "fields": [
                    "user_name", "line_user_id", "statistics_kind", "cost_status",
                    "category", "cost_name", "store_name", "invoice_number"
                ],
                "sparse": True
            }
        ]
    }

    def __str__(self):
        return f"{self.user_name} | {self.cost_name} -> {self.unit} {self.cost}. {self.store_name}"

    def __repr__(self):
        return f"Accounting(user_name={self.user_name}, statistics_kind={self.statistics_kind}, category={self.category}, store_name={self.store_name})"

    def to_dict(self):
        return {
            "id": self.id,
            "user_name": self.user_name,
            "statistics_kind": self.statistics_kind,
            "category": self.category,
            "cost_name": self.cost_name,
            "unit": self.unit,
            "cost": self.cost,
            "store_name": self.store_name,
            "description": self.description,
            "created_at": self.created_at,
        }


class IncomeAccounting(BaseModel):
    pass
