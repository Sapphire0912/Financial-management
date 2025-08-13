/* React & components */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconInput, ToastBox } from "../components/componentProps";

/* API */
import {
  userLogin,
  verificationAccount,
  userRegister,
  userSupports,
  userResetPassword,
  setToken,
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
  login_status: number = 1,
  showToast: (msg: string, kind: "success" | "error" | "info") => void
): Promise<boolean> => {
  e.preventDefault();

  if (login_status === 2) {
    const result = await userLogin(email, password, 2);
    window.location.href = result.url; // 跳轉到 Line Login 頁面
  }

  if (login_status === 1) {
    const missingFields = [];
    if (!email) missingFields.push("帳號");
    if (!password) missingFields.push("密碼");

    if (missingFields.length > 0) {
      showToast(`${missingFields.join("、")}不可為空`, "error");
      return false;
    }

    try {
      const result = await userLogin(email, password, 1);

      showToast(
        result.success ? "登入成功" : result.message,
        result.success ? "success" : "error"
      );

      if (result.success) {
        setToken(result.token);
        return true;
      }
    } catch (err: unknown) {
      showToast(
        `登入失敗：${err instanceof Error ? err.message : "未知錯誤"}`,
        "error"
      );
    }
  }

  return false; // ✅ 最終保底 return
};

const verification_account = async (
  e: React.FormEvent,
  username: string,
  email: string,
  password: string,
  login_status: number,
  showToast: (msg: string, kind: "success" | "error" | "info") => void
) => {
  e.preventDefault();

  if (login_status === 2) {
    showToast("尚未實作 Line 登入功能", "info");
    return;
  }

  if (login_status === 1) {
    const missingFields: string[] = [];
    if (!username) missingFields.push("使用者名稱");
    if (!email) missingFields.push("帳號");
    if (!password) missingFields.push("密碼");

    if (missingFields.length > 0) {
      showToast(`${missingFields.join("、")}不可為空`, "error");
      return;
    }

    try {
      const result = await verificationAccount(
        username,
        email,
        password,
        login_status
      );
      showToast(`${result.message}`, `${result.success ? "success" : "error"}`);
    } catch (err: unknown) {
      showToast(
        `驗證帳號失敗：${err instanceof Error ? err.message : "未知錯誤"}`,
        "error"
      );
    }
  }
};

const user_register = async (
  e: React.FormEvent,
  username: string,
  email: string,
  password: string,
  verification_code: string,
  login_status: number,
  showToast: (msg: string, kind: "success" | "error" | "info") => void,
  { setShowFormUI }: { setShowFormUI: (v: number) => void }
) => {
  e.preventDefault();
  if (login_status === 1) {
    const missingFields: string[] = [];
    if (!username) missingFields.push("使用者名稱");
    if (!email) missingFields.push("帳號");
    if (!password) missingFields.push("密碼");
    if (!verification_code) missingFields.push("驗證碼");

    if (missingFields.length > 0) {
      showToast(`${missingFields.join("、")}不可為空`, "error");
      return;
    }

    try {
      const result = await userRegister(
        username,
        email,
        password,
        verification_code,
        login_status
      );

      showToast(
        `${result.success ? "註冊成功，即將返回登入畫面" : result.message}`,
        `${result.success ? "success" : "error"}`
      );

      if (result.success) {
        setTimeout(() => {
          setShowFormUI(FORM_LOGIN); // 設定回登入畫面
        }, 2000);
      }
    } catch (err: unknown) {
      showToast(
        `註冊失敗：${err instanceof Error ? err.message : "未知錯誤"}`,
        "error"
      );
    }
  }
};

