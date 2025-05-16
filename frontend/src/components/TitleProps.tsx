import { useState, useRef } from "react";

import "../styles/page.css";
import "../styles/component.css";

/* args data type */
type userInfoProp = {
  userInfo: {
    username: string;
    email: string;
  };
  dropdownEvent: {
    logout: () => void;
  };
};

/* 使用者個人資料選單 Component */
const UserDropDownUI = ({ userInfo, dropdownEvent }: userInfoProp) => {
  // 使用者選單控制
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement>(null);

  const [showDropdown, setShowDropdown] = useState(false);
  const toggleDropdown = () => {
    if (showDropdown) {
      setIsOpen(false);
      setTimeout(() => setShowDropdown(false), 200);
    } else {
      setShowDropdown(true);
      setTimeout(() => setIsOpen(true), 0);
    }
  };

  return (
    <div
      className={`relative inline-block text-left bg-slate-100 border border-slate-300 min-w-60 px-4 py-2 ${
        isOpen ? "rounded-t-xl" : "rounded-full"
      }`}
      ref={ref}
    >
      <button
        type="button"
        onClick={toggleDropdown}
        className="flex items-center gap-3 w-full button-hover"
      >
        <img
          src="/user-dropdown-dark.png"
          alt="avatar"
          className="w-10 h-10 rounded-full border"
        />

        <div className="flex-1 text-left">
          <p className="font-semibold text-base text-black leading-none mb-1">
            {userInfo.username || "loading..."}
          </p>
          <p className="text-xs text-gray-500 leading-none">
            {userInfo.email || "loading..."}
          </p>
        </div>

        <img src="/triangle-dark.png" alt="toggle" className="w-4 h-4" />
      </button>
      {isOpen && (
        <div className="absolute left-0 mt-2 w-full bg-slate-100 border border-slate-300 rounded-b-xl shadow-lg z-50 py-2 dropdown-item-animation-in">
          <button type="button" className="dropdown-item">
            <img
              src="/edit-profile-dark.png"
              alt="個人資料"
              className="dropdown-item-img"
            />
            <span className="text-gray-800">個人資料</span>
          </button>

          <button type="button" className="dropdown-item">
            <img
              src="/setting-dark.png"
              alt="設定"
              className="dropdown-item-img"
            />
            <span className="text-gray-800">設定</span>
          </button>

          <button
            type="button"
            className="dropdown-item"
            onClick={dropdownEvent.logout}
          >
            <img
              src="/logout-dark.png"
              alt="登出"
              className="dropdown-item-img"
            />
            <span className="text-red-500">登出</span>
          </button>
        </div>
      )}
    </div>
  );
};

/* 儀錶板左側選單 */
const MenuUI = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggleMenu = () => setIsOpen((prev) => !prev);

  return (
    <div>
      <button type="button" onClick={toggleMenu}>
        <img src="/menu-dark.png" alt="menu" />
      </button>
    </div>
  );
};

const TitleSection = ({ userInfo, dropdownEvent }: userInfoProp) => {
  return (
    <div className="flex items-center py-3 border border-red-400">
      <MenuUI />

      <div>
        <h3 className="font-semibold text-xl">財務總覽</h3>
        <p>即時追蹤收支、設定目標，掌握每一筆開銷。</p>
      </div>

      <UserDropDownUI userInfo={userInfo} dropdownEvent={dropdownEvent} />
    </div>
  );
};

export default TitleSection;
