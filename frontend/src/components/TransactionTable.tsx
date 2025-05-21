import { useState, useEffect } from "react";
import { TransactionTitle } from "./componentProps";
import { getTransactionHistory } from "../services/accountingUser";

const initialColumns = [
  { key: "date", label: "日期", isVisible: true },
  { key: "time", label: "時間", isVisible: true },
  { key: "statistics_kind", label: "統計類型", isVisible: true },
  { key: "category", label: "類別", isVisible: true },
  { key: "cost_name", label: "項目", isVisible: true },
  { key: "cost_status", label: "花費狀態", isVisible: true },
  { key: "unit", label: "金錢單位", isVisible: true },
  { key: "cost", label: "金額", isVisible: true },
  { key: "pay_method", label: "付款方式", isVisible: true },
  { key: "store_name", label: "店家", isVisible: true },
  { key: "invoice_number", label: "發票號碼", isVisible: true },
  { key: "description", label: "備註", isVisible: true },
];

const costStatusMapping: Record<number, string> = {
  0: "必要",
  1: "想要",
  2: "臨時必要",
  3: "臨時想要",
};

const payMethodMapping: Record<number, string> = {
  0: "現金",
  1: "Line Pay",
  2: "信用卡",
  3: "銀行轉帳",
  4: "其他",
};

// Call Api
type TransactionHistoryData = {
  id: string;
  date: string;
  time: string;
  statistics_kind: string;
  category: string;
  cost_name: string;
  cost_status: string | number;
  unit: string;
  cost: string;
  pay_method: string | number;
  store_name: string;
  invoice_number: string;
  created_at: string;
  [key: string]: string | number;
};

const getTransactionHistoryData = async () => {
  const data = await getTransactionHistory();
  return data;
};
//

type TransactionTableProps = {
  isEdit: boolean;
};

const TransactionTable = ({ isEdit }: TransactionTableProps) => {
  // 表格資料
  const [transactionHistory, setTransactionHistory] = useState<
    TransactionHistoryData[]
  >([]);

  useEffect(() => {
    getTransactionHistoryData().then((data) => {
      data.forEach((row: TransactionHistoryData) => {
        row.cost_status = costStatusMapping[Number(row.cost_status)];
        row.pay_method = payMethodMapping[Number(row.pay_method)];
      });
      setTransactionHistory(data);
    });
  }, []);

  // 表格標題設定
  const [columns, setColumns] = useState(initialColumns);

  const toggleColumnVisibility = (key: string) => {
    setColumns((cols) =>
      cols.map((col) =>
        col.key === key ? { ...col, isVisible: !col.isVisible } : col
      )
    );
  };

  return (
    <div className="overflow-x-auto border-2 border-gray-300">
      <table className="min-w-full border-collapse text-sm px-2">
        <thead>
          <tr className="bg-gray-100 text-left">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-2 border-b whitespace-nowrap"
              >
                <TransactionTitle
                  label={col.label}
                  isVisible={col.isVisible}
                  onToggle={() => toggleColumnVisibility(col.key)}
                />
              </th>
            ))}
            {isEdit && (
              <th key="edit" className="px-4 py-2 border-b whitespace-nowrap">
                編輯
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {transactionHistory.map((row) => (
            <tr
              key={row.id}
              className="hover:bg-green-100 transition-all duration-200"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="px-4 py-2 whitespace-nowrap hover:font-semibold transition-all duration-200"
                >
                  {col.isVisible ? row[col.key] : ""}
                </td>
              ))}
              {isEdit && <td>modifed icon and delete icon</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
