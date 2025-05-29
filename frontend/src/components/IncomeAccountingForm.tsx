import { useState } from "react";

/* Components */
import { AccountingLabelAsterisk, AccountingFormField } from "./componentProps";
import { ToastBox } from "../components/componentProps";

/* API */
import { addIncomeAccounting } from "../services/accountingUser";

// Call Api
type IncomeFormProps = {
  income_kind: string;
  category: string;
  amount: number;
  unit: string;
  payer: string;
  pay_account: string;
  description: string;
  accounting_date: string;
  accounting_time: string;
};

const createNewIncomeAccounting = async (
  e: React.FormEvent,
  formData: IncomeFormProps,
  showToast: (msg: string, kind: "success" | "error" | "info") => void
) => {
  e.preventDefault();
  console.log("送出資料", formData);

  try {
    const result = await addIncomeAccounting(formData);
    showToast(result.message, result.success ? "success" : "error");
  } catch (err: unknown) {
    showToast(
      `新增失敗: ${err instanceof Error ? err.message : "未知錯誤"}`,
      "error"
    );
  }
};

const IncomeAccountingForm = () => {
  const [toast, setToast] = useState({
    show: false,
    message: "",
    kind: "info" as "success" | "error" | "info",
  });

  const showToast = (msg: string, kind: typeof toast.kind) => {
    setToast({ show: true, message: msg, kind });
  };

  const [formData, setFormData] = useState<IncomeFormProps>({
    income_kind: "",
    category: "",
    amount: 0,
    unit: "TWD",
    payer: "",
    pay_account: "",
    description: "",
    accounting_date: "",
    accounting_time: "",
  });

  const handleFormData = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "amount" && Number(value) < 0) alert("花費金額不可少於 0");

    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? Number(value) : value,
    }));
  };

  return (
    <form
      className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 p-4 max-w-4xl mx-auto bg-white shadow-md rounded-lg"
      onSubmit={(e) => createNewIncomeAccounting(e, formData, showToast)}
    >
      <div>
        <AccountingLabelAsterisk required={true}>
          收入日期
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
        <AccountingLabelAsterisk>收入時間</AccountingLabelAsterisk>
        <AccountingFormField
          name="accounting_time"
          value={formData.accounting_time}
          onChange={handleFormData}
          type="time"
        />
      </div>
      <div>
        <AccountingLabelAsterisk required={true}>
          收入類型
        </AccountingLabelAsterisk>
        <AccountingFormField
          name="income_kind"
          value={formData.income_kind}
          onChange={handleFormData}
          required
          type="select"
          options={["薪資", "獎金", "利息", "投資", "紅包", "其他"].map(
            (v) => ({ label: v, value: v })
          )}
        />
      </div>
      <div>
        <AccountingLabelAsterisk>收入細項分類</AccountingLabelAsterisk>
        <AccountingFormField
          name="category"
          value={formData.category}
          onChange={handleFormData}
          placeholder="例如：兼職、股利"
        />
      </div>

      <div>
        <AccountingLabelAsterisk required={true}>
          收入金額
        </AccountingLabelAsterisk>
        <AccountingFormField
          name="amount"
          value={formData.amount}
          onChange={handleFormData}
          required
          type="number"
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
          收入來源
        </AccountingLabelAsterisk>
        <AccountingFormField
          name="payer"
          value={formData.payer}
          onChange={handleFormData}
          required
        />
      </div>

      <div>
        <AccountingLabelAsterisk required={true}>
          收入帳戶
        </AccountingLabelAsterisk>
        <AccountingFormField
          name="pay_account"
          value={formData.pay_account}
          onChange={handleFormData}
          required
        />
      </div>

      <div className="md:col-span-3">
        <AccountingLabelAsterisk>備註說明</AccountingLabelAsterisk>
        <AccountingFormField
          name="description"
          value={formData.description}
          onChange={handleFormData}
          type="textarea"
          placeholder="可填寫具體收入項目"
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

export default IncomeAccountingForm;
