/* Transaction Table 欄位資料 */
type ColumnType = "text" | "number" | "date" | "time" | "select" | "textarea";
type Column = {
  key: string;
  label: string;
  isVisible: boolean;
  type: ColumnType;
  required?: boolean;
  options?: { label: string; value: string }[];
};

export const initialColumns: Column[] = [
  {
    key: "date",
    label: "日期",
    isVisible: true,
    type: "date",
    required: true,
  },
  {
    key: "time",
    label: "時間",
    isVisible: true,
    type: "time",
  },
  {
    key: "statistics_kind",
    label: "統計類型",
    isVisible: true,
    type: "select",
    required: true,
    options: [
      { label: "食", value: "食" },
      { label: "衣", value: "衣" },
      { label: "住", value: "住" },
      { label: "行", value: "行" },
      { label: "育", value: "育" },
      { label: "樂", value: "樂" },
      { label: "生活", value: "生活" },
      { label: "貸款", value: "貸款" },
      { label: "其他", value: "其他" },
    ],
  },
  { key: "category", label: "類別", isVisible: true, type: "text" },
  { key: "cost_name", label: "花費項目", isVisible: true, type: "text" },
  {
    key: "cost_status",
    label: "花費狀態",
    isVisible: true,
    type: "select",
    required: true,
    options: [
      { label: "必要", value: "必要" },
      { label: "想要", value: "想要" },
      { label: "臨時必要", value: "臨時必要" },
      { label: "臨時想要", value: "臨時想要" },
    ],
  },
  {
    key: "unit",
    label: "金錢單位",
    isVisible: true,
    type: "select",
    required: true,
    options: [
      { label: "TWD", value: "TWD" },
      { label: "JPY", value: "JPY" },
      { label: "USD", value: "USD" },
    ],
  },
  {
    key: "cost",
    label: "金額",
    isVisible: true,
    type: "number",
    required: true,
  },
  {
    key: "pay_method",
    label: "付款方式",
    isVisible: true,
    type: "select",
    required: true,
    options: [
      { label: "現金", value: "現金" },
      { label: "Line Pay", value: "Line Pay" },
      { label: "信用卡", value: "信用卡" },
      { label: "銀行轉帳", value: "銀行轉帳" },
      { label: "其他", value: "其他" },
    ],
  },
  { key: "store_name", label: "店家", isVisible: true, type: "text" },
  { key: "invoice_number", label: "發票號碼", isVisible: true, type: "text" },
  { key: "description", label: "備註", isVisible: true, type: "text" },
];

/* Income Form 選單 */
export const initialIncomeColumns: Column[] = [
  {
    key: "date",
    label: "日期",
    isVisible: true,
    type: "date",
    required: true,
  },
  {
    key: "time",
    label: "時間",
    isVisible: true,
    type: "time",
  },
  {
    key: "income_kind",
    label: "收入類型",
    isVisible: true,
    type: "select",
    required: true,
    options: [
      { label: "薪資", value: "薪資" },
      { label: "獎金", value: "獎金" },
      { label: "利息", value: "利息" },
      { label: "投資", value: "投資" },
      { label: "紅包", value: "紅包" },
      { label: "其他", value: "其他" },
    ],
  },
  { key: "category", label: "細項分類", isVisible: true, type: "text" },
  {
    key: "unit",
    label: "金錢單位",
    isVisible: true,
    type: "select",
    required: true,
    options: [
      { label: "TWD", value: "TWD" },
      { label: "JPY", value: "JPY" },
      { label: "USD", value: "USD" },
    ],
  },
  {
    key: "amount",
    label: "金額",
    isVisible: true,
    type: "number",
    required: true,
  },

  {
    key: "payer",
    label: "收入來源",
    isVisible: true,
    type: "text",
    required: true,
  },
  {
    key: "pay_account",
    label: "收入帳戶",
    isVisible: true,
    type: "text",
    required: true,
  },
  { key: "description", label: "備註", isVisible: true, type: "text" },
];

