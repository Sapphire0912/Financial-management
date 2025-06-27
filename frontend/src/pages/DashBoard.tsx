/* React */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/* API */
import { userData, userLogout } from "../services/dashboardUser";

/* Components */
import TitleSection from "../components/screen/TitleProps";
import Sidebar from "../components/screen/Sidebar";
import MyBalance from "../components/dashboard/Balance";
import MyIncome from "../components/dashboard/Income";
import MyExpense from "../components/dashboard/Expense";
import MyRemaining from "../components/dashboard/Remaining";
import MyYearStatistics from "../components/dashboard/Statistics";

/* CSS */
import "../styles/page.css";
import "../styles/component.css";

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
        <div className="dashboard-outside flex flex-col">
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-12 md:col-span-4 bg-white rounded-2xl p-4 shadow">
              <MyBalance />
            </div>
            <div className="col-span-12 md:col-span-4 bg-white rounded-2xl p-4 shadow">
              <MyIncome />
            </div>
            <div className="col-span-12 md:col-span-4 bg-white rounded-2xl p-4 shadow">
              <MyExpense />
            </div>
          </div>
          <div className="grid grid-cols-12 gap-4 grow mb-4">
            <div className="col-span-12 md:col-span-7 bg-white rounded-2xl pt-4 pb-2 px-4 shadow">
              <MyYearStatistics />
            </div>
            <div className="col-span-12 md:col-span-5 bg-white rounded-2xl pt-4 pb-2 px-4 shadow">
              <MyRemaining />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashBoardPage;
