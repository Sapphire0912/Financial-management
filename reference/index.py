from flask import Flask, render_template, request, g, redirect
import sqlite3
import requests
import math
import os
import matplotlib.pyplot as plt
import matplotlib as mpt
mpt.use('agg')

app = Flask(__name__)
database = 'reference/datafile.db'


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
    cash_result = cursor.execute("""SELECT * FROM cash""")
    cash_result = cash_result.fetchall()

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

    # 取得所有股票資訊 (此處可以用 SQL 語法去抓取資料)
    stock_result = cursor.execute("""SELECT * FROM stock""")
    stock_result = stock_result.fetchall()
    unique_stock_list = []
    for data in stock_result:
        if data[1] not in unique_stock_list:
            unique_stock_list.append(data[1])

    # 計算股票總市價
    total_stock_value = 0

    # 計算單一股票資訊
    stock_info = []
    for stock in unique_stock_list:
        result = cursor.execute(
            """SELECT * FROM stock WHERE stock_id=?""", (stock, ))
        result = result.fetchall()
        stock_cost = 0  # 單一股票總花費
        shares = 0  # 單一股票股數
        for d in result:
            shares += d[2]
            stock_cost += d[2] * d[3] + d[4] + d[5]

        # 取得目前股價資訊
        url = "https://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&stockNo=" + stock
        response = requests.get(url)
        data = response.json()
        price_array = data['data']
        current_price = float(price_array[-1][6].replace(',', ''))

        # 單一股票總市值
        total_value = int(current_price * shares)
        total_stock_value += total_value

        # 單一股票的平均成本
        avg_cost = round(stock_cost / shares, 2)

        # 單一股票報酬率
        rate_of_return = round((total_value - stock_cost)
                               * 100 / stock_cost, 2)

        stock_info.append(
            {
                'stock_id': stock,
                'stock_cost': stock_cost,
                'total_value': total_value,
                'avg_cost': avg_cost,
                'shares': shares,
                'current_price': current_price,
                'rate_of_return': rate_of_return
            })

    for stock in stock_info:
        stock['value_percentage'] = round(
            stock['total_value'] * 100 / total_stock_value, 2)

    # -- 繪製圓餅圖 --
    if len(unique_stock_list) != 0:
        labels = tuple(unique_stock_list)
        sizes = [d['total_value'] for d in stock_info]

        fig, ax = plt.subplots(figsize=(6, 5))
        ax.pie(sizes, labels=labels, autopct=None, shadow=None)
        fig.subplots_adjust(top=1, bottom=0, right=1,
                            left=0, hspace=0, wspace=0)
        plt.savefig("reference/static/piechart.jpg", dpi=200)
    else:
        try:
            os.remove("reference/static/piechart.jpg")
        except:
            pass

    # -- 繪製股票現金圓餅圖 --
    if us_dollars != 0 or tw_dollars != 0 or total_stock_value != 0:
        labels = ('USD', 'TWD', 'Stock')
        sizes = (us_dollars * USD_to_TWD_rate, tw_dollars, total_stock_value)

        fig, ax = plt.subplots(figsize=(6, 5))
        ax.pie(sizes, labels=labels, autopct=None, shadow=None)
        fig.subplots_adjust(top=1, bottom=0, right=1,
                            left=0, hspace=0, wspace=0)
        plt.savefig("reference/static/piechart2.jpg", dpi=200)
    else:
        try:
            os.remove("reference/static/piechart2.jpg")
        except:
            pass

    # 傳送至前端的物件資訊
    datas = {
        'show_pic_1': os.path.exists('reference/static/piechart.jpg'),
        'show_pic_2': os.path.exists('reference/static/piechart2.jpg'),
        'total': total_dollars,
        'rate': USD_to_TWD_rate,
        'USD': us_dollars,
        'TWD': tw_dollars,
        'cash_result': cash_result,
        'stock_info': stock_info,
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
    # 取得股票資訊、日期等
    stock_id = request.values["stock-id"]
    stock_num = request.values["stock-num"]
    stock_price = request.values["stock-price"]
    processing_fee = request.values["processing-fee"] if request.values["processing-fee"] != '' else 0
    tax = request.values["tax"] if request.values["tax"] != '' else 0
    date = request.values["date"]

    # 更新 db data
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """INSERT into stock (stock_id, stock_num, stock_price, processing_fee, tax, date_info) values (?, ?, ?, ?, ?, ?)""",
        (stock_id, stock_num, stock_price, processing_fee, tax, date)
    )
    conn.commit()

    # 將使用者導回主頁面
    return redirect("/")


if __name__ == "__main__":
    app.run(debug=True)
