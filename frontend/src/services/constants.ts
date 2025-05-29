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

/* Filter Form 選單 */
