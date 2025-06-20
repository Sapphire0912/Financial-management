/* React */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/* API */
import { userData, userLogout } from "../services/dashboardUser";
import { updateTransactionViewTime } from "../services/transactionUser";

/* Components */
import TitleSection from "../components/TitleProps";
import Sidebar from "../components/Sidebar";
import { BoardButtonItems } from "../components/componentProps";
import TransactionTable from "../components/TransactionTable";
import FilterForm from "../components/FilterForm";

/* CSS */
import "../styles/page.css";

/* Menu Context */
import { useMenu } from "../hooks/sidebarMenu";

type FilterRow = {
  field: string;
  operator: string;
  value: string;
  matchMode?: string;
  sortOrder?: string;
};

const TransactionPage = () => {
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

  // 動態取得交易紀錄通知的
  const { setMenuList } = useMenu();

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

  useEffect(() => {
    // 進入 1s 之後才判斷是頁面瀏覽中
    const timer = setTimeout(async () => {
      const result = await updateTransactionViewTime();
      if (result) {
        setMenuList((prev) =>
          prev.map((item) =>
            item.text === "交易紀錄" ? { ...item, amount: 0 } : item
          )
        );
      }
    }, 1000);

    return () => clearTimeout(timer); // 清除 timeout 避免 memory leak
  }, [setMenuList]);

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
        <div className="dashboard-outside">
          <div className="flex items-center justify-end">
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
            <div className="h-full min-w-full overflow-x-auto">
              <TransactionTable
                per_page={20}
                filterStatus={filterStatus}
                filterQuery={filterQuery}
                setFilterStatus={setFilterStatus}
                isEdit={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionPage;
