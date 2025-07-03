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

/* 儀錶板: 餘額 */
export async function getUserBalance() {
  /* 取得使用者時間資訊 */
  const now = new Date();
  const accounting_date = now.toISOString().split("T")[0]; // e.g., "2025-07-03"
  const accounting_time = now.toTimeString().split(" ")[0]; // e.g., "14:33:22"
  const userTime = await userTimeConvert(accounting_date, accounting_time);

  const response = await fetchWithRefresh(`/app/dashboard/balance/info`, {
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

/* 儀錶板: 收入 */
export async function getUserIncome(menu: string) {
  /* 取得使用者時間資訊 */
  const now = new Date();
  const accounting_date = now.toISOString().split("T")[0]; // e.g., "2025-07-03"
  const accounting_time = now.toTimeString().split(" ")[0]; // e.g., "14:33:22"
  const userTime = await userTimeConvert(accounting_date, accounting_time);

  const response = await fetchWithRefresh(`/app/dashboard/income/info`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      current_utc_time: userTime.currentUTCTime,
      user_time_data: userTime.user_time_data,
      timezone: userTime.timezoneString,
      menu,
    }),
  });

  const json_data = await response.json();

  if (!response.ok) {
    throw new Error(json_data.message || "取得選單資料失敗");
  }
  return json_data.data;
}

/* 儀錶板: 輸出 */
export async function getUserExpense(menu: string) {
  /* 取得使用者時間資訊 */
  const now = new Date();
  const accounting_date = now.toISOString().split("T")[0]; // e.g., "2025-07-03"
  const accounting_time = now.toTimeString().split(" ")[0]; // e.g., "14:33:22"
  const userTime = await userTimeConvert(accounting_date, accounting_time);

  const response = await fetchWithRefresh(`/app/dashboard/expense/info`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      current_utc_time: userTime.currentUTCTime,
      user_time_data: userTime.user_time_data,
      timezone: userTime.timezoneString,
      menu,
    }),
  });

  const json_data = await response.json();

  if (!response.ok) {
    throw new Error(json_data.message || "取得選單資料失敗");
  }
  return json_data.data;
}

/* 儀錶板: 年度統計 */
export async function getYearStatistics(menu: string) {
  /* 取得使用者時間資訊 */
  const now = new Date();
  const accounting_date = now.toISOString().split("T")[0]; // e.g., "2025-07-03"
  const accounting_time = now.toTimeString().split(" ")[0]; // e.g., "14:33:22"
  const userTime = await userTimeConvert(accounting_date, accounting_time);

  const response = await fetchWithRefresh(
    `/app/dashboard/year/statistics/info`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        current_utc_time: userTime.currentUTCTime,
        user_time_data: userTime.user_time_data,
        timezone: userTime.timezoneString,
        menu,
      }),
    }
  );

  const json_data = await response.json();

  if (!response.ok) {
    throw new Error(json_data.message || "取得選單資料失敗");
  }

  // 回傳 chart.js 的 Bar chart 格式
  const chartData = {
    labels: [
      "一月",
      "二月",
      "三月",
      "四月",
      "五月",
      "六月",
      "七月",
      "八月",
      "九月",
      "十月",
      "十一月",
      "十二月",
    ],
    datasets: [
      {
        label: "收入",
        data: json_data.data.income,
        backgroundColor: "#235F45",
        borderRadius: 8,
        stack: "stack1",
      },
      {
        label: "支出",
        data: json_data.data.expense,
        backgroundColor: "#C3EB4D",
        borderRadius: 8,
        stack: "stack2",
      },
    ],
  };
  return chartData;
}
