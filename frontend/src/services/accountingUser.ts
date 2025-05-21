import fetchWithRefresh from "./refresh_token";
import { parsePayload } from "./userAuth";

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
  /* 處理使用者時間資訊 */
  const user_time_data: string = `${formData.accounting_date}T${formData.accounting_time}`;

  // 使用者時區
  const userTimezone: number = -(new Date().getTimezoneOffset() / 60);
  const timezoneString: string = `UTC${
    userTimezone >= 0 ? "+" : ""
  }${userTimezone}`;

  // 當前 utc 時間 (判斷是否與 server 時間差距過大)
  const currentUTCTime: string = new Date().toISOString();
  /* */

  // 使用者 payload 資訊
  const payload = await parsePayload();

  // console.log("使用者時間資訊: ", user_time_data);
  // console.log("使用者時區: ", timezoneString);
  // console.log("使用者 utc 時間: ", currentUTCTime);

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
      user_time_data: user_time_data,
      timezone: timezoneString,
      current_utc_time: currentUTCTime,
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
  const response = await fetchWithRefresh(
    "/app/accounting/transaction/history",
    {
      method: "GET",
    }
  );

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "伺服器出現未預期錯誤");
  }

  // 使用者顯示時間做時區轉換
  const transData = result.data.map((item: Record<string, any>) => {
    const localTime = new Date(item.created_at + "Z");
    return {
      ...item,
      date: localTime.toLocaleDateString(),
      time: localTime.toLocaleTimeString(),
    };
  });

  return transData;
}
