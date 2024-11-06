from flask import Flask, render_template, request, g, redirect
import sqlite3

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
    return render_template('index.html')


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


@app.route('/stock')
def stock_form():
    return render_template('stock.html')


@app.route('/stock', methods=['POST'])
def submit_stock():
    pass


if __name__ == "__main__":
    app.run(debug=True)
