import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/* Components */
import { MenuIcons } from "./componentProps";

/* CSS */
import "../styles/component.css";

/* Sidebar Menu items */
const menuItems = [
  {
    img: "/homepage-dark.png",
    text: "總覽",
    path: "/dashboard",
  },
  {
    img: "/accounting-dark.png",
    text: "記帳",
    path: "/accounting",
  },
  {
    img: "/analyze-dark.png",
    text: "分析",
    path: "/analyze",
  },
  {
    img: "/transaction-dark.png",
    text: "交易紀錄",
    path: "/history",
    amount: 0,
  },
  {
    img: "/notification-dark.png",
    text: "通知",
    path: "/notification",
    amount: 0,
  },
  {
    img: "/setting-dark.png",
    text: "設定",
    path: "/setting",
  },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="h-screen w-64 bg-white border-r border-slate-400 px-4 py-6 shadow-2xl flex-column items-center">
      <div className="flex items-center justify-start mb-10">
        <img
          src="/sidebar-logo-dark.png"
          alt="finanical"
          className="w-8 h-8 mr-2 "
        />
        <h3 className="font-semibold text-2xl text-bold">Financial</h3>
      </div>
      <div className="px-1">
        <h3 className="font-semibold text-xl py-2">選單</h3>
        {menuItems.map((item, idx) => {
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