const account_supports = async (
  e: React.FormEvent,
  email: string,
  password: string,
  verification_code: string | null,
  new_username: string | null,
  status: number,
  showToast: (msg: string, kind: "success" | "error" | "info") => void,
  { setShowFormUI }: { setShowFormUI: (v: number) => void }
) => {
  e.preventDefault();

  // 驗證欄位是否齊全
  const missingFields: string[] = [];
  if (!email) missingFields.push("帳號");
  if (!password) missingFields.push("密碼");
  if (status === 3 && !verification_code) missingFields.push("驗證碼");

  if (missingFields.length > 0) {
    showToast(`${missingFields.join("、")}不可為空`, "error");
    return;
  }

  try {
    const result = await userSupports(
      email,
      password,
      verification_code,
      new_username,
      status
    );

    if (status === 1) {
      showToast(`${result.message}`, `${result.success ? "success" : "error"}`);
      return;
    }

    if (status === 3) {
      if (!result.success) {
        showToast("驗證碼錯誤", "error");
        return;
      }

      const resetResult = await userResetPassword(email, password);
      showToast(
        `${
          resetResult.success
            ? "重設密碼成功，即將返回登入畫面"
            : resetResult.message
        }`,
        `${resetResult.success ? "success" : "error"}`
      );

      if (resetResult.success) {
        setTimeout(() => {
          setShowFormUI(FORM_LOGIN); // 設定回登入畫面
        }, 2000);
      }
    }
  } catch (err) {
    showToast(
      `操作失敗：${err instanceof Error ? err.message : "未知錯誤"}`,
      "error"
    );
  }
};
//

