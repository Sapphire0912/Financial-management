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

type PageContentProp = {
  title: string;
  description?: string;
};

type TitleSectionProps = {
  userInfo: userInfoProp["userInfo"];
  dropdownEvent: userInfoProp["dropdownEvent"];
  title: PageContentProp["title"];
  description?: PageContentProp["description"];
};

export const PageContent = ({ title, description }: PageContentProp) => {
  /* 不同頁面標題與敘述文字 */
  return (
    <div>
      <h3 className="font-semibold text-xl mb-2">{title}</h3>
      <p className="text-gray-800 text-sm">{description}</p>
    </div>
  );
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

const TitleSection = ({
  userInfo,
  dropdownEvent,
  title,
  description,
}: TitleSectionProps) => {
  return (
    <div className="flex items-center py-3 justify-between">
      <PageContent title={title} description={description} />
      <UserDropDownUI userInfo={userInfo} dropdownEvent={dropdownEvent} />
    </div>
  );
};

export default TitleSection;
