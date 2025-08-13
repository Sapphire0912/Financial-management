import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// 儲存 Line Login Callback 的 query token
const RedirectPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (token) {
      localStorage.setItem("token", token);
      navigate("/dashboard", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  return <div>RedirectPage</div>;
};

export default RedirectPage;
