import React from "react";

const LoginPage = () => {
  return (
    <div>
      <div>
        <h1>登入!~</h1>
        <form className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded"
          />
          <input
            type="password"
            placeholder="密碼"
            className="w-full px-4 py-2 border rounded"
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
