// 處理使用者驗證相關 api

async function userLogin(
  email: string | null,
  password: string | null,
  line_user_name: string | null = null,
  line_user_id: string | null = null,
  login_status: number = 1
) {
  const response = await fetch("/app/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      line_user_name,
      line_user_id,
      login_status,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "登入失敗");
  }
  return data;
}

export default userLogin;
