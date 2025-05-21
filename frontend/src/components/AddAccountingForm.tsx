import { useState } from "react";

/* Components */
import { AccountingLabelAsterisk } from "./componentProps";
import { ToastBox } from "../components/componentProps";

/* API */
import { addAccounting } from "../services/accountingUser";

// Call Api
type FormDataProps = {
  statistics_kind: string;
  category: string;
  cost_name: string;
  cost_status: number;
  description: string;
  payMethod: string;
  unit: string;
  cost: number | string;
  store_name: string;
  invoice_number: string;
  accounting_date: string;
  accounting_time: string;
};

const createNewAccounting = async (
  e: React.FormEvent,
  formData: FormDataProps,
  showToast: (msg: string, kind: "success" | "error" | "info") => void
) => {
  e.preventDefault();
  console.log("送出資料", formData);

  try {
    const result = await addAccounting(formData);
    showToast(result.message, result.success ? "success" : "error");
  } catch (err: unknown) {
    showToast(
      `登入失敗：${err instanceof Error ? err.message : "未知錯誤"}`,
      "error"
    );
  }
};
//

const AddAccountingForm = () => {
  // 彈跳視窗提示
  const [toast, setToast] = useState({
    show: false,
    message: "",
    kind: "info" as "success" | "error" | "info",
  });

  const showToast = (msg: string, kind: typeof toast.kind) => {
    setToast({ show: true, message: msg, kind });
  };

  // 表格資料
  const [formData, setFormData] = useState<FormDataProps>({
    statistics_kind: "",
    category: "",
    cost_name: "",
    cost_status: 0,
    description: "",
    unit: "TWD",
    payMethod: "",
    cost: "",
    store_name: "",
    invoice_number: "",
    accounting_date: "",
    accounting_time: "",
  });

  const handleFormData = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "cost" && Number(value) < 0) alert("花費金額不可少於 0");

    setFormData((prev) => ({
      ...prev,
      [name]: name === "cost" || name === "cost_status" ? Number(value) : value,
    }));
  };

  return (
    <form
      className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 p-4 max-w-4xl mx-auto bg-white shadow-md rounded-lg"
      onSubmit={(e) => createNewAccounting(e, formData, showToast)}
    >
      <div>
        <AccountingLabelAsterisk children="記帳日期" required={true} />
        <input
          type="date"
          name="accounting_date"
          value={formData.accounting_date}
          onChange={handleFormData}
          aria-label="記帳日期"
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <AccountingLabelAsterisk children="記帳時間" required={false} />
        <input
          type="time"
          name="accounting_time"
          value={formData.accounting_time}
          onChange={handleFormData}
          aria-label="記帳時間"
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <AccountingLabelAsterisk children="統計類型" required={true} />
        <select
          name="statistics_kind"
          value={formData.statistics_kind}
          onChange={handleFormData}
          aria-label="統計類型"
          className="w-full border rounded px-3 py-2"
          required
        >
          <option value="">請選擇</option>
          <option value="食">食</option>
          <option value="衣">衣</option>
          <option value="住">住</option>
          <option value="行">行</option>
          <option value="育">育</option>
          <option value="樂">樂</option>
          <option value="生活">生活</option>
          <option value="貸款">貸款</option>
          <option value="其他">其他</option>
        </select>
      </div>

      <div>
        <AccountingLabelAsterisk children="花費細項分類" required={false} />
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleFormData}
          className="w-full border rounded px-3 py-2"
          placeholder="例如：午餐、飲料"
        />
      </div>

      <div>
        <AccountingLabelAsterisk children="商品名稱" required={true} />
        <input
          type="text"
          name="cost_name"
          value={formData.cost_name}
          onChange={handleFormData}
          className="w-full border rounded px-3 py-2"
          placeholder="例如：漢堡"
          required
        />
      </div>

      <div>
        <AccountingLabelAsterisk children="花費狀態" required={true} />
        <select
          name="cost_status"
          value={formData.cost_status}
          onChange={handleFormData}
          aria-label="花費狀態"
          className="w-full border rounded px-3 py-2"
          required
        >
          <option value={0}>必要</option>
          <option value={1}>想要</option>
          <option value={2}>臨時必要</option>
          <option value={3}>臨時想要</option>
        </select>
      </div>

      <div>
        <AccountingLabelAsterisk children="金錢單位" required={true} />
        <select
          name="unit"
          value={formData.unit}
          onChange={handleFormData}
          aria-label="金錢單位"
          className="w-full border rounded px-3 py-2"
          required
        >
          <option value="TWD">TWD</option>
          <option value="JPY">JPY</option>
          <option value="USD">USD</option>
        </select>
      </div>

      <div>
        <AccountingLabelAsterisk children="花費金額" required={true} />
        <input
          type="number"
          name="cost"
          value={formData.cost}
          onChange={handleFormData}
          aria-label="花費金額"
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <AccountingLabelAsterisk children="店家名稱" required={true} />
        <input
          type="text"
          name="store_name"
          value={formData.store_name}
          onChange={handleFormData}
          aria-label="店家名稱"
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <AccountingLabelAsterisk children="付款方式" required={true} />
        <select
          name="payMethod"
          value={formData.payMethod}
          onChange={handleFormData}
          aria-label="付款方式"
          className="w-full border rounded px-3 py-2"
        >
          <option value={0}>現金</option>
          <option value={1}>LINE Pay</option>
          <option value={2}>信用卡</option>
          <option value={3}>銀行轉帳</option>
          <option value={4}>其他</option>
        </select>
      </div>

      <div>
        <AccountingLabelAsterisk children="發票號碼" required={false} />
        <input
          type="text"
          name="invoice_number"
          value={formData.invoice_number}
          onChange={handleFormData}
          aria-label="發票號碼"
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="md:col-span-3">
        <AccountingLabelAsterisk children="備註說明" required={false} />
        <textarea
          name="description"
          value={formData.description}
          onChange={handleFormData}
          rows={3}
          className="w-full border rounded px-3 py-2"
          placeholder="可填寫使用目的、細節等備註"
        />
      </div>

      <div className="md:col-span-3 text-right">
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
        >
          送出
        </button>
      </div>
      {toast.show && (
        <ToastBox
          message={toast.message}
          kind={toast.kind}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </form>
  );
};

export default AddAccountingForm;
