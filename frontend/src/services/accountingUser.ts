import fetchWithRefresh from "./refresh_token";
import { parsePayload } from "./userAuth";
import { userTimeConvert } from "./tools";

const costStatusMapping: Record<string, number> = {
  必要: 0,
  想要: 1,
  臨時必要: 2,
  臨時想要: 3,
};

const payMethodMapping: Record<string, number> = {
  現金: 0,
  "Line Pay": 1,
  信用卡: 2,
  銀行轉帳: 3,
  其他: 4,
};

/* 新增記帳內容(支出) */
type AddFormDataProps = {
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

export async function addAccounting(formData: AddFormDataProps) {
  const userTime = await userTimeConvert(
    formData.accounting_date,
    formData.accounting_time
  );
  /* */

  // 使用者 payload 資訊
  const payload = await parsePayload();

  const response = await fetchWithRefresh("/app/accounting/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      statistics_kind: formData.statistics_kind,
      category: formData.category,
      user_name: payload.username,
      user_id: payload.line_user_id,
      cost_name: formData.cost_name,
      cost_status: formData.cost_status,
      unit: formData.unit,
      cost: Number(formData.cost),
      pay_method: formData.payMethod,
      store_name: formData.store_name,
      invoice_number: formData.invoice_number,
      description: formData.description,
      user_time_data: userTime.user_time_data,
      timezone: userTime.timezoneString,
      current_utc_time: userTime.currentUTCTime,
      oper: 0,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "伺服器出現未預期錯誤");
  }
  return data;
}

/* 取得使用者記帳資料 */
export async function getTransactionHistory() {
  const params = new URLSearchParams({
    oper: "0",
  });

  const response = await fetchWithRefresh(
    `/app/accounting/transaction/history?${params.toString()}`,
    {
      method: "GET",
    }
  );

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "伺服器出現未預期錯誤");
  }

  // 使用者顯示時間做時區轉換 & 付費方式, 花費狀態文字轉換
  const transData = result.data.map((item: Record<string, any>) => {
    const localTime = new Date(item.created_at + "Z");
    const year = localTime.getFullYear();
    const month = String(localTime.getMonth() + 1).padStart(2, "0");
    const day = String(localTime.getDate()).padStart(2, "0");

    return {
      ...item,
      date: `${year}-${month}-${day}`,
      time: localTime.toLocaleTimeString(undefined, {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      pay_method: Object.entries(payMethodMapping).find(
        ([_, v]) => v === item.pay_method
      )?.[0],
      cost_status: Object.entries(costStatusMapping).find(
        ([_, v]) => v === item.cost_status
      )?.[0],
    };
  });
  return transData;
}

/* 修改記帳資料 */
type UpdateFormDataProps = {
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
  description: string;
  store_name: string;
  invoice_number: string;
  created_at: string;
};

export async function updateTransactionData(formData: UpdateFormDataProps) {
  const userTime = await userTimeConvert(formData.date, formData.time);

  // 使用者 payload 資訊
  const payload = await parsePayload();

  const response = await fetchWithRefresh("/app/accounting/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: formData.id,
      statistics_kind: formData.statistics_kind,
      category: formData.category,
      user_name: payload.username,
      user_id: payload.line_user_id,
      cost_name: formData.cost_name,
      cost_status: costStatusMapping[formData.cost_status],
      cost: Number(formData.cost),
      unit: formData.unit,
      pay_method: payMethodMapping[formData.pay_method],
      store_name: formData.store_name,
      invoice_number: formData.invoice_number,
      description: formData.description,
      user_time_data: userTime.user_time_data,
      timezone: userTime.timezoneString,
      current_utc_time: userTime.currentUTCTime,
      oper: 0,
    }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "伺服器出現未預期錯誤");
  }
  return result;
}

/* 刪除記帳資料 */
export async function deleteTransactionData(deleteDataId: string) {
  const currentUTCTime: string = new Date().toISOString();

  // 使用者 payload 資訊
  const payload = await parsePayload();

  console.log(currentUTCTime, deleteDataId, payload);
  const response = await fetchWithRefresh("/app/accounting/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: deleteDataId,
      user_name: payload.username,
      user_id: payload.line_user_id,
      current_utc_time: currentUTCTime,
      oper: 0,
    }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "伺服器出現未預期錯誤");
  }
  return result;
}
