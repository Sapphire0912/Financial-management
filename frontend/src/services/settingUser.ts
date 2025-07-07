import fetchWithRefresh from "./refresh_token";
import { userTimeConvert } from "./tools";

/* 處理使用者設定相關 */
export async function getMsgNotifySetting() {
  /* 取得通知設定的表格資料 */

  /* 取得使用者時間資訊 */
  const now = new Date();
  const accounting_date = now.toISOString().split("T")[0];
  const accounting_time = now.toTimeString().split(" ")[0];
  const userTime = await userTimeConvert(accounting_date, accounting_time);

  const response = await fetchWithRefresh(
    `/app/prefer/setting/${userTime.timezoneString}`,
    {
      method: "GET",
    }
  );

  const json_data = await response.json();

  if (!response.ok) {
    throw new Error(json_data.message || "取得選單資料失敗");
  }

  return json_data.data;
}

type MsgNotifySettingProps = {
  sort: number;
  label: string;
  isActive: boolean;
  frequency: number | null;
  time: string | null;
  threshold: number | null;
  isEmail: boolean;
  isLine: boolean;
};

export async function updateMsgNotifySetting(
  msgNotifySetting: MsgNotifySettingProps[]
) {
  /* 取得使用者時間資訊 */
  const now = new Date();
  const accounting_date = now.toISOString().split("T")[0];
  const accounting_time = now.toTimeString().split(" ")[0];
  const userTime = await userTimeConvert(accounting_date, accounting_time);

  /*  更新訊息通知設定 */
  console.log("userTime: ", userTime.timezoneString);
  const response = await fetchWithRefresh(
    `/app/prefer/setting/update/${userTime.timezoneString}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(msgNotifySetting),
    }
  );

  const json_data = await response.json();
  if (!response.ok) {
    throw new Error(json_data.message || "更新選單資料失敗");
  }
  return json_data.data;
}
