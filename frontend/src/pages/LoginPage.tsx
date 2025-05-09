import { useState } from "react";
import userLogin from "../services/userAuth";

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
      <input
        type="email"
        placeholder="Email"
        className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="密碼"
        className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2 rounded-lg font-semibold hover:brightness-110 transition"
      >
        登入
      </button>
    </form>
  );
};

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-blue-200">
      <div className="">TEST</div>
    </div>
  );
};

export default LoginPage;
