import { createContext, useContext } from "react";

// ---------- 型別定義 ----------
export type MenuItem = {
  img: string;
  text: string;
  path: string;
  amount?: number;
};

export type MenuContextType = {
  menuList: MenuItem[];
  setMenuList: React.Dispatch<React.SetStateAction<MenuItem[]>>;
};

// ---------- Context ----------
export const MenuContext = createContext<MenuContextType | undefined>(
  undefined
);

// ---------- 預設選單 ----------
export const defaultMenuItems: MenuItem[] = [
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
    img: "/investing-dark.png",
    text: "投資&存錢計畫",
    path: "/investing",
  },
  {
    img: "/setting-dark.png",
    text: "設定",
    path: "/setting",
  },
];

// ---------- Hook ----------
export const useMenu = (): MenuContextType => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error("useMenu 必須在 MenuProvider 裡使用");
  }
  return context;
};
