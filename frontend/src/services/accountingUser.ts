import fetchWithRefresh from "./refresh_token";
import { parsePayload } from "./userAuth";

/* 新增記帳內容 */
type FormApiDataProps = {
  statistics_kind: string;
  category: string;
  cost_name: string;
  cost_status: number;
  description: string;
  unit: string;
  cost: number;
  store_name: string;
  invoice_number: string;
  accounting_date: string;
  accounting_time: string;
};

export const addAccounting = async (formData: FormApiDataProps) => {
  /* 處理使用者時間資訊 */
  const create_at: Date = new Date(
    `${formData.accounting_date}T${formData.accounting_time}`
  );

  // 使用者時區
  const userTimezone: number = new Date().getTimezoneOffset() / 60;
  const timezoneString: string = `UTC${
    userTimezone >= 0 ? "+" : ""
  }${userTimezone}`;

  // 當前 utc 時間 (判斷是否與 server 時間差距過大)
  const currentUTCTime: string = new Date().toISOString();
  /* */

  // 使用者 payload 資訊
  const payload = parsePayload();

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
      cost: formData.cost,
      store_name: formData.store_name,
      invoice_number: formData.invoice_number,
      description: formData.description,
      create_at: create_at,
      timezone: timezoneString,
      current_utc_time: currentUTCTime,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "更改密碼失敗");
  }
  return data;
};
