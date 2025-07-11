import fetchWithRefresh from "./refresh_token";
import { userTimeConvert } from "./tools";

export async function getPlanSetting() {
  /* 取得理財計畫表格資料 */

  /* 取得使用者時間資訊 */
  const now = new Date();
  const accounting_date = now.toISOString().split("T")[0];
  const accounting_time = now.toTimeString().split(" ")[0];
  const userTime = await userTimeConvert(accounting_date, accounting_time);

  const response = await fetchWithRefresh(
    `/app/planning/${userTime.timezoneString}`,
    {
      method: "GET",
    }
  );
  const json_data = await response.json();
  if (!response.ok) {
    throw new Error(json_data.message || "取得理財計畫表格資料失敗");
  }
  return json_data.data;
}

export async function updatePlanSetting() {
  return;
}
