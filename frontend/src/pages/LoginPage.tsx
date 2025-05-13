/* React & components */
import { useState } from "react";
import IconInput from "../components/componentProps";

/* API */
import {
  userLogin,
  verificationAccount,
  userRegister,
  userSupports,
  userResetPassword,
} from "../services/userAuth";

/* CSS */
import "../styles/page.css";
import "../styles/component.css";

// Global Variable
/* 判斷顯示 登入, 註冊, 忘記密碼的 UI */
const FORM_LOGIN = 0;
const FORM_REGISTER = 1;
const FORM_FORGOT = 2;
//

// Call API
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

const verification_account = async (e: React.FormEvent) => {
  e.preventDefault();
};
//

// UI Design
const LoginFormUI = () => {
  const [email, setEmail] = useState<string | null>("");
  const [password, setPassword] = useState<string | null>("");

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => user_login(e, email, password, null, null, 1)}
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
          className="button-hover w-full bg-gray-800 text-white py-2 rounded-2xl font-semibold mt-2"
        >
          登入
        </button>
      </div>
    </form>
  );
};

const RegisterFormUI = () => {
  // 待設計 (api 順序 verification_account -> signup)
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [code, setCode] = useState<string>("");

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => user_login(e, email, password, null, null, 1)}
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
          className="button-hover w-full bg-gray-800 text-white py-2 rounded-2xl font-semibold mt-2"
        >
          登入2
        </button>
      </div>
    </form>
  );
};

const ForgetFormUI = () => {
  // 待設計 (需打 supports api)

  const [email, setEmail] = useState<string | null>("");
  const [password, setPassword] = useState<string | null>("");

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => user_login(e, email, password, null, null, 1)}
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
          className="button-hover w-full bg-gray-800 text-white py-2 rounded-2xl font-semibold mt-2"
        >
          登入3
        </button>
      </div>
    </form>
  );
};
//

// Page
const LoginPage = () => {
  const [showFormUI, setShowFormUI] = useState<number>(FORM_LOGIN);

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
        <div className="login-form">
          {showFormUI == 0 && LoginFormUI()}
          {showFormUI == 1 && RegisterFormUI()}
          {showFormUI == 2 && ForgetFormUI()}
        </div>
        <div className="flex justify-between text-sm text-gray-600 w-full mt-1 mb-2 my-2 px-2">
          <button
            type="button"
            onClick={() => setShowFormUI(FORM_REGISTER)}
            className="hover:underline hover:text-blue-600"
          >
            註冊帳號
          </button>
          <button
            type="button"
            onClick={() => setShowFormUI(FORM_FORGOT)}
            className="hover:underline hover:text-blue-600"
          >
            忘記密碼？
          </button>
        </div>
        <div className="base-flex-column login-form mt-4">
          <button
            type="button"
            className="button-hover w-full bg-green-700 text-white py-2 rounded-2xl font-semibold"
          >
            使用 Line 登入
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
