from flask import Flask, render_template, request, g, redirect
import sqlite3
import requests
import math

app = Flask(__name__)
database = 'datafile.db'


def get_db():
    if not hasattr(g, 'sqlite_db'):
        g.sqlite_db = sqlite3.connect(database)
    return g.sqlite_db


@app.teardown_appcontext
def close_connection(exception):
    print("正在關閉 SQL connection...")
    if hasattr(g, 'sqlite_db'):
        g.sqlite_db.close()


@app.route('/')
def home():
    # 取得資料庫資料
    conn = get_db()
    cursor = conn.cursor()
    result = cursor.execute("""SELECT * FROM cash""")
    cash_result = result.fetchall()

    # 計算台幣與美金的總額
    tw_dollars = 0
    us_dollars = 0
    for data in cash_result:
        tw_dollars += data[1]
        us_dollars += data[2]

    # 取得即時匯率資訊 (全球匯率資訊 API)
    r = requests.get('https://tw.rter.info/capi.php')
    currency = r.json()
    USD_to_TWD_rate = currency['USDTWD']['Exrate']

    # 計算總共現金
    total_dollars = math.floor(tw_dollars + us_dollars * USD_to_TWD_rate)

    # 傳送至前端的物件資訊
    datas = {
        'total': total_dollars,
        'rate': USD_to_TWD_rate,
        'USD': us_dollars,
        'TWD': tw_dollars,
        'cash_result': cash_result
    }

    return render_template('index.html', data=datas)


@app.route('/cash')
def cash_form():
    return render_template('cash.html')


@app.route('/cash', methods=['POST'])
def submit_cash():
    # request.values 的資料結構 CombinedMultiDict
    # 要抓取前端的資料，需要使用 key 來取得 (key = html input 的 name)
    # print('台幣:', request.values["tw-dollars"])
    # print('美金:', request.values["us-dollars"])
    # print('備註:', request.values["note"])
    # print('日期:', request.values["date"])

    # 取得 request 資料
    tw_dollars = request.values["tw-dollars"] if request.values["tw-dollars"] != '' else 0
    us_dollars = request.values["us-dollars"] if request.values["us-dollars"] != '' else 0
    note = request.values["note"]
    date = request.values["date"]

    # 更新 db data
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """INSERT into cash (tw_dollars, us_dollars, note, date_info) values (?, ?, ?, ?)""",
        (tw_dollars, us_dollars, note, date)
    )
    conn.commit()

    # 將使用者導回主頁面
    return redirect("/")


@app.route('/cash-delete', methods=['POST'])
def delete_cash():
    transaction_id = request.values['id']

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """DELETE FROM cash WHERE transaction_id=?""", (transaction_id, ))
    conn.commit()

    return redirect("/")


@app.route('/stock')
def stock_form():
    return render_template('stock.html')


@app.route('/stock', methods=['POST'])
def submit_stock():
    pass


if __name__ == "__main__":
    app.run(debug=True)
