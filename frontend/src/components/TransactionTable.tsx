/* React */
import { useState, useEffect } from "react";

/* Components */
import {
  TransactionTitle,
  IconButton,
  AccountingFormField,
} from "./componentProps";

/* API */
import { getTransactionHistory } from "../services/accountingUser";

/* CSS */
import "../styles/component.css";

type ColumnType = "text" | "number" | "date" | "time" | "select" | "textarea";

type Column = {
  key: string;
  label: string;
  isVisible: boolean;
  type: ColumnType;
  required?: boolean;
  options?: { label: string; value: string | number }[];
};

const initialColumns: Column[] = [
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
  { key: "cost_name", label: "項目", isVisible: true, type: "text" },
  {
    key: "cost_status",
    label: "花費狀態",
    isVisible: true,
    type: "select",
    required: true,
    options: [
      { label: "必要", value: 0 },
      { label: "想要", value: 1 },
      { label: "臨時必要", value: 2 },
      { label: "臨時想要", value: 3 },
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
      { label: "現金", value: 0 },
      { label: "Line Pay", value: 1 },
      { label: "信用卡", value: 2 },
      { label: "銀行轉帳", value: 3 },
      { label: "其他", value: 4 },
    ],
  },
  { key: "store_name", label: "店家", isVisible: true, type: "text" },
  { key: "invoice_number", label: "發票號碼", isVisible: true, type: "text" },
  { key: "description", label: "備註", isVisible: true, type: "text" },
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
  const [transactionHistory, setTransactionHistory] = useState<
    TransactionHistoryData[]
  >([]);
  const [editRowId, setEditRowId] = useState<string | null>(null);

  useEffect(() => {
    getTransactionHistoryData().then((data) => {
      data.forEach((row: TransactionHistoryData) => {
        row.cost_status = costStatusMapping[Number(row.cost_status)];
        row.pay_method = payMethodMapping[Number(row.pay_method)];
      });
      setTransactionHistory(data);
    });
  }, []);

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
                className="px-4 py-2 border-b whitespace-nowrap max-w-[150px]"
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
          {transactionHistory.map((row) => {
            const isEditing = row.id === editRowId;
            return (
              <tr
                key={row.id}
                className="hover:bg-green-100 transition-all duration-200"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-2 whitespace-nowrap max-w-[150px] overflow-hidden text-ellipsis"
                  >
                    {col.isVisible ? (
                      isEditing ? (
                        <AccountingFormField
                          name={col.key}
                          value={row[col.key]}
                          onChange={(e) => {
                            const { value } = e.target;
                            setTransactionHistory((prev) =>
                              prev.map((r) =>
                                r.id === row.id ? { ...r, [col.key]: value } : r
                              )
                            );
                          }}
                          type={col.type}
                          options={col.options}
                          required={col.required}
                        />
                      ) : (
                        <span className="block px-1 text-gray-900 truncate">
                          {row[col.key]}
                        </span>
                      )
                    ) : (
                      ""
                    )}
                  </td>
                ))}
                {isEdit && (
                  <td className="flex items-center gap-2 px-2 py-2">
                    {isEditing ? (
                      <>
                        <IconButton
                          iconSrc="/check-dark.png"
                          onclick={() => {
                            console.log("儲存", row);
                            setEditRowId(null);
                          }}
                        />
                        <IconButton
                          iconSrc="/cancel-dark.png"
                          onclick={() => {
                            console.log("取消");
                            setEditRowId(null);
                          }}
                        />
                      </>
                    ) : (
                      <>
                        <IconButton
                          iconSrc="/modify-dark.png"
                          onclick={() => {
                            setEditRowId(row.id);
                          }}
                        />
                        <IconButton
                          iconSrc="/delete-dark.png"
                          onclick={() => {
                            console.log("刪除", row.id);
                          }}
                        />
                      </>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
