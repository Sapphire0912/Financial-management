import { useState, useEffect } from "react";
import { initialColumns, initialIncomeColumns } from "../services/constants";

/* Components */
import {
  TransactionTitle,
  IconButton,
  AccountingFormField,
} from "./componentProps";

/* API */
import {
  getTransactionHistory,
  updateTransactionData as updateTransactionDataAPI,
  updateIncomeData as updateIncomeDataAPI,
  deleteTransactionData as deleteTransactionDataAPI,
  deleteIncomeData as deleteIncomeDataAPI,
} from "../services/accountingUser";

/* CSS */
import "../styles/component.css";

type ExpenseHistoryData = {
  id: string;
  date: string;
  time: string;
  statistics_kind: string;
  category: string;
  cost_name: string;
  cost_status: string;
  unit: string;
  cost: string;
  pay_method: string;
  store_name: string;
  invoice_number: string;
  description: string;
  created_at: string;
  [key: string]: string;
};

type IncomeHistoryData = {
  id: string;
  date: string;
  time: string;
  income_kind: string;
  category: string;
  unit: string;
  amount: string;
  payer: string;
  pay_account: string;
  description: string;
  created_at: string;
  [key: string]: string;
};

type FilterRow = {
  field: string;
  operator: string;
  value: string;
  matchMode?: string;
  sortOrder?: string;
};

const boardItems = [
  {
    img: "/board-add-dark.png",
    text: "支出",
    showStatus: "0",
  },
  {
    img: "/board-income-dark.png",
    text: "收入",
    showStatus: "1",
  },
];

const getTransactionHistoryData = async (
  dataType: string,
  filterQuery: FilterRow[],
  page: number
) => {
  const data = await getTransactionHistory(dataType, filterQuery, page);
  return data;
};

const updateTransactionData = async (
  formData: ExpenseHistoryData | IncomeHistoryData,
  dataType: string
) => {
  if (dataType === "0") {
    const data = await updateTransactionDataAPI(formData as ExpenseHistoryData);
    return data;
  }
  if (dataType === "1") {
    const data = await updateIncomeDataAPI(formData as IncomeHistoryData);
    return data;
  }
};

const deleteTransactionData = async (
  deleteDataId: string,
  dataType: string
) => {
  if (dataType === "0") {
    const data = await deleteTransactionDataAPI(deleteDataId);
    return data;
  }
  if (dataType === "1") {
    const data = await deleteIncomeDataAPI(deleteDataId);
    return data;
  }
};
//

