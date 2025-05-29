export async function userTimeConvert(
  accounting_date: string,
  accounting_time: string
) {
  /* 給後端的時間資料 */
  const user_time_data: string = `${accounting_date}T${accounting_time}`;

  // 使用者時區
  const userTimezone: number = -(new Date().getTimezoneOffset() / 60);
  const timezoneString: string = `UTC${
    userTimezone >= 0 ? "+" : ""
  }${userTimezone}`;

  // 當前 UTC 時間（例如：用於伺服器校時比較）
  const currentUTCTime: string = new Date().toISOString();

  return { user_time_data, timezoneString, currentUTCTime };
}
