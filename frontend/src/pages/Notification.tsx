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

const NotificationPage = () => {
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
        setUserInfo({
          username: data.username || data.line_user_name,
          email: data.email || data.line_user_id,
        });
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
          title="通知中心"
          description="即時掌握系統提醒與財務異動，重要資訊不漏接！"
        />
        <div className="dashboard-outside flex flex-col">
          <div className="grid grid-cols-2 gap-4">
            <div>記帳操作通知</div>
            <div>設定提醒通知</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
