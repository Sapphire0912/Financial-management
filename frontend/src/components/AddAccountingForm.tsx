import { useState } from "react";

/* Components */
import { AccountingLabelAsterisk } from "./componentProps";

/* API */

// Call Api
type FormDataProps = {
  statistics_kind: string;
  category: string;
  cost_name: string;
  cost_status: number;
  description: string;
  payMethod: string;
  unit: string;
  cost: number;
  store_name: string;
  invoice_number: string;
  accounting_date: string;
  accounting_time: string;
};

const createNewAccounting = (e: React.FormEvent, formData: FormDataProps) => {
  e.preventDefault();
  console.log("送出資料", formData);
  // TODO: 傳送到後端
};

const AddAccountingForm = () => {
  const [formData, setFormData] = useState<FormDataProps>({
    statistics_kind: "",
    category: "",
    cost_name: "",
    cost_status: 0,
    description: "",
    unit: "TWD",
    payMethod: "",
    cost: 0,
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

    setFormData((prev) => ({
      ...prev,
      [name]: name === "cost" || name === "cost_status" ? Number(value) : value,
    }));
  };

  return (
    <form
      className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 p-4 max-w-4xl mx-auto bg-white shadow-md rounded-lg"
      onSubmit={(e) => createNewAccounting(e, formData)}
    >
      {/* 記帳日期 */}
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

      {/* 記帳時間 */}
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

      {/* 統計類型 */}
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
          <option value="其他">其他</option>
        </select>
      </div>

      {/* 細項分類 */}
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

      {/* 花費名稱 */}
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

      {/* 花費狀態 */}
      <div>
        <AccountingLabelAsterisk children="花費狀態" required={true} />
        <select
          name="cost_status"
          value={formData.cost_status}
          onChange={handleFormData}
          aria-label="花費狀態"
          className="w-full border rounded px-3 py-2"
        >
          <option value={0}>必要</option>
          <option value={1}>想要</option>
          <option value={2}>臨時必要</option>
          <option value={3}>臨時想要</option>
        </select>
      </div>

      {/* 單位 */}
      <div>
        <AccountingLabelAsterisk children="金錢單位" required={true} />
        <select
          name="unit"
          value={formData.unit}
          onChange={handleFormData}
          aria-label="金錢單位"
          className="w-full border rounded px-3 py-2"
        >
          <option value="TWD">TWD</option>
          <option value="JPY">JPY</option>
          <option value="USD">USD</option>
        </select>
      </div>

      {/* 金額 */}
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

      {/* 店家 */}
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
          <option value="現金">現金</option>
          <option value="LINE Pay">LINE Pay</option>
          <option value="信用卡">信用卡</option>
          <option value="其他">其他</option>
        </select>
      </div>

      {/* 發票號碼 */}
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

      <div className="md:col-span-2">
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

      {/* 送出按鈕 (跨欄) */}
      <div className="md:col-span-2 text-right">
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
        >
          送出
        </button>
      </div>
    </form>
  );
};

export default AddAccountingForm;
