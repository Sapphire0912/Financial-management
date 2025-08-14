/* CSS */
import "../../styles/component.css";

/* API */
import { getMonthlyBalance } from "../../services/dashboardUser";

/* Hooks */
import { useState, useEffect } from "react";

// API Type
type RemainingInfo = {
  reduce_budget: number;
  expect_expense_per_day: number;
  expense_per_day: number;
  top_expense_data: TopExpenseData[];
};

type TopExpenseData = {
  kind: string;
  percent: number;
  total_expense: number;
  necessary: number;
  want: number;
};

// My Remaining Components
type RemainingInfoCardProps = {
  iconSrc: string;
  label: string;
  value: string;
  valueColor?: string;
};

const RemainingInfo: React.FC<RemainingInfoCardProps> = ({
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

/* 柱狀圖 Components */
type ExpenseTopInfoProps = {
  expenseType: string;
  expensePercent: string;
  expenseValue: string;
  necessaryExpenseValue: string;
  wantToExpenseValue: string;
  barColor: string;
  height?: string;
  isShowDetail?: boolean;
};

const ExpenseTopInfo: React.FC<ExpenseTopInfoProps> = ({
  expenseType,
  expensePercent,
  expenseValue,
  necessaryExpenseValue,
  wantToExpenseValue,
  barColor,
  height = "220px",
  isShowDetail = false,
}) => {
  const necessaryPercent: number = Math.round(
    (Number(necessaryExpenseValue) / Number(expenseValue)) * 100
  );

  return (
    <div
      className="rounded-xl bg-slate-300/40 p-2 flex flex-col justify-between "
      style={{ height }}
    >
      <div className={`w-full h-4 rounded-full ${barColor} mb-4`} />
      <div
        className={`${barColor} rounded-lg p-2 text-white flex flex-col justify-between h-full`}
      >
        <div>
          <p className="text-xl font-bold">{expensePercent}%</p>
          <p className="text-base font-semibold">${expenseValue}</p>
          <p className="text-base">{expenseType}</p>
        </div>
        {isShowDetail && (
          <div className="mt-2">
            <div className="flex justify-between text-sm font-semibold mb-1">
              <span>${necessaryExpenseValue}</span>
              <span>${wantToExpenseValue}</span>
            </div>

            <div className="relative w-full h-3 bg-white/30 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-white rounded-full"
                style={{ width: `${necessaryPercent}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MyRemaining = () => {
  const [remainingInfo, setRemainingInfo] = useState<any>(null);

  useEffect(() => {
    const fetchRemainingInfo = async () => {
      const remainingInfo = await getMonthlyBalance();
      setRemainingInfo(remainingInfo);
    };
    fetchRemainingInfo();
  }, []);

  if (!remainingInfo) return <div>Loading...</div>;

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="py-2 flex items-center justify-between">
        <h3 className="font-semibold text-xl">本月餘額</h3>
        <div className="flex items-center hover:border-b hover:border-black transition duration-150 mx-2">
          <a href="/investing">預算設定</a>
          <img
            src="/dashboard-arrow-dark.png"
            alt="arrow"
            className="w-4 h-4 ml-1"
          />
        </div>
      </div>

      <div className="flex items-end">
        <h1 className="font-bold text-5xl mr-1">
          {remainingInfo.reduce_budget}
        </h1>
        <span className="text-3xl text-gray-700">%</span>
      </div>

      <div className="flex mt-4">
        <RemainingInfo
          iconSrc="/dashboard-expect-dark.png"
          label="預期每日支出"
          value={`$${remainingInfo.expect_expense_per_day}`}
          valueColor="text-emerald-500"
        />
        <RemainingInfo
          iconSrc="/dashboard-expense-daily-dark.png"
          label="平均每日支出"
          value={`$${remainingInfo.expense_per_day}`}
          valueColor="text-red-500"
        />
      </div>

      {remainingInfo.top_expense_data.length > 0 ? (
        <div className="mt-4 grid grid-cols-3 gap-2 items-end">
          {remainingInfo.top_expense_data.map(
            (item: TopExpenseData, index: number) => (
              <ExpenseTopInfo
                expenseType={item.kind}
                expensePercent={item.percent.toString()}
                expenseValue={item.total_expense.toString()}
                necessaryExpenseValue={item.necessary.toString()}
                wantToExpenseValue={item.want.toString()}
                barColor={
                  index === 0
                    ? "bg-green-900"
                    : index === 1
                    ? "bg-green-700"
                    : "bg-green-500"
                }
                height={index === 0 ? "240px" : index === 1 ? "200px" : "160px"}
                isShowDetail={index !== 2}
              />
            )
          )}
        </div>
      ) : (
        <div className="mt-4 min-h-[15rem] flex items-center justify-center">
          <p className="text-gray-500">目前沒有支出資料</p>
        </div>
      )}
    </div>
  );
};

export default MyRemaining;
