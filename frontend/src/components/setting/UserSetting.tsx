import { useState, useEffect } from "react";

/* Components */
import { Toggle } from "../componentProps";
import { ToastBox } from "../../components/componentProps";

/* API */
import {
  getMsgNotifySetting,
  updateMsgNotifySetting,
} from "../../services/settingUser";

/* Style */
const tableTh: string = "py-2 text-center text-lg text-gray-700";
const submitBtnHover: string =
  "hover:text-black hover:bg-white hover:border-blue-500 transition-all duration-200";

type MsgNotifySettingProps = {
  sort: number;
  label: string;
  isActive: boolean;
  frequency: number | null;
  time: string | null;
  threshold: number | null;
  isEmail: boolean;
  isLine: boolean;
};

type menuProp = {
  label: string;
  value: number;
};

const UserSetting = () => {
  /* 訊息通知設定調整 */
  const [msgNotifySetting, setMsgNotifySetting] = useState<
    MsgNotifySettingProps[]
  >([]);

  const [periodMenu, setPeriodMenu] = useState<menuProp[]>([]);
  // const [warningMenu, setWarningMenu] = useState<menuProp[]>([]);  // 兩者暫時一樣

  useEffect(() => {
    const fetchMsgNotifySetting = async () => {
      const data = await getMsgNotifySetting();
      setPeriodMenu(data.periodMenu);
      setMsgNotifySetting(
        data.content.map((item) => ({
          ...item,
          frequency: item.frequency ?? 0,
        }))
      );
    };
    fetchMsgNotifySetting();
  }, []);

  /* 更新資料狀態 */
  const updateField = (
    index: number,
    field: keyof MsgNotifySettingProps,
    value: number | string | boolean | null
  ) => {
    setMsgNotifySetting((prev) =>
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
    <div className="">
      <div className="py-2">
        <div className="flex items-center justify-between w-60 mb-2">
          <h2 className="text-2xl font-semibold mr-4">訊息通知設定</h2>
          <button
            type="button"
            className={`bg-blue-500 border text-white text-sm px-4 py-0.5 rounded-2xl ${submitBtnHover}`}
            onClick={async (e) => {
              e.preventDefault();
              try {
                await updateMsgNotifySetting(msgNotifySetting);
                showToast("訊息通知設定已成功儲存！", "success");
              } catch (error: any) {
                showToast(error.message || "儲存失敗，請稍後再試", "error");
              }
            }}
          >
            儲存
          </button>
        </div>
        <table className="table-auto w-full">
          <colgroup>
            <col className="w-[20%]" />
            <col className="w-[15%]" />
            <col className="w-[15%]" />
            <col className="w-[15%]" />
            <col className="w-[15%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
          </colgroup>
          <thead>
            <tr>
              <th className={`${tableTh} text-right`}>事件</th>
              <th className={`${tableTh}`}>是否開啟</th>
              <th className={`${tableTh}`}>通知頻率</th>
              <th className={`${tableTh}`}>通知時間</th>
              <th className={`${tableTh}`}>通知警示值</th>
              <th className={`${tableTh}`}>Email 通知</th>
              <th className={`${tableTh}`}>Line 通知</th>
            </tr>
          </thead>
          <tbody>
            {msgNotifySetting.map((row, index) => (
              <tr key={index}>
                <td className="text-right text-lg py-2">{row.label}</td>
                <td className="py-2">
                  <div className="flex items-center justify-center h-full">
                    <Toggle
                      isActive={row.isActive}
                      disabled={false}
                      onToggle={() => {
                        updateField(index, "isActive", !row.isActive);
                        updateField(index, "isEmail", !row.isActive); // 默認當啟用時, Line/Email 通知都開啟
                        updateField(index, "isLine", !row.isActive);
                      }}
                    />
                  </div>
                </td>
                <td className="text-center py-2">
                  <select
                    aria-label="frequency"
                    className="border rounded px-2 py-1"
                    value={row.frequency ?? 0}
                    onChange={(e) =>
                      updateField(
                        index,
                        "frequency",
                        parseInt(e.target.value, 10)
                      )
                    }
                    disabled={!row.isActive}
                  >
                    {periodMenu.map((item, _i) => (
                      <option value={item.value} key={_i}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="text-center py-2">
                  <input
                    placeholder="time"
                    type="time"
                    value={row.time ?? ""}
                    onChange={(e) => updateField(index, "time", e.target.value)}
                    className="border rounded px-2 py-1"
                    disabled={!msgNotifySetting[index].isActive}
                  />
                </td>
                <td className="text-center py-2">
                  {row.threshold !== null ? (
                    <div>
                      <span>{`${
                        row.label === "警示預算通知" ? "低於" : "高於"
                      }`}</span>
                      <input
                        placeholder="百分比"
                        type="number"
                        value={row.threshold}
                        disabled={!row.isActive}
                        min={0}
                        max={100}
                        onChange={(e) =>
                          updateField(
                            index,
                            "threshold",
                            parseInt(e.target.value)
                          )
                        }
                        className="text-right rounded px-2 py-1 w-16"
                      />
                      <span>%</span>
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="text-center py-2">
                  <div className="flex items-center justify-center h-full">
                    <Toggle
                      isActive={row.isEmail}
                      disabled={!row.isActive}
                      onToggle={() =>
                        updateField(index, "isEmail", !row.isEmail)
                      }
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
        {toast.show && (
          <ToastBox
            message={toast.message}
            kind={toast.kind}
            onClose={() => setToast({ ...toast, show: false })}
          />
        )}
      </div>
      <div className="py-2">
        <div className="flex items-center justify-between w-60 mb-2">
          <h2 className="text-2xl font-semibold mr-4">帳號設定</h2>
          <button
            type="button"
            className={`bg-blue-500 border text-white text-sm px-4 py-0.5 rounded-2xl ${submitBtnHover}`}
          >
            儲存
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSetting;
