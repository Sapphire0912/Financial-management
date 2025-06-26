/* React */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/* API */
import { userData, userLogout } from "../services/dashboardUser";

/* Components */
import TitleSection from "../components/screen/TitleProps";
import Sidebar from "../components/screen/Sidebar";

/* CSS */
import "../styles/page.css";

// Call API

//

const DashBoardPage = () => {
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
          title="財務總覽"
          description="即時追蹤收支、設定目標，掌握每一筆開銷。"
        />
        <div className="dashboard-outside"> DashBoardPage Enter~!</div>
      </div>
    </div>
  );
};

export default DashBoardPage;
