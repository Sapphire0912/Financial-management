import { useState, useEffect } from "react";

/* 元件 Props */

type IconInputProps = {
  type: string;
  placeholder: string;
  iconSrc: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export const IconInput = ({
  type,
  placeholder,
  iconSrc,
  onChange,
}: IconInputProps) => (
  /* Login Input Form Pattern */
  <div className="w-full flex items-center bg-gray-300 rounded-lg px-3 py-2">
    <img src={iconSrc} alt="icon" className="w-6 h-6 mr-2" />
    <input
      type={type}
      placeholder={placeholder}
      className="w-full bg-transparent text-black placeholder-gray-500 focus:outline-none pl-1"
      onChange={onChange}
      minLength={type === "password" ? 8 : undefined}
    />
  </div>
);

// 提示訊息視窗
type ToastBoxProps = {
  message: string;
  kind: "success" | "error" | "info";
  onClose: () => void; // 不需要接收事件參數
};

export const ToastBox = ({ message, kind, onClose }: ToastBoxProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true); // 觸發淡入動畫

    const hideTimer = setTimeout(() => {
      setVisible(false); // 觸發淡出動畫
      setTimeout(onClose, 500); // 等動畫完再呼叫 onClose
    }, 2000);

    return () => clearTimeout(hideTimer);
  }, [onClose]);

  const bgColor =
    kind === "success"
      ? "bg-green-400"
      : kind === "error"
      ? "bg-red-400"
      : "bg-gray-600";

  return (
    <div
      className={`
          fixed left-1/2 top-[75%] transform -translate-x-1/2 z-50
          px-4 py-2 text-white rounded shadow-lg ${bgColor}
          transition-all duration-500 ease-in-out
          ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
        `}
    >
      <div className="flex justify-between items-center gap-4">
        <span>{message}</span>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="text-white font-bold"
        >
          ×
        </button>
      </div>
    </div>
  );
};

/* 側邊選單物件 */
type SideMenuItemProp = {
  img: string;
  text: string;
  amount?: number;
  isActive?: boolean;
  onClick: () => void;
};

export const MenuIcons = ({
  img,
  text,
  amount,
  isActive,
  onClick,
}: SideMenuItemProp) => {
  return (
    <button
      type="button"
      className={`w-full flex items-center justify-between px-3 py-4 rounded-lg cursor-pointer transition ${
        isActive
          ? "bg-gray-200 font-semibold text-black"
          : "hover:bg-gray-100 text-gray-800"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 text-left">
        <img src={img} alt={text} className="w-5 h-5 object-contain" />
        <span className="text-base">{text}</span>
      </div>
      {amount !== undefined && (
        <span className="bg-gray-200 text-xs text-gray-700 px-2 py-0.5 rounded-full">
          {amount}
        </span>
      )}
    </button>
  );
};
