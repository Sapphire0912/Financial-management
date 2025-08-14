import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/* API */
import { userLineLogin } from "../services/userAuth";

// 儲存 Line Login Callback 的 query token
const RedirectPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 接收 Line Login Callback 的參數
    const fetchData = async () => {
      const code = new URLSearchParams(window.location.search).get("code");
      const state = new URLSearchParams(window.location.search).get("state");

      if (code && state) {
        const data = await userLineLogin(code, state);
        if (data.success) {
          localStorage.setItem("token", data.token);
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      }
    };
    fetchData();
  }, [navigate]);

  return <div>登入跳轉中，請稍後...</div>;
};

export default RedirectPage;
