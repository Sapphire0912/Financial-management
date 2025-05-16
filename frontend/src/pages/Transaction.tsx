/* React */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/* API */
import { userData, userLogout } from "../services/dashboardUser";

/* Components */
import TitleSection from "../components/TitleProps";
import Sidebar from "../components/Sidebar";

/* CSS */
import "../styles/page.css";

const TransactionPage = () => {
  const [userInfo, setUserInfo] = useState({ username: "", email: "" });

  // 使用者登出
  const navigate = useNavigate();
  const handleLogout = async () => {
    const result = await userLogout();
    if (result) navigate("/");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await userData(localStorage.getItem("token"));
        setUserInfo({ username: data.username, email: data.email });
      } catch (err) {
        console.error("取得使用者資料失敗：", err);
        // 未來要改成 ErrorPage.tsx 的設計
      }
    };

    fetchData();
  }, []);
  return (
    <div className="dashboard-full">
      <Sidebar />

      <div className="dashboard-base">
        <TitleSection
          userInfo={userInfo}
          dropdownEvent={{ logout: handleLogout }}
          title="交易紀錄"
          description="查看你過去的每一筆收支，清楚掌握金流明細"
        />
        Transaction History Page Enter~!
      </div>
    </div>
  );
};

export default TransactionPage;