// UI Design
const LoginFormUI = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // 彈跳視窗提示
  const [toast, setToast] = useState({
    show: false,
    message: "",
    kind: "info" as "success" | "error" | "info",
  });

  const showToast = (msg: string, kind: typeof toast.kind) => {
    setToast({ show: true, message: msg, kind });
  };

  // 登入成功後跳轉到 Dashboard 頁面
  const navigate = useNavigate();
  const handle_login = async (e: React.FormEvent) => {
    const login_status = await user_login(e, email, password, 1, showToast);
    if (login_status) {
      navigate("/dashboard");
    }
  };

  return (
    <form className="space-y-4" onSubmit={(e) => handle_login(e)}>
      <IconInput
        type="email"
        placeholder="請輸入Email"
        iconSrc="/email-dark.png"
        onChange={(e) => setEmail(e.target.value)}
      />
      <IconInput
        type="password"
        placeholder="請輸入密碼(最少8個字元)"
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
      {toast.show && (
        <ToastBox
          message={toast.message}
          kind={toast.kind}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </form>
  );
};

const RegisterFormUI = ({
  setShowFormUI,
}: {
  setShowFormUI: (v: number) => void;
}) => {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [code, setCode] = useState<string>("");

  // 彈跳視窗提示
  const [toast, setToast] = useState({
    show: false,
    message: "",
    kind: "info" as "success" | "error" | "info",
  });

  const showToast = (msg: string, kind: typeof toast.kind) => {
    setToast({ show: true, message: msg, kind });
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(e) =>
        user_register(e, username, email, password, code, 1, showToast, {
          setShowFormUI,
        })
      }
    >
      <IconInput
        type="text"
        placeholder="請輸入使用者名稱"
        iconSrc="/user-dark.png"
        onChange={(e) => setUsername(e.target.value)}
      />
      <IconInput
        type="email"
        placeholder="請輸入Email"
        iconSrc="/email-dark.png"
        onChange={(e) => setEmail(e.target.value)}
      />
      <IconInput
        type="password"
        placeholder="請輸入密碼(最少8個字元)"
        iconSrc="/password-dark.png"
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="w-full flex items-center bg-gray-300 rounded-lg px-3 py-2">
        <input
          type="text"
          placeholder="請輸入驗證碼"
          className="flex-1 bg-transparent text-black placeholder-gray-500 focus:outline-none pl-1"
          onChange={(e) => setCode(e.target.value)}
        />
        <button
          type="button"
          className="ml-2 px-3 py-1 bg-slate-200 text-black font-semibold text-sm border border-black rounded-lg whitespace-nowrap hover:brightness-105 transition"
          onClick={(e) =>
            verification_account(e, username, email, password, 1, showToast)
          }
        >
          發送驗證碼
        </button>
      </div>

      <div className="base-flex-column">
        <button
          type="submit"
          className="button-hover w-full bg-gray-800 text-white py-2 rounded-2xl font-semibold mt-2"
        >
          註冊
        </button>
      </div>
      {toast.show && (
        <ToastBox
          message={toast.message}
          kind={toast.kind}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </form>
  );
};

const ForgetFormUI = ({
  setShowFormUI,
}: {
  setShowFormUI: (v: number) => void;
}) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rePassword, setRePassword] = useState<string>("");
  const [code, setCode] = useState<string>("");

  // 彈跳視窗提示
  const [toast, setToast] = useState({
    show: false,
    message: "",
    kind: "info" as "success" | "error" | "info",
  });

  const showToast = (msg: string, kind: typeof toast.kind) => {
    setToast({ show: true, message: msg, kind });
  };

  const check_password = (e: React.FormEvent, status: number) => {
    if (password === rePassword) {
      account_supports(e, email, password, code, null, status, showToast, {
        setShowFormUI,
      });
    } else {
      showToast("密碼兩次不一致", "error");
    }
  };

  return (
    <form className="space-y-4" onSubmit={(e) => check_password(e, 3)}>
      <IconInput
        type="email"
        placeholder="請輸入Email"
        iconSrc="/email-dark.png"
        onChange={(e) => setEmail(e.target.value)}
      />
      <IconInput
        type="password"
        placeholder="請輸入新密碼"
        iconSrc="/password-dark.png"
        onChange={(e) => setPassword(e.target.value)}
      />
      <IconInput
        type="password"
        placeholder="請再次輸入密碼"
        iconSrc="/password_check-dark.png"
        onChange={(e) => setRePassword(e.target.value)}
      />
      <div className="w-full flex items-center bg-gray-300 rounded-lg px-3 py-2">
        <input
          type="text"
          placeholder="請輸入驗證碼"
          className="flex-1 bg-transparent text-black placeholder-gray-500 focus:outline-none pl-1"
          onChange={(e) => setCode(e.target.value)}
        />
        <button
          type="button"
          className="ml-2 px-3 py-1 bg-slate-200 text-black font-semibold text-sm border border-black rounded-lg whitespace-nowrap hover:brightness-105 transition"
          onClick={(e) => check_password(e, 1)}
        >
          發送驗證碼
        </button>
      </div>
      <div className="base-flex-column">
        <button
          type="submit"
          className="button-hover w-full bg-gray-800 text-white py-2 rounded-2xl font-semibold mt-2"
        >
          送出
        </button>
      </div>
      {toast.show && (
        <ToastBox
          message={toast.message}
          kind={toast.kind}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </form>
  );
};
//

// Page
const LoginPage = () => {
  const [showFormUI, setShowFormUI] = useState<number>(FORM_LOGIN);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    kind: "info" as "success" | "error" | "info",
  });

  const ShowToLoginButton = () => {
    return (
      <button
        type="button"
        onClick={() => setShowFormUI(FORM_LOGIN)}
        className="hover:underline hover:text-blue-600"
      >
        返回登入
      </button>
    );
  };

  const ShowToRegisterButton = () => {
    return (
      <button
        type="button"
        onClick={() => setShowFormUI(FORM_REGISTER)}
        className="hover:underline hover:text-blue-600"
      >
        註冊帳號
      </button>
    );
  };

  const ShowToForgetButton = () => {
    return (
      <button
        type="button"
        onClick={() => setShowFormUI(FORM_FORGOT)}
        className="hover:underline hover:text-blue-600"
      >
        忘記密碼？
      </button>
    );
  };

  const showToast = (msg: string, kind: "success" | "error" | "info") => {
    setToast({ show: true, message: msg, kind });
  };

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
          {showFormUI === 0 && <LoginFormUI />}
          {showFormUI === 1 && <RegisterFormUI setShowFormUI={setShowFormUI} />}
          {showFormUI === 2 && <ForgetFormUI setShowFormUI={setShowFormUI} />}
        </div>
        {showFormUI === 0 && (
          <div className="flex justify-between text-sm text-gray-600 w-full mt-1 mb-2 my-2 px-2">
            <ShowToRegisterButton />
            <ShowToForgetButton />
          </div>
        )}
        {showFormUI === 1 && (
          <div className="flex justify-between text-sm text-gray-600 w-full mt-1 mb-2 my-2 px-2">
            <ShowToLoginButton />
            <ShowToForgetButton />
          </div>
        )}
        {showFormUI === 2 && (
          <div className="flex justify-between text-sm text-gray-600 w-full mt-1 mb-2 my-2 px-2">
            <ShowToLoginButton />
            <ShowToRegisterButton />
          </div>
        )}
        <div className="base-flex-column login-form mt-4">
          <button
            type="button"
            className="button-hover w-full bg-green-700 text-white py-2 rounded-2xl font-semibold"
            onClick={async (e) => {
              user_login(e, null, null, 2, showToast);
            }}
          >
            使用 Line 登入
          </button>
        </div>
        {toast.show && (
          <ToastBox
            message={toast.message}
            kind={toast.kind}
            onClose={() => setToast({ ...toast, show: false })}
          />
        )}
      </div>
    </div>
  );
};

export default LoginPage;
