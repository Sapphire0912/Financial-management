import mongoengine as me
from datetime import datetime


class BaseModel(me.Document):
    """
      欄位名稱:
      description: 備註
      created_at: 建立時間
      updated_at: 更新時間
    """
    meta = {'abstract': True}  # 抽象類別, 不會建立資料庫
    description = me.StringField(default="")
    created_at = me.DateTimeField(default=datetime.now)
    updated_at = me.DateTimeField(default=datetime.now)

    def save(self, *args, **kwargs):
        if not self.created_at:
            self.created_at = datetime.now()
        self.updated_at = datetime.now()
        super().save(*args, **kwargs)


class Accounting(BaseModel):
    """
      使用者記帳資料庫
        statistics_kind: 統計類型, 食, 衣, 住, 行, 育, 樂, 生活, 其他等
        category: 花費細項類別 (例如: 食 -> 早餐, 午餐, 晚餐, 宵夜, 零食等)

        user_name: 使用者名稱
        user_id: 使用者ID
        cost_name: 花費名稱
        unit: 單位
        cost: 花費金額
        store_name: 店家名稱
    """
    statistics_kind = me.StringField(required=True, default="其他")
    category = me.StringField(default="其他")

    user_name = me.StringField(required=True)
    user_id = me.StringField(required=True)
    cost_name = me.StringField(required=True)
    unit = me.StringField(required=True, default="TWD")
    cost = me.IntField(required=True)
    store_name = me.StringField(default="")
    # invoice_number = me.StringField(default="")  # 發票號碼, 之後串金流可用

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
