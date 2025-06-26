const fetchWithRefresh = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");

  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  // 如果 token 過期（401），嘗試 refresh
  if (res.status === 401) {
    const refreshRes = await fetch("/app/auth/verification/token", {
      method: "POST",
      credentials: "include", // refresh_token 是 cookie 要加上 credentials
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!refreshRes.ok) {
      throw new Error("Token 已過期請重新登入。");
    }

    const data = await refreshRes.json();
    localStorage.setItem("token", data.token);

    // 重新嘗試原本的請求
    const retry = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${data.token}`,
      },
    });

    return retry;
  }

  return res;
};

export default fetchWithRefresh;
