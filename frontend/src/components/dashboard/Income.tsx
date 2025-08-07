import { useState, useEffect } from "react";

/* API */
import { getUserIncome } from "../../services/dashboardUser";

// MyIncome Components
type IncomeInfoCardProps = {
  iconSrc: string;
  label: string;
  value: string;
  valueColor?: string;
};

const IncomeInfoCard: React.FC<IncomeInfoCardProps> = ({
  iconSrc,
  label,
  value,
  valueColor = "text-gray-800",
}) => {
  return (
    <div className="bg-slate-100 border border-slate-400 rounded-full py-1 pl-2 pr-4 my-1 mr-4 shadow-sm w-fit">
      <div className="flex items-center text-sm space-x-2">
        <img src={iconSrc} className="w-4 h-4 opacity-70" alt={iconSrc} />
        <span>{label}</span>
        <span className={`ml-auto font-semibold ${valueColor}`}>{value}</span>
      </div>
    </div>
  );
};

type MyIncomeProps = {
  menu: string[];
};

const MyIncome = ({ menu }: MyIncomeProps) => {
  /* 收入資訊 */
  const [selectMenu, setSelectMenu] = useState<string>("");
  const [incomeInfo, setIncomeInfo] = useState({
    total_income: 0,
    incr_percent: 0.0,
    incr_income: 0,
    total_salary: 0,
    total_bouns: 0,
    others: 0,
  });

  useEffect(() => {
    if (menu.length > 0 && !selectMenu) {
      setSelectMenu(menu[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menu]);

  // 根據選擇項目請求後端
  useEffect(() => {
    if (selectMenu === "" || !selectMenu) return; // 確保 selectMenu 有值才執行

    const fetchIncomeInfo = async () => {
      try {
        const data = await getUserIncome(selectMenu);
        setIncomeInfo({
          total_income: data.total_income,
          incr_percent: data.incr_percent,
          incr_income: data.incr_income,
          total_salary: data.total_salary,
          total_bouns: data.total_bouns,
          others: data.others,
        });
      } catch (err) {
        console.error("取得收入資料失敗", err);
      }
    };

    fetchIncomeInfo();
  }, [selectMenu]);

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="py-2 flex items-center justify-between">
        <h3 className="font-semibold text-xl">我的收入</h3>
        <select
          className="bg-slate-100 border border-gray-300 text-sm rounded-lg px-3 py-1 shadow-sm transition-all duration-150 hover:cursor-pointer"
          aria-label="時間範圍"
          value={selectMenu}
          onChange={(e) => setSelectMenu(e.target.value)}
        >
          {menu.map((item, index) => (
            <option value={item} key={"income" + item + index}>
              {item}
            </option>
          ))}
        </select>
      </div>
      <div className="py-2">
        <h4 className="font-bold text-gray-600 py-0.5">全部收入</h4>
        <h1 className="font-bold text-4xl">{`$ ${incomeInfo.total_income}`}</h1>
      </div>

      <div className="flex">
        <IncomeInfoCard
          iconSrc="/dashboard-arpu-dark.png"
          label="成長率"
          value={`${incomeInfo.incr_percent >= 0 ? "+" : ""}${
            incomeInfo.incr_percent
          }%`}
          valueColor={`${
            incomeInfo.incr_percent >= 0 ? "text-emerald-500" : "text-red-500"
          } `}
        />
        <IncomeInfoCard
          iconSrc="/dashboard-bonus-dark.png"
          label="成長金額"
          value={`${incomeInfo.incr_income >= 0 ? "+$" : "-$"}${
            Math.abs(incomeInfo.incr_income)
          }`}
          valueColor={`${
            incomeInfo.incr_income >= 0 ? "text-emerald-500" : "text-red-500"
          } `}
        />
      </div>

      <div className="mt-4 py-1 grid grid-cols-3">
        <div className="col-span-1 border-l-4 border-blue-300 px-2 rounded-s-md">
          <p className="font-semibold text-gray-700 py-1">薪資</p>
          <span>{`$ ${incomeInfo.total_salary}`}</span>
        </div>
        <div className="col-span-1 border-l-4 border-green-200 px-2 rounded-s-md">
          <p className="font-semibold text-gray-700 py-1">獎金</p>
          <span>{`$ ${incomeInfo.total_bouns}`}</span>
        </div>
        <div className="col-span-1 border-l-4 border-orange-200 px-2 rounded-s-md">
          <p className="font-semibold text-gray-700 py-1">其他</p>
          <span>{`$ ${incomeInfo.others}`}</span>
        </div>
      </div>
    </div>
  );
};

export default MyIncome;
