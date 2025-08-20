/* React */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/* API */
import { userData, userLogout } from "../services/dashboardUser";

/* Components */
import Sidebar from "../components/screen/Sidebar";
import TitleSection from "../components/screen/TitleProps";
import AddAccountingForm from "../components/accounting/AddAccountingForm";
import IncomeAccountingForm from "../components/accounting/IncomeAccountingForm";
import { BoardButtonItems } from "../components/componentProps";
import TransactionTable from "../components/transactions/TransactionTable";
import FilterForm from "../components/FilterForm";
import { AccountingChart } from "../components/accounting/AccountingChart";

/* CSS */
import "../styles/page.css";

// Board items
const boardItems = [
  {
    img: "/board-add-dark.png",
    text: "支出",
    showStatus: 1,
    filterStatus: "0",
  },
  {
    img: "/board-income-dark.png",
    text: "收入",
    showStatus: 2,
    filterStatus: "1",
  },
  {
    img: "/board-edit-dark.png",
    text: "編輯",
    showStatus: 3,
  },
];

type FilterRow = {
  field: string;
  operator: string;
  value: string;
  matchMode?: string;
  sortOrder?: string;
};

const AccountingPage = () => {
  /* 選單控制 */
  const [userOperation, setUserOperation] = useState<number>(1); // add = 1, income = 2

  /* 篩選功能 */
  const [queryFilter, setQueryFilter] = useState<boolean>(false); // filter
  const [filterQuery, setFilterQuery] = useState<FilterRow[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("0");

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
                  onClick={() => {
                    setUserOperation(item.showStatus);
                    if (item.showStatus !== 3)
                      setFilterStatus(item.filterStatus || "");
                  }}
                />
              ))}
            </div>
            <div className="relative">
              <BoardButtonItems
                img="/board-filter-dark.png"
                text="篩選"
                isActive={queryFilter}
                onClick={() => setQueryFilter(!queryFilter)}
              />
              {queryFilter && (
                <div className="dashboard-filter">
                  <FilterForm
                    filterStatus={filterStatus}
                    onClose={() => setQueryFilter(false)}
                    setFilterQuery={setFilterQuery}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="dashboard-content">
            <div
              className={`h-full ${
                userOperation === 3 ? "min-w-full overflow-x-auto" : "w-1/2"
              }`}
            >
              {userOperation === 1 && <AddAccountingForm />}
              {userOperation === 2 && <IncomeAccountingForm />}
              {userOperation === 3 && (
                <TransactionTable
                  per_page={12}
                  filterStatus={filterStatus}
                  filterQuery={filterQuery}
                  setFilterStatus={setFilterStatus}
                  isEdit={true}
                />
              )}
            </div>
            {userOperation !== 3 && (
              <div className="h-full w-1/2 flex flex-col items-center">
                <div className="w-1/2 flex flex-col p-4 space-y-4">
                  <div className="border rounded-lg p-4 flex justify-center items-center">
                    <AccountingChart filterStatus={filterStatus} />
                  </div>

                  <div className="border rounded-lg p-4 overflow-auto">
                    Tables, 總類別的資料
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountingPage;
