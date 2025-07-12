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

type PlanSettingProps = {
  sort: number;
  label: string;
  isActive: boolean;
  frequency: number | null;
  reach_time: string | null;
  threshold: number | null;
  isEmail: boolean;
  isLine: boolean;
};

export async function updatePlanSetting(plan_setting: PlanSettingProps[]) {
  /* 取得使用者時間資訊 */
  const now = new Date();
  const accounting_date = now.toISOString().split("T")[0];
  const accounting_time = now.toTimeString().split(" ")[0];
  const userTime = await userTimeConvert(accounting_date, accounting_time);

  const response = await fetchWithRefresh(
    `/app/planning/update/${userTime.timezoneString}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(plan_setting),
    }
  );
  const json_data = await response.json();
  if (!response.ok) {
    throw new Error(json_data.message || "更新選單資料失敗");
  }
  return json_data.data;
}
