import { useState } from "react";

/* Components */
import { AccountingLabelAsterisk, AccountingFormField } from "./componentProps";
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
      `新增失敗: ${err instanceof Error ? err.message : "未知錯誤"}`,
      "error"
    );
  }
};

const AddAccountingForm = () => {
  const [toast, setToast] = useState({
    show: false,
    message: "",
    kind: "info" as "success" | "error" | "info",
  });

  const showToast = (msg: string, kind: typeof toast.kind) => {
    setToast({ show: true, message: msg, kind });
  };

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
        <AccountingLabelAsterisk required={true}>
          記帳日期
        </AccountingLabelAsterisk>
        <AccountingFormField
          name="accounting_date"
          value={formData.accounting_date}
          onChange={handleFormData}
          required
          type="date"
        />
      </div>

      <div>
        <AccountingLabelAsterisk>記帳時間</AccountingLabelAsterisk>
        <AccountingFormField
          name="accounting_time"
          value={formData.accounting_time}
          onChange={handleFormData}
          type="time"
        />
      </div>

      <div>
        <AccountingLabelAsterisk required={true}>
          支出類型
        </AccountingLabelAsterisk>
        <AccountingFormField
          name="statistics_kind"
          value={formData.statistics_kind}
          onChange={handleFormData}
          required
          type="select"
          options={[
            "食",
            "衣",
            "住",
            "行",
            "育",
            "樂",
            "生活",
            "貸款",
            "其他",
          ].map((v) => ({ label: v, value: v }))}
        />
      </div>

      <div>
        <AccountingLabelAsterisk>花費細項分類</AccountingLabelAsterisk>
        <AccountingFormField
          name="category"
          value={formData.category}
          onChange={handleFormData}
          placeholder="例如：午餐、飲料"
        />
      </div>

      <div>
        <AccountingLabelAsterisk required={true}>
          商品名稱
        </AccountingLabelAsterisk>
        <AccountingFormField
          name="cost_name"
          value={formData.cost_name}
          onChange={handleFormData}
          required
          placeholder="例如：漢堡"
        />
      </div>

      <div>
        <AccountingLabelAsterisk required={true}>
          花費狀態
        </AccountingLabelAsterisk>
        <AccountingFormField
          name="cost_status"
          value={formData.cost_status}
          onChange={handleFormData}
          required
          type="select"
          options={["必要", "想要", "臨時必要", "臨時想要"].map((v, i) => ({
            label: v,
            value: i,
          }))}
        />
      </div>

      <div>
        <AccountingLabelAsterisk required={true}>
          金錢單位
        </AccountingLabelAsterisk>
        <AccountingFormField
          name="unit"
          value={formData.unit}
          onChange={handleFormData}
          required
          type="select"
          options={["TWD", "JPY", "USD"].map((v) => ({ label: v, value: v }))}
        />
      </div>

      <div>
        <AccountingLabelAsterisk required={true}>
          花費金額
        </AccountingLabelAsterisk>
        <AccountingFormField
          name="cost"
          value={formData.cost}
          onChange={handleFormData}
          required
          type="number"
        />
      </div>

      <div>
        <AccountingLabelAsterisk required={true}>
          店家名稱
        </AccountingLabelAsterisk>
        <AccountingFormField
          name="store_name"
          value={formData.store_name}
          onChange={handleFormData}
          required
        />
      </div>

      <div>
        <AccountingLabelAsterisk required={true}>
          付款方式
        </AccountingLabelAsterisk>
        <AccountingFormField
          name="payMethod"
          value={formData.payMethod}
          onChange={handleFormData}
          required
          type="select"
          options={["現金", "LINE Pay", "信用卡", "銀行轉帳", "其他"].map(
            (v, i) => ({ label: v, value: i })
          )}
        />
      </div>

      <div>
        <AccountingLabelAsterisk>發票號碼</AccountingLabelAsterisk>
        <AccountingFormField
          name="invoice_number"
          value={formData.invoice_number}
          onChange={handleFormData}
        />
      </div>

      <div className="md:col-span-3">
        <AccountingLabelAsterisk>備註說明</AccountingLabelAsterisk>
        <AccountingFormField
          name="description"
          value={formData.description}
          onChange={handleFormData}
          type="textarea"
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