/* Filter Form 選單 */
type filterFormProps = {
  /* 第一個 select 選單欄位 */
  key: string;
  label: string;

  /* 第二個選單欄位 */
  type: "text" | "select" | "number" | "date";
  secondOptions?: { label: string; value: string }[];

  /* 第三個欄位 */
  // 根據 type 資料來顯示 input/select 的類型
  thirdOptions?: { label: string; value: string }[];

  /* 第四個欄位 */
  // 若 type == "select" 則 showForthOptions == False
  // 若 type == "text" 則 showForthOptions == True, forthOptions = [ {label: "精準比對", value: "exact"}, {label: "模糊比對", value: "fuzzy"}]
  // 若 type == "number" || "date" 則 showForthOptions == True, forthOptions = [ {label: "升序", value: "asc"}, {label: "降序", value: "desc"}]
  showForthOptions: boolean;
  forthOptions?: { label: string; value: string }[];
};

export const filterExpenseForm: filterFormProps[] = [
  {
    key: "date",
    label: "日期",
    type: "date",
    secondOptions: [
      { label: "小於", value: "lt" },
      { label: "大於", value: "gt" },
      { label: "等於", value: "eq" },
    ],
    showForthOptions: true,
    forthOptions: [
      { label: "升序", value: "+" },
      { label: "降序", value: "-" },
    ],
  },
  {
    key: "statistics_kind",
    label: "統計類型",
    type: "select",
    secondOptions: [{ label: "等於", value: "eq" }],
    thirdOptions: [
      { label: "食", value: "食" },
      { label: "衣", value: "衣" },
      { label: "住", value: "住" },
      { label: "行", value: "行" },
      { label: "育", value: "育" },
      { label: "樂", value: "樂" },
      { label: "生活", value: "生活" },
      { label: "貸款", value: "貸款" },
      { label: "其他", value: "其他" },
    ],
    showForthOptions: false,
  },
  {
    key: "category",
    label: "類別",
    type: "text",
    secondOptions: [
      { label: "包含", value: "include" },
      { label: "不包含", value: "exclude" },
    ],
    showForthOptions: true,
    forthOptions: [
      { label: "模糊查詢", value: "fuzzy" },
      { label: "精準查詢", value: "exact" },
    ],
  },
  {
    key: "cost_name",
    label: "花費項目",
    type: "text",
    secondOptions: [
      { label: "包含", value: "include" },
      { label: "不包含", value: "exclude" },
    ],
    showForthOptions: true,
    forthOptions: [
      { label: "模糊查詢", value: "fuzzy" },
      { label: "精準查詢", value: "exact" },
    ],
  },
  {
    key: "cost_status",
    label: "花費狀態",
    type: "select",
    secondOptions: [{ label: "等於", value: "eq" }],
    thirdOptions: [
      { label: "必要", value: "必要" },
      { label: "想要", value: "想要" },
      { label: "臨時必要", value: "臨時必要" },
      { label: "臨時想要", value: "臨時想要" },
    ],
    showForthOptions: false,
  },
  {
    key: "unit",
    label: "金錢單位",
    type: "select",
    secondOptions: [{ label: "等於", value: "eq" }],
    thirdOptions: [
      { label: "TWD", value: "TWD" },
      { label: "JPY", value: "JPY" },
      { label: "USD", value: "USD" },
    ],
    showForthOptions: false,
  },
  {
    key: "cost",
    label: "金額",
    type: "number",
    secondOptions: [
      { label: ">", value: "gt" },
      { label: "<", value: "lt" },
      { label: "=", value: "eq" },
      { label: ">=", value: "gte" },
      { label: "<=", value: "lte" },
    ],
    showForthOptions: true,
    forthOptions: [
      { label: "升序", value: "+" },
      { label: "降序", value: "-" },
    ],
  },
  {
    key: "pay_method",
    label: "付款方式",
    type: "select",
    secondOptions: [{ label: "等於", value: "eq" }],
    thirdOptions: [
      { label: "現金", value: "現金" },
      { label: "Line Pay", value: "Line Pay" },
      { label: "信用卡", value: "信用卡" },
      { label: "銀行轉帳", value: "銀行轉帳" },
      { label: "其他", value: "其他" },
    ],
    showForthOptions: false,
  },
  {
    key: "store_name",
    label: "店家",
    type: "text",
    secondOptions: [
      { label: "包含", value: "include" },
      { label: "不包含", value: "exclude" },
    ],
    showForthOptions: true,
    forthOptions: [
      { label: "模糊查詢", value: "fuzzy" },
      { label: "精準查詢", value: "exact" },
    ],
  },
  {
    key: "invoice_number",
    label: "發票號碼",
    type: "text",
    secondOptions: [
      { label: "包含", value: "include" },
      { label: "不包含", value: "exclude" },
    ],
    showForthOptions: true,
    forthOptions: [
      { label: "模糊查詢", value: "fuzzy" },
      { label: "精準查詢", value: "exact" },
    ],
  },
  {
    key: "description",
    label: "備註",
    type: "text",
    secondOptions: [
      { label: "包含", value: "include" },
      { label: "不包含", value: "exclude" },
    ],
    showForthOptions: true,
    forthOptions: [
      { label: "模糊查詢", value: "fuzzy" },
      { label: "精準查詢", value: "exact" },
    ],
  },
];

