import { useState } from "react";
import { filterExpenseForm, filterIncomeForm } from "../services/constants";

interface FilterRow {
  field: string;
  operator: string;
  value: string;
  matchMode?: string;
  sortOrder?: string;
}

const FilterForm = ({
  filterStatus,
  setFilterQuery,
  onClose,
}: {
  filterStatus: string;
  setFilterQuery: (query: FilterRow[]) => void;
  onClose: () => void;
}) => {
  const [filterRows, setFilterRows] = useState<FilterRow[]>([
    { field: "", operator: "", value: "" },
    { field: "", operator: "", value: "" },
  ]);

  const updateRow = (index: number, key: keyof FilterRow, value: string) => {
    const updatedRows = [...filterRows];
    updatedRows[index][key] = value;

    if (key === "field") {
      updatedRows[index].operator = "";
      updatedRows[index].value = "";
      updatedRows[index].matchMode = "";
      updatedRows[index].sortOrder = "";
    }

    setFilterRows(updatedRows);
  };

  const addRow = () => {
    setFilterRows([...filterRows, { field: "", operator: "", value: "" }]);
  };

  const resetRows = () => {
    setFilterRows([
      { field: "", operator: "", value: "" },
      { field: "", operator: "", value: "" },
    ]);
    setFilterQuery([]);
  };

  const submitRows = () => {
    const valid = filterRows.filter(
      (row) => row.field && row.operator && row.value
    );
    setFilterQuery(valid);
    // console.log("✅ 篩選條件：", valid);
  };

  /* 當前為哪個頁面則顯示哪個篩選欄位 */
  const filterFormData =
    filterStatus === "0" ? filterExpenseForm : filterIncomeForm;

  return (
    <div className="bg-white ">
      {filterRows.map((row, index) => {
        const column = filterFormData.find((col) => col.key === row.field);

        return (
          <div key={index} className="flex items-center gap-3 mb-3">
            <select
              value={row.field}
              onChange={(e) => updateRow(index, "field", e.target.value)}
              className="w-32 border px-2 py-1 rounded text-sm"
              aria-label="選擇欄位"
            >
              <option value="">選擇欄位</option>
              {filterFormData.map((col) => (
                <option key={col.key} value={col.key}>
                  {col.label}
                </option>
              ))}
            </select>

            <select
              value={row.operator}
              onChange={(e) => updateRow(index, "operator", e.target.value)}
              className="w-32 border px-2 py-1 rounded text-sm"
              disabled={!row.field}
              aria-label="選擇條件"
            >
              <option value="">選擇條件</option>
              {column?.secondOptions?.map((op) => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>

            {column?.type === "select" ? (
              <select
                value={row.value}
                onChange={(e) => updateRow(index, "value", e.target.value)}
                className="w-36 border px-2 py-1 rounded text-sm"
                aria-label="選擇值"
              >
                <option value="">請選擇</option>
                {column.thirdOptions?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={
                  column?.type === "number"
                    ? "number"
                    : column?.type === "date"
                    ? "date"
                    : "text"
                }
                value={row.value}
                onChange={(e) => updateRow(index, "value", e.target.value)}
                className="w-36 border px-2 py-1 rounded text-sm"
                aria-label="輸入值"
              />
            )}

            {column?.showForthOptions && (
              <select
                value={
                  column.type === "text"
                    ? row.matchMode || ""
                    : row.sortOrder || ""
                }
                onChange={(e) =>
                  column.type === "text"
                    ? updateRow(index, "matchMode", e.target.value)
                    : updateRow(index, "sortOrder", e.target.value)
                }
                className="w-28 border px-2 py-1 rounded text-sm"
                aria-label="選擇模式"
              >
                <option value="">選擇模式</option>
                {column.forthOptions?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={() =>
                setFilterRows(filterRows.filter((_, i) => i !== index))
              }
              className="text-black text-lg px-2 bg-gray-200 rounded-full transition-all duration-200 hover:bg-slate-300 "
            >
              −
            </button>
          </div>
        );
      })}

      <div className="flex justify-between gap-4 mt-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={addRow}
            className="w-20 border border-blue-600 text-blue-600 px-2 py-1 rounded text-sm hover:bg-blue-50 transition-all duration-200"
          >
            ➕ 新增
          </button>
          <button
            type="button"
            onClick={resetRows}
            className="w-20 border border-blue-600 text-blue-600 px-2 py-1 rounded text-sm hover:bg-blue-50 transition-all duration-200"
          >
            🔄 重置
          </button>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={submitRows}
            className="w-20 bg-blue-600 text-white px-2 py-1 rounded text-sm hover:bg-blue-700 transition-all duration-200"
          >
            📤 送出
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-20 border border-blue-600 text-blue-600 px-2 py-1 rounded text-sm hover:bg-blue-50 transition-all duration-200"
          >
            ✖ 取消
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterForm;
