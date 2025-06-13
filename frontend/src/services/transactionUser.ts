import fetchWithRefresh from "./refresh_token";

// 交易紀錄頁面相關邏輯
export async function getNewTransactionLog() {
  // 在 sidebar 的 components 就需要打此 api
  const response = await fetchWithRefresh("/app/transaction/new/record", {
    method: "GET",
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "伺服器出現未預期錯誤");
  }

  return result.data.count;
}

export async function updateTransactionViewTime() {
  // 使用者瀏覽交易紀錄頁面 2 秒時, 需要打此 api
  const response = await fetchWithRefresh(
    "/app/transaction/last_browser_time",
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "伺服器出現未預期錯誤");
  }

  return true;
}
