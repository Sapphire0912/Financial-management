/* CSS */
import "../../styles/component.css";

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
      <div className={`w-full h-2 rounded-full ${barColor} mb-3`} />

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
        <h1 className="font-bold text-5xl mr-1">75.40</h1>
        <span className="text-3xl text-gray-700">%</span>
      </div>

      <div className="flex mt-4">
        <RemainingInfo
          iconSrc="/dashboard-expect-dark.png"
          label="預期每日支出"
          value="$2,000"
          valueColor="text-emerald-500"
        />
        <RemainingInfo
          iconSrc="/dashboard-expense-daily-dark.png"
          label="平均每日支出"
          value="$368"
          valueColor="text-red-500"
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 items-end">
        <ExpenseTopInfo
          expenseType="食"
          expensePercent="60"
          expenseValue="8000"
          necessaryExpenseValue="5000"
          wantToExpenseValue="3,000"
          barColor="bg-green-900"
          height="240px"
          isShowDetail={true}
        />
        <ExpenseTopInfo
          expenseType="教育"
          expensePercent="50"
          expenseValue="7000"
          necessaryExpenseValue="3500"
          wantToExpenseValue="3500"
          barColor="bg-green-700"
          height="180px"
        />
        <ExpenseTopInfo
          expenseType="娛樂"
          expensePercent="30"
          expenseValue="5000"
          necessaryExpenseValue="1500"
          wantToExpenseValue="3500"
          barColor="bg-green-500"
          height="120px"
        />
      </div>
    </div>
  );
};

export default MyRemaining;
