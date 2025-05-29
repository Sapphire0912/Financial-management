import { useState, useEffect } from "react";
import { initialColumns } from "../services/constants";

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
  deleteTransactionData as deleteTransactionDataAPI,
} from "../services/accountingUser";

/* CSS */
import "../styles/component.css";

type TransactionHistoryData = {
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

const getTransactionHistoryData = async () => {
  const data = await getTransactionHistory();
  return data;
};

const updateTransactionData = async (formData: TransactionHistoryData) => {
  const data = await updateTransactionDataAPI(formData);
  return data;
};

const deleteTransactionData = async (deleteDataId: string) => {
  const data = await deleteTransactionDataAPI(deleteDataId);
  return data;
};
//

const TransactionTable = ({ isEdit }: { isEdit: boolean }) => {
  const [transactionHistory, setTransactionHistory] = useState<
    TransactionHistoryData[]
  >([]);
  const [editRowId, setEditRowId] = useState<string | null>(null);
  const [columns, setColumns] = useState(initialColumns);

  const fetchData = async () => {
    const data = await getTransactionHistoryData();
    setTransactionHistory(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

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
                          onclick={async () => {
                            setEditRowId(null);
                            await updateTransactionData(row);
                            await fetchData();
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
                              await deleteTransactionData(row.id);
                              await fetchData();
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
  );
};

export default TransactionTable;
