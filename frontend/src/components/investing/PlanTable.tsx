import { useState, useEffect } from "react";

/* API */

const InvestingPlanTable = () => {
  return (
    <table className="table-auto w-full">
      {/* 調整每個欄位的寬度 */}
      <colgroup>
        <col className="w-[60%]" />
        <col className="w-[20%]" />
        <col className="w-[20%]" />
      </colgroup>
      <thead>
        <th className="px-4 py-2 text-left text-xl">計畫項目</th>
        <th className="px-4 py-2 text-xl">Email 通知</th>
        <th className="px-4 py-2 text-xl">Line 通知</th>
      </thead>
      <tbody>
        <tr>
          <td className="px-4 py-2 flex items-center">
            <select
              className="bg-slate-100 border border-gray-300 rounded-lg px-4 py-1 shadow-sm transition-all duration-150 hover:cursor-pointer"
              aria-label="budget_setting_menu"
            >
              <option>每天</option>
            </select>
            <span className="ml-2 text-slate-600 font-semibold text-lg">
              花費預算設定 ⭢ $
            </span>
            <input
              className="mx-2 w-16 border-slate-400 text-center border-b-2 focus:outline-none "
              type="number"
              placeholder="金額"
              min={0}
            />
          </td>
          <td className="px-4 py-2 text-slate-600 font-semibold text-center text-lg">
            <img className="mx-auto w-8 h-8" src="/check-dark.png" alt="open" />
          </td>
          <td className="px-4 py-2 text-slate-600 font-semibold text-center text-lg">
            <img
              className="mx-auto w-8 h-8"
              src="/cancel-dark.png"
              alt="close"
            />
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default InvestingPlanTable;
