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

const LoginPage = () => {
  const [email, setEmail] = useState<string | null>("");
  const [password, setPassword] = useState<string | null>("");
  const [line_user_name, setLineUsername] = useState<string | null>(null);
  const [line_user_id, setLineUserId] = useState<string | null>(null);

  return (
    <div>
      <div>
        <h1>登入</h1>
        <form
          className="space-y-4"
          onSubmit={(e) =>
            user_login(e, email, password, line_user_name, line_user_id, 1)
          }
        >
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="密碼"
            className="w-full px-4 py-2 border rounded"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            登入
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
