/* React */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/* API */
import { userData, userLogout } from "../services/dashboardUser";

/* Components */
import Sidebar from "../components/Sidebar";
import TitleSection from "../components/TitleProps";
import AddAccountingForm from "../components/AddAccountingForm";
import { BoardButtonItems } from "../components/componentProps";
import TransactionTable from "../components/TransactionTable";

/* CSS */
import "../styles/page.css";

// Board items
const boardItems = [
  {
    img: "/board-add-dark.png",
    text: "支出",
    showStatus: 1,
  },
  {
    img: "/board-income-dark.png",
    text: "收入",
    showStatus: 2,
  },
  {
    img: "/board-edit-dark.png",
    text: "編輯",
    showStatus: 3,
  },
];

const AccountingPage = () => {
  /* 選單控制 */
  const [userOperation, setUserOperation] = useState<number>(1); // add = 1, income = 2, edit = 3
  const [queryFilter, setQueryFilter] = useState<boolean>(false); // filter

  /* 使用者資訊 */
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
  /* */

  return (
    <div className="dashboard-full">
      <Sidebar />

      <div className="dashboard-base">
        <TitleSection
          userInfo={userInfo}
          dropdownEvent={{ logout: handleLogout }}
          title="我的記帳本"
          description="隨手記下每一筆花費，讓每一塊錢都不白花！"
        />
        <div className="dashboard-outside">
          <div className="flex items-center justify-between">
            <div className="flex items-center mb-4">
              {boardItems.map((item, idx) => (
                <BoardButtonItems
                  key={idx}
                  img={item.img}
                  text={item.text}
                  isActive={userOperation === item.showStatus}
                  onClick={() => setUserOperation(item.showStatus)}
                />
              ))}
            </div>
            <div className="flex items-center mb-4">
              <BoardButtonItems
                img="/board-filter-dark.png"
                text="篩選"
                isActive={queryFilter}
                onClick={() => setQueryFilter(!queryFilter)}
              />
            </div>
          </div>
          {queryFilter && (
            <div className="dashboard-filter">FILTER section</div>
          )}
          <div
            className={`dashboard-content ${
              userOperation !== 3 ? "justify-between" : ""
            }`}
          >
            {userOperation === 1 && (
              <div className="h-full">
                <AddAccountingForm />
              </div>
            )}
            {userOperation === 1 && (
              <div className="dashboard-right">Figure Details</div>
            )}
            {userOperation === 3 && (
              <div className="h-full min-w-full overflow-x-auto">
                <TransactionTable isEdit={true} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountingPage;
