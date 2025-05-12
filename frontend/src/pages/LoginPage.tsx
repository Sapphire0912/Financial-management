import { useState } from "react";
import userLogin from "../services/userAuth";
import "../styles/page.css";
import "../styles/component.css";

const user_login = async (
  e: React.FormEvent,
  email: string | null,
  password: string | null,
  line_user_name: string | null,
  line_user_id: string | null,
  login_status: number = 1
) => {
  e.preventDefault();
  try {
    const result = await userLogin(
      email,
      password,
      line_user_name,
      line_user_id,
      login_status
    );
    alert("✅ 登入成功");
    console.log(result);
  } catch (err: unknown) {
    alert(`❌ 登入失敗：${err instanceof Error ? err.message : "未知錯誤"}`);
  }
};

type IconInputProps = {
  type: string;
  placeholder: string;
  iconSrc: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const IconInput = ({
  type,
  placeholder,
  iconSrc,
  onChange,
}: IconInputProps) => (
  <div className="w-full flex items-center bg-gray-300 rounded-lg px-3 py-2">
    <img src={iconSrc} alt="icon" className="w-6 h-6 mr-2" />
    <input
      type={type}
      placeholder={placeholder}
      className="w-full bg-transparent text-black placeholder-gray-500 focus:outline-none pl-1"
      onChange={onChange}
    />
  </div>
);

const login_form_ui = () => {
  const [email, setEmail] = useState<string | null>("");
  const [password, setPassword] = useState<string | null>("");
  const [line_user_name, setLineUsername] = useState<string | null>(null);
  const [line_user_id, setLineUserId] = useState<string | null>(null);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) =>
        user_login(e, email, password, line_user_name, line_user_id, 1)
      }
    >
      <IconInput
        type="email"
        placeholder="請輸入Email"
        iconSrc="/email-dark.png"
        onChange={(e) => setEmail(e.target.value)}
      />
      <IconInput
        type="password"
        placeholder="請輸入密碼"
        iconSrc="/password-dark.png"
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="base-flex-column">
        <button
          type="submit"
          className="button-hover w-full bg-gray-800 text-white py-2 rounded-2xl font-semibold mt-2 mb-4"
        >
          登入
        </button>
        <button
          type="button"
          className="button-hover w-full bg-green-700 text-white py-2 rounded-2xl font-semibold mt-2"
        >
          使用 Line 登入
        </button>
      </div>
    </form>
  );
};

const LoginPage = () => {
  return (
    <div className="background base-flex-column">
      <div className="login-card base-flex-column">
        <div className="bg-transparent base-flex-row px-2 py-2">
          <img src="/dollar_bag-dark.png" alt="dollar bag icon" />
        </div>
        <div className="base-flex-column">
          <h3 className="text-2xl font-bold text-center p-2">財務管理小助手</h3>
          <p className="text-center text-gray-700 p-2">
            輕鬆追蹤支出與收入，掌握財務全貌。
            <br />
            讓智慧助手協助你做更聰明的財務決策！
          </p>
        </div>
        <div className="login-form">{login_form_ui()}</div>
      </div>
    </div>
  );
};

export default LoginPage;
