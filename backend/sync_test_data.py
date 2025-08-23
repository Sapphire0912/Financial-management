# from app.models.mongo_model import Accounting
# from app.databases.mongo_setting import connect_mongo

# connect_mongo()

# data = Accounting.objects(user_name="Sapphire")

# for item in data:
#     Accounting(
#         description=item.description,
#         created_at=item.created_at,
#         updated_at=item.updated_at,
#         statistics_kind=item.statistics_kind,
#         category=item.category,
#         user_name="Eric",
#         line_user_id=item.line_user_id,
#         cost_name=item.cost_name,
#         cost_status=item.cost_status,
#         unit=item.unit,
#         cost=item.cost,
#         pay_method=item.pay_method,
#         store_name=item.store_name,
#         invoice_number=item.invoice_number,
#     ).save()

# print("資料同步完成！")
