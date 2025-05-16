// 處理使用者驗證相關 api

export async function userLogin(
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

export async function verificationAccount(
  username: string,
  email: string,
  password: string,
  login_status: number
) {
  // 驗證帳號的 api, 註冊使用
  const response = await fetch("/app/auth/verification/account", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      email,
      password,
      login_status,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "驗證帳號失敗");
  }
  return data;
}

export async function userRegister(
  username: string,
  email: string,
  password: string,
  verification_code: string,
  login_status: number
) {
  const response = await fetch("/app/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      email,
      password,
      verification_code,
      login_status,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "註冊帳號失敗");
  }
  return data;
}

export async function userSupports(
  email: string,
  password: string | null,
  verification_code: string | null,
  new_username: string | null,
  status: number
) {
  // 忘記密碼, 需要先打 status: 1 再打 status: 3, 接下來才是 reset/password
  const response = await fetch("/app/auth/supports", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      verification_code,
      password,
      new_username,
      status,
    }),
  });

  const data = await response.json();
  console.log(data);

  if (!response.ok) {
    throw new Error(data.message || "帳號支援失敗");
  }
  return data;
}

export async function userResetPassword(email: string, new_password: string) {
  const response = await fetch("/app/auth/reset/password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      new_password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "更改密碼失敗");
  }
  return data;
}

export const setToken = (token: string) => {
  /* access token: 放於 localStorage */
  localStorage.setItem("token", token);
};
