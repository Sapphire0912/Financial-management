import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/* Components */
import { MenuIcons } from "./componentProps";

/* CSS */
import "../styles/component.css";

/* API */
import { getNewTransactionLog } from "../services/transactionUser";

/* Menu Context */
import { useMenu } from "../hooks/sidebarMenu";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 動態取得交易紀錄通知的
  const { menuList, setMenuList } = useMenu();

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const count = await getNewTransactionLog();
        setMenuList((prev) =>
          prev.map((item) =>
            item.text === "交易紀錄" ? { ...item, amount: count } : item
          )
        );
      } catch (err) {
        console.error("讀取交易紀錄失敗", err);
      }
    };

    fetchCount();
  }, [setMenuList]);

  return (
    <aside className="h-screen w-64 bg-white border-r border-slate-400 px-4 py-6 shadow-2xl flex-column items-center">
      <div className="flex items-center justify-start mb-10">
        <img
          src="/sidebar-logo-dark.png"
          alt="finanical"
          className="w-8 h-8 mr-2"
        />
        <h3 className="font-semibold text-2xl text-bold">Financial</h3>
      </div>
      <div className="px-1">
        <h3 className="font-semibold text-xl py-2">選單</h3>
        {menuList.map((item, idx) => {
          const isActive = location.pathname === item.path;
          return (
            <MenuIcons
              key={idx}
              img={item.img}
              text={item.text}
              amount={item.amount}
              isActive={isActive}
              onClick={() => navigate(item.path)}
            />
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
