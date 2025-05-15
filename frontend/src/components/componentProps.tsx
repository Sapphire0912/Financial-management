import { useEffect } from "react";

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
  // 設定 3 秒自動關閉
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor =
    kind === "success"
      ? "bg-green-600"
      : kind === "error"
      ? "bg-red-600"
      : "bg-gray-700";

  return (
    <div
      className={`fixed top-4 right-4 z-50 px-4 py-2 text-white rounded shadow-lg ${bgColor}`}
    >
      <div className="flex justify-between items-center gap-4">
        <span>{message}</span>
        <button
          type="button"
          onClick={onClose}
          className="text-white font-bold"
        >
          ×
        </button>
      </div>
    </div>
  );
};
