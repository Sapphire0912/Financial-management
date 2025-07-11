import { useState, useEffect } from "react";

/* Components */
import { Toggle } from "../componentProps";
import { ToastBox } from "../componentProps";

/* API */
import {
  getPlanSetting,
  updatePlanSetting,
} from "../../services/investingUser";

/* Style */
const tableTh: string = "py-2 text-lg text-gray-700";
const submitBtnHover: string =
  "hover:text-black hover:bg-white hover:border-blue-500 transition-all duration-200";

type PlanSettingProps = {
  sort: number;
  label: string;
  isActive: boolean;
  frequency: number | null;
  reach_time: string | null;
  threshold: number | null;
  isEmail: boolean;
  isLine: boolean;
};

type menuProp = {
  label: string;
  value: number;
};

const InvestingPlanTable = () => {
  /* 理財計畫表格資料設定 */
  const [planSetting, setPlanSetting] = useState<PlanSettingProps[]>([]);
  const [periodMenu, setPeriodMenu] = useState<menuProp[]>([]);

  useEffect(() => {
    const fetchPlanSetting = async () => {
      const data = await getPlanSetting();
      setPeriodMenu(data.periodMenu);
      setPlanSetting(data.content);
      console.log(data.content);
    };
    fetchPlanSetting();
  }, []);

  /* 更新資料狀態 */
  const updateField = (
    index: number,
    field: keyof PlanSettingProps,
    value: number | string | boolean | null
  ) => {
    setPlanSetting((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

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
    <div className="py-2">
      <div className="flex items-center justify-between w-60 mb-2">
        <h2 className="text-2xl font-semibold mr-4">計畫項目</h2>
        <button
          type="button"
          className={`bg-blue-500 border text-white text-sm px-4 py-0.5 rounded-2xl ${submitBtnHover}`}
          onClick={async (e) => {
            e.preventDefault();
            try {
              showToast("計畫項目設定已成功儲存！", "success");
            } catch (error: any) {
              showToast(error.message || "儲存失敗，請稍後再試", "error");
            }
          }}
        >
          儲存
        </button>
      </div>
      <table className="table-auto w-full">
        {/* 調整每個欄位的寬度 */}
        <colgroup>
          <col className="w-[40%]" />
          <col className="w-[20%]" />
          <col className="w-[20%]" />
          <col className="w-[20%]" />
        </colgroup>
        <thead>
          <tr>
            <th className={`${tableTh} text-right`}>事件</th>
            <th className={`${tableTh} text-center`}>是否開啟</th>
            <th className={`${tableTh} text-center`}>Email 通知</th>
            <th className={`${tableTh} text-center`}>Line 通知</th>
          </tr>
        </thead>
        <tbody>
          {planSetting.map((row, index) => (
            <tr key={index}>
              {row.sort === 0 ? (
                <td className="flex items-center justify-end py-2">
                  <select
                    className="bg-slate-100 border border-gray-300 rounded-lg px-2 py-1 shadow-sm transition-all duration-150 hover:cursor-pointer"
                    aria-label="budget_setting_menu"
                  >
                    {periodMenu.map((option_item, _i) => (
                      <option value={option_item.value} key={_i}>
                        {option_item.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-right text-lg py-2 mx-4">{row.label}</p>
                  <input
                    placeholder="金額"
                    type="number"
                    value={row.threshold ?? 0}
                    min={0}
                    className="border-b border-gray-800 text-right px-2 py-1 w-16 focus:outline-none focus:border-b-black"
                    onChange={(e) =>
                      updateField(
                        index,
                        "threshold",
                        parseInt(e.target.value, 10)
                      )
                    }
                  />
                </td>
              ) : (
                <td className="flex items-center justify-end py-2">
                  <input
                    placeholder="date"
                    type="date"
                    value={row.reach_time ?? ""}
                    className=""
                    onChange={(e) =>
                      updateField(index, "reach_time", e.target.value)
                    }
                  />
                  <p className="text-right text-lg py-2 mx-4">
                    {row.label}達到⭢$
                  </p>
                  <input
                    placeholder="金額"
                    type="number"
                    value={row.threshold ?? 0}
                    min={0}
                    className="border-b border-gray-800 text-right px-2 py-1 w-16 focus:outline-none focus:border-b-black"
                    onChange={(e) =>
                      updateField(
                        index,
                        "threshold",
                        parseInt(e.target.value, 10)
                      )
                    }
                  />
                </td>
              )}
              <td className="py-2">
                <div className="flex items-center justify-center h-full">
                  <Toggle
                    isActive={row.isActive}
                    disabled={false}
                    onToggle={() => {
                      updateField(index, "isActive", !row.isActive);
                    }}
                  />
                </div>
              </td>
              <td className="text-center py-2">
                <div className="flex items-center justify-center h-full">
                  <Toggle
                    isActive={row.isEmail}
                    disabled={!row.isActive}
                    onToggle={() => updateField(index, "isEmail", !row.isEmail)}
                  />
                </div>
              </td>
              <td className="text-center py-2">
                <div className="flex items-center justify-center h-full">
                  <Toggle
                    isActive={row.isLine}
                    disabled={!row.isActive}
                    onToggle={() => updateField(index, "isLine", !row.isLine)}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InvestingPlanTable;