export const filterIncomeForm: filterFormProps[] = [
  {
    key: "date",
    label: "日期",
    type: "date",
    secondOptions: [
      { label: "小於", value: "lt" },
      { label: "大於", value: "gt" },
      { label: "等於", value: "eq" },
    ],
    showForthOptions: true,
    forthOptions: [
      { label: "升序", value: "+" },
      { label: "降序", value: "-" },
    ],
  },
  {
    key: "income_kind",
    label: "收入類型",
    type: "select",
    secondOptions: [{ label: "等於", value: "eq" }],
    thirdOptions: [
      { label: "薪資", value: "薪資" },
      { label: "獎金", value: "獎金" },
      { label: "利息", value: "利息" },
      { label: "投資", value: "投資" },
      { label: "紅包", value: "紅包" },
      { label: "其他", value: "其他" },
    ],
    showForthOptions: false,
  },
  {
    key: "category",
    label: "細項分類",
    type: "text",
    secondOptions: [
      { label: "包含", value: "include" },
      { label: "不包含", value: "exclude" },
    ],
    showForthOptions: true,
    forthOptions: [
      { label: "模糊查詢", value: "fuzzy" },
      { label: "精準查詢", value: "exact" },
    ],
  },
  {
    key: "unit",
    label: "金錢單位",
    type: "select",
    secondOptions: [{ label: "等於", value: "eq" }],
    thirdOptions: [
      { label: "TWD", value: "TWD" },
      { label: "JPY", value: "JPY" },
      { label: "USD", value: "USD" },
    ],
    showForthOptions: false,
  },
  {
    key: "amount",
    label: "金額",
    type: "number",
    secondOptions: [
      { label: ">", value: "gt" },
      { label: "<", value: "lt" },
      { label: "=", value: "eq" },
      { label: ">=", value: "gte" },
      { label: "<=", value: "lte" },
    ],
    showForthOptions: true,
    forthOptions: [
      { label: "升序", value: "+" },
      { label: "降序", value: "-" },
    ],
  },
  {
    key: "payer",
    label: "收入來源",
    type: "text",
    secondOptions: [
      { label: "包含", value: "include" },
      { label: "不包含", value: "exclude" },
    ],
    showForthOptions: true,
    forthOptions: [
      { label: "模糊查詢", value: "fuzzy" },
      { label: "精準查詢", value: "exact" },
    ],
  },
  {
    key: "pay_account",
    label: "收入帳戶",
    type: "text",
    secondOptions: [
      { label: "包含", value: "include" },
      { label: "不包含", value: "exclude" },
    ],
    showForthOptions: true,
    forthOptions: [
      { label: "模糊查詢", value: "fuzzy" },
      { label: "精準查詢", value: "exact" },
    ],
  },
  {
    key: "description",
    label: "備註",
    type: "text",
    secondOptions: [
      { label: "包含", value: "include" },
      { label: "不包含", value: "exclude" },
    ],
    showForthOptions: true,
    forthOptions: [
      { label: "模糊查詢", value: "fuzzy" },
      { label: "精準查詢", value: "exact" },
    ],
  },
];
