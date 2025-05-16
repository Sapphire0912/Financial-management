// 處理 Dashboard 首頁與使用者驗證資訊相關的 API
export async function userData(token: string | null) {
  if (!token) throw new Error("Token 不可為空");

  const response = await fetch("/app/dashboard/", {
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

export async function userLogout() {
  // Cookie 由後端清除
  localStorage.removeItem("token");

  const response = await fetch("/app/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  const json_data = await response.json();

  if (!response.ok) {
    throw new Error(json_data.message || "登出失敗");
  }

  return json_data.success;
}