const TransactionTable = ({
  filterStatus,
  setFilterStatus,
  filterQuery,
  isEdit,
}: {
  filterStatus: string;
  setFilterStatus: React.Dispatch<React.SetStateAction<string>>;
  filterQuery: FilterRow[];
  isEdit: boolean;
}) => {
  /* 表格資料 */
  const [expenseHistory, setExpenseHistory] = useState<ExpenseHistoryData[]>(
    []
  );
  const [incomeHistory, setIncomeHistory] = useState<IncomeHistoryData[]>([]);

  /* 分頁控制 */
  const [page, setPage] = useState<number>(1);
  const [maxPage, setMaxPage] = useState<number>(1);

  /* 初始選單狀態 */
  const [columns, setColumns] = useState(initialColumns);
  const [editRowId, setEditRowId] = useState<string | null>(null);

  const fetchData = async (
    dataType: string,
    filterQuery: FilterRow[],
    page: number
  ) => {
    const data = await getTransactionHistoryData(dataType, filterQuery, page);
    if (dataType === "0") {
      setExpenseHistory(data as ExpenseHistoryData[]);
    } else {
      setIncomeHistory(data as IncomeHistoryData[]);
    }
    if (data.max_page == 0) setPage(0);
    setMaxPage(data.max_page);
  };

  const transactionHistory =
    filterStatus === "0" ? expenseHistory : incomeHistory;

  useEffect(() => {
    fetchData(filterStatus, filterQuery, page);
    setColumns(filterStatus === "0" ? initialColumns : initialIncomeColumns);
  }, [filterStatus, filterQuery, page]);

  const toggleColumnVisibility = (key: string) => {
    setColumns((cols) =>
      cols.map((col) =>
        col.key === key ? { ...col, isVisible: !col.isVisible } : col
      )
    );
  };

  return (
    <div>
      <div className="flex items-center">
        {boardItems.map((item, idx) => (
          <button
            key={idx}
            type="button"
            className={`w-1/2  py-1 font-semibold text-xl  rounded-t-xl transition-all duration-200 ${
              filterStatus === item.showStatus
                ? "bg-blue-400 text-white bottom-shadow"
                : ""
            }`}
            onClick={() => {
              setFilterStatus(item.showStatus);
              setColumns(
                item.showStatus === "0" ? initialColumns : initialIncomeColumns
              );
            }}
          >
            {item.text}
          </button>
        ))}
      </div>
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
                <th
                  key="edit"
                  className="px-4 py-2 border-b whitespace-nowrap max-w-[150px]"
                >
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
                              if (filterStatus === "0") {
                                setExpenseHistory((prev) =>
                                  prev.map((r) =>
                                    r.id === row.id
                                      ? { ...r, [col.key]: value }
                                      : r
                                  )
                                );
                              } else {
                                setIncomeHistory((prev) =>
                                  prev.map((r) =>
                                    r.id === row.id
                                      ? { ...r, [col.key]: value }
                                      : r
                                  )
                                );
                              }
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
                            onclick={async () => {
                              setEditRowId(null);
                              await updateTransactionData(row, filterStatus);
                              await fetchData(filterStatus, filterQuery, page);
                            }}
                          />
                          <IconButton
                            iconSrc="/cancel-dark.png"
                            onclick={() => {
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
                            onclick={async () => {
                              const confirmed =
                                window.confirm("確定要刪除這筆資料嗎？");
                              if (!confirmed) return;

                              try {
                                await deleteTransactionData(
                                  row.id,
                                  filterStatus
                                );
                                await fetchData(
                                  filterStatus,
                                  filterQuery,
                                  page
                                );
                              } catch (err) {
                                console.error("刪除失敗：", err);
                              }
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
      <div className="flex justify-center items-center my-1">
        <button
          type="button"
          className={`p-2 transition-opacity ${
            page <= 1 ? "opacity-30 cursor-not-allowed" : "hover:opacity-80"
          }`}
          disabled={page <= 1}
          onClick={() => setPage(1)}
        >
          <img
            src="/previous-bound-dark.png"
            alt="previous-bound"
            width={24}
            height={24}
          />
        </button>
        <button
          type="button"
          className={`p-2 transition-opacity ${
            page <= 1 ? "opacity-30 cursor-not-allowed" : "hover:opacity-80"
          }`}
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        >
          <img src="/previous-dark.png" alt="previous" width={24} height={24} />
        </button>
        <span className="text-center text-base p-2">
          {page}/{maxPage}
        </span>
        <button
          type="button"
          className={`p-2 transition-opacity ${
            page >= maxPage
              ? "opacity-30 cursor-not-allowed"
              : "hover:opacity-80"
          }`}
          disabled={page >= maxPage}
          onClick={() => setPage(maxPage)}
        >
          <img src="/next-dark.png" alt="next-dark" width={24} height={24} />
        </button>

        <button
          type="button"
          className={`p-2 transition-opacity ${
            page >= maxPage
              ? "opacity-30 cursor-not-allowed"
              : "hover:opacity-80"
          }`}
          disabled={page >= maxPage}
          onClick={() => setPage(maxPage)}
        >
          <img
            src="/next-bound-dark.png"
            alt="next-bound"
            width={24}
            height={24}
          />
        </button>
      </div>
    </div>
  );
};

export default TransactionTable;
