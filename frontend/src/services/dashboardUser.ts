import fetchWithRefresh from "./refresh_token";
import { userTimeConvert } from "./tools";

/* 處理使用者資訊 */
export async function userData(token: string | null) {
  if (!token) throw new Error("Token 不可為空");

  const response = await fetchWithRefresh("/app/dashboard/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const json_data = await response.json();

  if (!response.ok) {
    throw new Error(json_data.message || "取得資料失敗");
  }
  return json_data.data;
}

/* 登出 */
export async function userLogout() {
  // Cookie 由後端清除
  localStorage.removeItem("token");

  const response = await fetchWithRefresh("/app/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  const json_data = await response.json();

  if (!response.ok) {
    throw new Error(json_data.message || "登出失敗");
  }

  return json_data.success;
}

/* 儀錶板 收入, 支出, 年度統計 選單資訊 */
export async function getDashboardMenu() {
  /* 取得使用者時間資訊 */
  const now = new Date();
  const accounting_date = now.toISOString().split("T")[0]; // e.g., "2025-07-03"
  const accounting_time = now.toTimeString().split(" ")[0]; // e.g., "14:33:22"
  const userTime = await userTimeConvert(accounting_date, accounting_time);

  const response = await fetchWithRefresh(`/app/dashboard/date_menu`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      current_utc_time: userTime.currentUTCTime,
      user_time_data: userTime.user_time_data,
      timezone: userTime.timezoneString,
    }),
  });

  const json_data = await response.json();

  if (!response.ok) {
    throw new Error(json_data.message || "取得選單資料失敗");
  }
  return json_data.data;
}
